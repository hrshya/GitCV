import express from "express";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";
import { randomUUID } from "node:crypto";
import RankingSystem from "../function/rankingSys.js";
import { geminiResponse } from "../function/openAi.js";
import { generateMarkdownResume } from "../function/markDown.js";
import fs from "fs";
import { markdownToPDF } from "../function/generatePDF.js";
import { prisma } from "../db.js";
import { extractTextFromPdf } from "../function/pdfParser.js";
import {
  getDownloadAnalytics,
  getUserDownloadAnalytics,
  recordResumeDownload,
} from "../function/downloadAnalyticsStore.js";
import type { ResumeDownloadOwner } from "../function/downloadAnalyticsStore.js";
import {
  refundResumeGeneration,
  reserveResumeGeneration,
} from "../function/rateLimitStore.js";
import type { RateLimitReservation as DailyRateLimitReservation } from "../function/rateLimitStore.js";

dotenv.config();

export const githubRouter = express.Router();

const token = process.env.GITHUB_TOKEN;
const githubHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;
const generatedResumeRoot = path.resolve("generated", "resumes");
const resumeRetentionMs = 24 * 60 * 60 * 1000;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      callback(new Error("Resume upload must be a PDF file"));
      return;
    }

    callback(null, true);
  },
});

type UploadedFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

type RateLimitSubject = {
  key: string;
  label: string;
};

type RateLimitReservation = {
  result: DailyRateLimitReservation;
  subject: RateLimitSubject;
};

type ResumeMetadata = ResumeDownloadOwner & {
  createdAt: string;
  expiresAt?: string;
};

function getStringInput(value: unknown): string {
  if (Array.isArray(value)) {
    return getStringInput(value[0]);
  }

  return typeof value === "string" ? value : "";
}

function getUploadedResumeFile(req: express.Request): UploadedFile | undefined {
  const files = req.files as Record<string, UploadedFile[] | undefined> | undefined;

  return files?.resumePdf?.[0] || files?.resume?.[0] || files?.resumeFile?.[0];
}

function getResumePaths(resumeId: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(resumeId)) {
    throw new Error("Invalid resume id");
  }

  const resumeDir = path.resolve(generatedResumeRoot, resumeId);
  if (!resumeDir.startsWith(generatedResumeRoot)) {
    throw new Error("Invalid resume output path");
  }

  return {
    resumeDir,
    metadataPath: path.join(resumeDir, "metadata.json"),
    markdownPath: path.join(resumeDir, "resume.md"),
    pdfPath: path.join(resumeDir, "resume.pdf"),
  };
}

function getSafeResumeFileName(name: unknown): string {
  const rawName = typeof name === "string" ? name.trim() : "";
  const safeName = rawName
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");

  return `${safeName || "Candidate"}_Resume.pdf`;
}

function getClientIp(req: express.Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  const rawIp: string = (forwardedValue || req.ip || req.socket.remoteAddress || "unknown") as string;

  // @ts-ignore
  return rawIp.split(",")[0].trim().replace(/^::ffff:/, "") || "unknown";
}

function getRateLimitSubjects(req: express.Request, username: string): RateLimitSubject[] {
  return [
    {
      key: `github:${username.toLowerCase()}`,
      label: "GitHub username",
    },
    {
      key: `ip:${getClientIp(req)}`,
      label: "IP address",
    },
  ];
}

function refundReservations(reservations: RateLimitReservation[]) {
  for (const reservation of reservations) {
    if (reservation.result.reserved) {
      refundResumeGeneration(reservation.subject.key);
    }
  }
}

