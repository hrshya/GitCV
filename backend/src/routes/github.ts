import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import { randomUUID } from "crypto";
import RankingSystem from "../function/rankingSys.js";
import { geminiResponse } from "../function/openAi.js";
import { generateMarkdownResume } from "../function/markDown.js";
import { prisma } from "../db.js";
import { extractTextFromPdf } from "../function/pdfParser.js";
import {
  refundResumeGeneration,
  reserveResumeGeneration,
} from "../function/rateLimitStore.js";
import type { RateLimitReservation as DailyRateLimitReservation } from "../function/rateLimitStore.js";
import { downloadResumeById, ensureResumePdf, getResumeDownloadOwner, getResumePaths, getSafeResumeFileName, getUploadedResumeFile, handleResumeUpload, isExpired, readStoredResume, resumeRetentionMs, updateStoredResumeMarkdown, writeResumeMetadata } from "../controllers/resumeOps.js";

dotenv.config();
export const githubRouter = express.Router();
const token = process.env.GITHUB_TOKEN;
const githubHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;
let idx = 0;


type RateLimitSubject = {
  key: string;
  label: string;
};

type RateLimitReservation = {
  result: DailyRateLimitReservation;
  subject: RateLimitSubject;
};

function getStringInput(value: unknown): string {
  if (Array.isArray(value)) {
    return getStringInput(value[0]);
  }

  return typeof value === "string" ? value : "";
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

githubRouter.post("/", handleResumeUpload, async (req, res) => {
  const reservations: RateLimitReservation[] = [];
  let generationCompleted = false;

  const start = performance.now();
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

    let rankedRepos: any[] = [];

    user = {
      id: idx++,
      githubUsername: username,
      name: userResponse?.data?.name || username,
      email: userResponse?.data?.email || null,
    };

      rankedRepos = await RankingSystem(
        repoResponse?.data || [],
        username
      );

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

    const duration = (performance.now() - start) / 1000;
    console.log(`Resume generation for ${username} completed in ${duration.toFixed(2)} seconds`);

    res.status(200).json({
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