function writeResumeMetadata(metadata: ResumeMetadata) {
  const { metadataPath, resumeDir } = getResumePaths(metadata.resumeId);
  fs.mkdirSync(resumeDir, { recursive: true });
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

function readResumeMetadata(resumeId: string): ResumeMetadata | null {
  try {
    const { metadataPath } = getResumePaths(resumeId);

    if (!fs.existsSync(metadataPath)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(metadataPath, "utf8")) as ResumeMetadata;
  } catch (error) {
    console.error("Resume metadata read failed:", error);
    return null;
  }
}

function getResumeExpiresAt(createdAt: string, expiresAt?: string) {
  if (expiresAt) {
    return expiresAt;
  }

  const createdMs = new Date(createdAt).getTime();
  const baseMs = Number.isFinite(createdMs) ? createdMs : Date.now();
  return new Date(baseMs + resumeRetentionMs).toISOString();
}

function isExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

async function readStoredResume(resumeId: string) {
  const { markdownPath, pdfPath } = getResumePaths(resumeId);
  const metadata = readResumeMetadata(resumeId);
  let markdown = fs.existsSync(markdownPath) ? fs.readFileSync(markdownPath, "utf8") : "";
  let owner: ResumeDownloadOwner = metadata
    ? {
        githubUsername: metadata.githubUsername,
        name: metadata.name ?? null,
        resumeId,
        userId: metadata.userId ?? null,
      }
    : {
        githubUsername: "unknown",
        name: null,
        resumeId,
        userId: null,
      };
  let createdAt = metadata?.createdAt || new Date().toISOString();

  if (!markdown || !metadata) {
    try {
      const resume = await prisma.resume.findUnique({
        where: {
          id: resumeId,
        },
        include: {
          user: true,
        },
      });

      if (resume) {
        markdown = markdown || resume.markdown;
        createdAt = metadata?.createdAt || resume.createdAt.toISOString();
        owner = {
          githubUsername: resume.user?.githubUsername || metadata?.githubUsername || "unknown",
          name: metadata?.name ?? resume.user?.name ?? null,
          resumeId,
          userId: metadata?.userId ?? resume.userId ?? null,
        };
      }
    } catch (dbErr) {
      console.error("Prisma resume read failed:", dbErr);
    }
  }

  if (!markdown) {
    return null;
  }

  const expiresAt = getResumeExpiresAt(createdAt, metadata?.expiresAt);

  return {
    downloadUrl: `/api/v1/github/download/${resumeId}`,
    expiresAt,
    metadata: {
      ...owner,
      createdAt,
      expiresAt,
    },
    pdfReady: fs.existsSync(pdfPath),
    pdfUrl: `/api/v1/github/resumes/${resumeId}/pdf`,
    resultUrl: `/resume/${resumeId}`,
    resumeId,
    resumeMarkdown: markdown,
  };
}

async function getResumeDownloadOwner(resumeId: string): Promise<ResumeDownloadOwner> {
  const metadata = readResumeMetadata(resumeId);

  if (metadata) {
    return {
      githubUsername: metadata.githubUsername,
      name: metadata.name ?? null,
      resumeId,
      userId: metadata.userId ?? null,
    };
  }

  try {
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
      },
      include: {
        user: true,
      },
    });

    if (resume?.user) {
      return {
        githubUsername: resume.user.githubUsername || "unknown",
        name: resume.user.name ?? null,
        resumeId,
        userId: resume.user.id ?? null,
      };
    }
  } catch (dbErr) {
    console.error("Prisma resume owner lookup failed:", dbErr);
  }

  return {
    githubUsername: "unknown",
    name: null,
    resumeId,
    userId: null,
  };
}

async function hasStoredResume(resumeId: string): Promise<boolean> {
  try {
    const { markdownPath } = getResumePaths(resumeId);

    if (readResumeMetadata(resumeId) || fs.existsSync(markdownPath)) {
      return true;
    }

    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
      },
      select: {
        id: true,
      },
    });

    return Boolean(resume);
  } catch {
    return false;
  }
}

async function updateStoredResumeMarkdown(resumeId: string, markdown: string) {
  const { markdownPath, pdfPath, resumeDir } = getResumePaths(resumeId);
  fs.mkdirSync(resumeDir, { recursive: true });
  fs.writeFileSync(markdownPath, markdown);

  if (fs.existsSync(pdfPath)) {
    fs.unlinkSync(pdfPath);
  }

  try {
    await prisma.resume.update({
      where: {
        id: resumeId,
      },
      data: {
        markdown,
      },
    });
  } catch (dbErr) {
    console.error("Prisma resume markdown update failed:", dbErr);
  }
}

async function ensureResumePdf(resumeId: string, markdownOverride?: string) {
  const { markdownPath, pdfPath } = getResumePaths(resumeId);

  if (typeof markdownOverride === "string") {
    const markdown = markdownOverride.trim();

    if (!markdown) {
      throw new Error("Markdown is required");
    }

    if (!(await hasStoredResume(resumeId))) {
      throw new Error("Resume not found");
    }

    await updateStoredResumeMarkdown(resumeId, markdown);
    await markdownToPDF(markdownPath, pdfPath);
    return;
  }

  if (!fs.existsSync(markdownPath)) {
    const stored = await readStoredResume(resumeId);

    if (stored) {
      fs.mkdirSync(path.dirname(markdownPath), { recursive: true });
      fs.writeFileSync(markdownPath, stored.resumeMarkdown);
    }
  }

  if (!fs.existsSync(pdfPath) && fs.existsSync(markdownPath)) {
    await markdownToPDF(markdownPath, pdfPath);
  }
}

async function downloadResumeById(
  resumeId: string,
  res: express.Response,
  markdownOverride?: string
) {
  try {
    const { pdfPath } = getResumePaths(resumeId);
    const stored = await readStoredResume(resumeId);

    if (!stored) {
      return res.status(404).json({ error: "Resume not found" });
    }

    if (isExpired(stored.expiresAt)) {
      return res.status(410).json({ error: "Resume link expired" });
    }

    await ensureResumePdf(resumeId, markdownOverride);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: "PDF not found" });
    }

    const owner = await getResumeDownloadOwner(resumeId);
    const downloadStats = recordResumeDownload(owner);
    const downloadName = getSafeResumeFileName(owner.name);

    res.setHeader("X-Resume-Download-Count", String(downloadStats.resumeDownloads));
    res.setHeader("X-User-Resume-Download-Count", String(downloadStats.userDownloads));
    res.setHeader("X-Total-Resume-Downloads", String(downloadStats.totalDownloads));

    return res.download(pdfPath, downloadName, (err) => {
      if (err) {
        console.error("Download error:", err);
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid resume id";
    const status = message === "Resume not found" ? 404 : 400;
    return res.status(status).json({ error: message });
  }
}

function handleResumeUpload(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const middleware = upload.fields([
    { name: "resumePdf", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "resumeFile", maxCount: 1 },
  ]);

  middleware(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const message =
      error instanceof multer.MulterError
        ? error.code === "LIMIT_FILE_SIZE"
          ? "Resume PDF must be smaller than 8MB"
          : error.message
        : error instanceof Error
          ? error.message
          : "Invalid resume upload";

    res.status(400).json({ error: message });
  });
}

githubRouter.post("/", handleResumeUpload, async (req, res) => {
  const reservations: RateLimitReservation[] = [];
  let generationCompleted = false;

  try {
    const username = getStringInput(req.body.username).trim();
    const jobDescription = getStringInput(req.body.jobDescription);
    const resumePdf = getUploadedResumeFile(req);
    let resumeData = getStringInput(req.body.resumeData);

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    for (const subject of getRateLimitSubjects(req, username)) {
      const result = reserveResumeGeneration(subject.key);

      if (!result.allowed) {
        refundReservations(reservations);
        return res.status(429).json({
          error: `Daily resume generation limit reached for this ${subject.label}. Try again after the daily reset.`,
          limit: result.limit,
          remainingToday: result.remaining,
          resetAt: result.resetAt,
          usedToday: result.count,
        });
      }

      reservations.push({
        result,
        subject,
      });
    }

    if (resumePdf) {
      resumeData = await extractTextFromPdf(resumePdf.buffer);
    }

    // ---------- GITHUB FETCH ----------

    const userResponse = await axios
      .get(`https://api.github.com/users/${username}`, githubHeaders ? { headers: githubHeaders } : {})
      .catch(() => null);

    const repoResponse = await axios
      .get(`https://api.github.com/users/${username}/repos`, githubHeaders ? { headers: githubHeaders } : {})
      .catch(() => ({ data: [] }));

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: {
          githubUsername: username,
        },
      });
    } catch (dbErr) {
      console.error("Prisma find user failed:", dbErr);
    }

    let rankedRepos;

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            githubUsername: username,
            name: userResponse?.data?.name || username,
            email: userResponse?.data?.email || null,
          },
        });
      } catch (dbErr) {
        console.error("Prisma create user failed:", dbErr);
        user = {
          id: null,
          githubUsername: username,
          name: userResponse?.data?.name || username,
          email: userResponse?.data?.email || null,
        };
      }

      rankedRepos = await RankingSystem(
        repoResponse?.data || [],
        username
      );

      if (user?.id) {
        for (const ranked of rankedRepos) {
          const metadata = {
            summary: ranked.summary,
            stack: ranked.stack,
            key_features: ranked.key_features,
            complexity_tags: ranked.complexity_tags,
            impact_signals: ranked.impact_signals,
            structure: ranked.structure,
            highlight_hint: ranked.highlight_hint,
            architecture: ranked.architecture || [],
            resume_bullet_evidence: ranked.resume_bullet_evidence || [],
            scalability_or_performance: ranked.scalability_or_performance || [],
            evidence_confidence: ranked.evidence_confidence || 0,
          };
          try {
            await prisma.repoCache.create({
              data: {
                userId: user.id,
                repoName: ranked.project_name,
                score: ranked.score,
                metadata: metadata,
              },
            });
          } catch (cacheErr) {
            console.error("Prisma repo cache write failed:", cacheErr);
          }
        }
      }
    }

    if(!rankedRepos) {
      if (user?.id) {
        try {
          const cachedRepos = await prisma.repoCache.findMany({
            where: {
              userId: user.id,
            },
          });
          const cacheHasRepoEvidence = cachedRepos.every((cache: any) =>
            cache.metadata && "evidence_confidence" in cache.metadata
          );

          if (cachedRepos.length > 0 && cacheHasRepoEvidence) {
            rankedRepos = cachedRepos.map((cache: any) => ({
              project_name: cache.repoName,
              score: cache.score,
              summary: cache.metadata.summary,
              stack: cache.metadata.stack,
              key_features: cache.metadata.key_features,
              complexity_tags: cache.metadata.complexity_tags,
              impact_signals: cache.metadata.impact_signals,
              structure: cache.metadata.structure,
              highlight_hint: cache.metadata.highlight_hint,
              architecture: cache.metadata.architecture || [],
              resume_bullet_evidence: cache.metadata.resume_bullet_evidence || [],
              scalability_or_performance: cache.metadata.scalability_or_performance || [],
              evidence_confidence: cache.metadata.evidence_confidence || 0,
            }));
          } else {
            rankedRepos = await RankingSystem(repoResponse?.data || [], username);
          }
        } catch (cacheErr) {
          console.error("Prisma repo cache read failed:", cacheErr);
          rankedRepos = [];
        }
      } else {
        rankedRepos = [];
      }
    }
    
    // ---------- LLM RESPONSE ----------

    let response: any = null;

    if (rankedRepos.length > 0) {
      try {
        const llmRaw = await geminiResponse(
          rankedRepos,
          jobDescription || "",
          resumeData || ""
        );
        response = llmRaw ? JSON.parse(llmRaw) : null;
      } catch (llmErr) {
        console.error("LLM generation failed, using fallback response:", llmErr);
      }
    }

    if (!response || typeof response !== "object") {
      response = {
        user: {
          name: userResponse?.data?.name || username,
          contact: userResponse?.data?.html_url || `https://github.com/${username}`,
        },
        overall_summary:
          typeof resumeData === "string" && resumeData.trim().length > 0
            ? "Resume optimized with available GitHub signals and provided resume content."
            : "Resume optimized with available GitHub signals.",
        skills: {
          technologies:
            rankedRepos.flatMap((repo: any) => Array.isArray(repo.stack) ? repo.stack : []).slice(0, 12),
        },
        experience: [],
        projects: rankedRepos.slice(0, 3).map((repo: any) => ({
          project_name: repo.project_name,
          summary: repo.summary || "",
          bullet_points: [
            {
              text: repo.highlight_hint || "Built and maintained production-ready engineering systems.",
            },
          ],
          stack: repo.stack || [],
        })),
        education: [],
        achievements: [],
      };
    }

    if (user?.id) {
      let userCache: any = null;
      try {
        userCache = await prisma.userCache.findUnique({
          where: {
            userId: user.id,
          },
        });
      } catch (cacheErr) {
        console.error("Prisma user cache read failed:", cacheErr);
      }

      if(!userCache) {
        let temp = {
          name: response?.user?.name || username,
          contact: response?.user?.contact || "",
          experience: response?.experience || [],
          education: response?.education || [],
          skills: response?.skills || {},
        }
        try {
          await prisma.userCache.create({
            data: {
              userId: user.id,
              details: temp,
            },
          });
        } catch (cacheErr) {
          console.error("Prisma user cache write failed:", cacheErr);
        }
      }
    }

    // ---------- RESUME MARKDOWN ----------

    let resumeMarkdown = generateMarkdownResume({
      name: userResponse?.data?.name || username,

      contact: response?.user?.contact || userResponse?.data?.html_url || "",

      overall_summary: response?.overall_summary || "",

      skills: response?.skills || [],

      // ---------- EXPERIENCE (FROM RESUME INPUT) ----------
      experience:
        response?.experience?.map((exp: any) => ({
          company: exp.company,
          role: exp.role,
          duration: exp.duration,
          bullet_points: exp.bullet_points || [],
        })) || [],

      // ---------- PROJECTS (FROM LLM) ----------
      projects:
        response?.projects?.map((project: any) => ({
          project_name:
            project.project_name || project.name,

          bullet_points:
            (project.bullet_points || []).map((b: any) => ({
              text: b.text || b,
            })),

          stack: project.stack || [],
        })) || [],

      // ---------- EDUCATION ----------
      education:
        response?.education?.map((edu: any) => ({
          institution: edu.institution,
          degree: edu.degree,
          duration: edu.duration,
        })) || [],

      // ---------- ACHIEVEMENTS ----------
      achievements: response?.achievements || [],
    });

    // ---------- SAVE FILE ----------
    const resumeId = randomUUID();
    const { resumeDir, markdownPath } = getResumePaths(resumeId);
    fs.mkdirSync(resumeDir, { recursive: true });
    fs.writeFileSync(markdownPath, resumeMarkdown);
    const downloadUrl = `/api/v1/github/download/${resumeId}`;
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + resumeRetentionMs).toISOString();
    writeResumeMetadata({
      createdAt,
      expiresAt,
      githubUsername: username,
      name: response?.user?.name || userResponse?.data?.name || username,
      resumeId,
      userId: user?.id || null,
    });

    if (user?.id) {
      try {
        await prisma.resume.create({
          data: {
            id: resumeId,
            userId: user.id,
            markdown: resumeMarkdown,
            resumeUrl: downloadUrl,
          },
        });
      } catch (resumeErr) {
        console.error("Prisma resume write failed:", resumeErr);
      }
    }

    generationCompleted = true;
    const generationUsage = reservations.reduce(
      (usage, reservation) => ({
        dailyLimit: reservation.result.limit,
        remainingToday: Math.min(usage.remainingToday, reservation.result.remaining),
        resetAt: reservation.result.resetAt,
      }),
      {
        dailyLimit: reservations[0]?.result.limit || 5,
        remainingToday: reservations[0]?.result.remaining || 0,
        resetAt: reservations[0]?.result.resetAt || null,
      }
    );

    res.json({
      expiresAt,
      response,
      resumeMarkdown,
      resumeId,
      downloadUrl,
      pdfUrl: `/api/v1/github/resumes/${resumeId}/pdf`,
      resultUrl: `/resume/${resumeId}`,
      usage: generationUsage,
    });
  } catch (error: any) {
    if (!generationCompleted) {
      refundReservations(reservations);
    }

    console.error(error.message);

    res.status(500).json({
      error: "Failed to generate resume",
    });
  }
});

githubRouter.get("/resumes/:resumeId", async (req, res) => {
  try {
    const stored = await readStoredResume(req.params.resumeId);

    if (!stored) {
      return res.status(404).json({ error: "Resume not found" });
    }

    if (isExpired(stored.expiresAt)) {
      return res.status(410).json({ error: "Resume link expired" });
    }

    return res.json(stored);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid resume id";
    return res.status(400).json({ error: message });
  }
});

githubRouter.put("/resumes/:resumeId", async (req, res) => {
  try {
    const markdown = getStringInput(req.body.markdown).trim();

    if (!markdown) {
      return res.status(400).json({ error: "Markdown is required" });
    }

    const stored = await readStoredResume(req.params.resumeId);

    if (!stored) {
      return res.status(404).json({ error: "Resume not found" });
    }

    if (isExpired(stored.expiresAt)) {
      return res.status(410).json({ error: "Resume link expired" });
    }

    await updateStoredResumeMarkdown(req.params.resumeId, markdown);

    return res.json({
      ...stored,
      pdfReady: false,
      resumeMarkdown: markdown,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid resume id";
    return res.status(400).json({ error: message });
  }
});

githubRouter.post("/resumes/:resumeId/pdf", async (req, res) => {
  try {
    const stored = await readStoredResume(req.params.resumeId);

    if (!stored) {
      return res.status(404).json({ error: "Resume not found" });
    }

    if (isExpired(stored.expiresAt)) {
      return res.status(410).json({ error: "Resume link expired" });
    }

    const hasMarkdownOverride = Object.prototype.hasOwnProperty.call(req.body || {}, "markdown");
    const markdown = getStringInput(req.body.markdown);
    await ensureResumePdf(req.params.resumeId, hasMarkdownOverride ? markdown : undefined);

    return res.json({
      ...stored,
      pdfReady: true,
      resumeMarkdown: hasMarkdownOverride ? markdown : stored.resumeMarkdown,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid resume id";
    return res.status(400).json({ error: message });
  }
});

githubRouter.get("/resumes/:resumeId/pdf", async (req, res) => {
  try {
    const stored = await readStoredResume(req.params.resumeId);

    if (!stored) {
      return res.status(404).json({ error: "Resume not found" });
    }

    if (isExpired(stored.expiresAt)) {
      return res.status(410).json({ error: "Resume link expired" });
    }

    const { pdfPath } = getResumePaths(req.params.resumeId);
    await ensureResumePdf(req.params.resumeId);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: "PDF not found" });
    }

    const owner = await getResumeDownloadOwner(req.params.resumeId);
    const disposition = getStringInput(req.query.disposition) === "attachment" ? "attachment" : "inline";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `${disposition}; filename="${getSafeResumeFileName(owner.name)}"`);

    return res.sendFile(pdfPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid resume id";
    return res.status(400).json({ error: message });
  }
});

githubRouter.get("/analytics/downloads", (_req, res) => {
  return res.json(getDownloadAnalytics());
});

githubRouter.get("/analytics/downloads/users/:githubUsername", (req, res) => {
  return res.json(getUserDownloadAnalytics(getStringInput(req.params.githubUsername)));
});

githubRouter.get("/download/:resumeId", async (req, res) => {
  return downloadResumeById(req.params.resumeId, res);
});

githubRouter.post("/download/:resumeId", async (req, res) => {
  const markdown = getStringInput(req.body.markdown);
  return downloadResumeById(req.params.resumeId, res, markdown);
});

githubRouter.get("/download", async (req, res) => {
  const resumeId = getStringInput(req.query.resumeId);
  if (!resumeId) {
    return res.status(400).json({ error: "resumeId is required" });
  }

  return downloadResumeById(resumeId, res);
});
