import path from "path";
import fs from "fs";
import express from "express";
import { prisma } from "../db.js";
import { markdownToPDF } from "../function/generatePDF.js";
import { recordResumeDownload, type ResumeDownloadOwner } from "../function/downloadAnalyticsStore.js";
import multer from "multer";


const generatedResumeRoot = path.resolve("generated", "resumes");
export const resumeRetentionMs = 24 * 60 * 60 * 1000;

type UploadedFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

type ResumeMetadata = ResumeDownloadOwner & {
  createdAt: string;
  expiresAt?: string;
};


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


export function getUploadedResumeFile(req: express.Request): UploadedFile | undefined {
  const files = req.files as Record<string, UploadedFile[] | undefined> | undefined;

  return files?.resumePdf?.[0] || files?.resume?.[0] || files?.resumeFile?.[0];
}

export function getResumePaths(resumeId: string) {
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

export function getSafeResumeFileName(name: unknown): string {
  const rawName = typeof name === "string" ? name.trim() : "";
  const safeName = rawName
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");

  return `${safeName || "Candidate"}_Resume.pdf`;
}

export function writeResumeMetadata(metadata: ResumeMetadata) {
  const { metadataPath, resumeDir } = getResumePaths(metadata.resumeId);
  fs.mkdirSync(resumeDir, { recursive: true });
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

export function readResumeMetadata(resumeId: string): ResumeMetadata | null {
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

export function getResumeExpiresAt(createdAt: string, expiresAt?: string) {
  if (expiresAt) {
    return expiresAt;
  }

  const createdMs = new Date(createdAt).getTime();
  const baseMs = Number.isFinite(createdMs) ? createdMs : Date.now();
  return new Date(baseMs + resumeRetentionMs).toISOString();
}

export async function readStoredResume(resumeId: string) {
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


export async function getResumeDownloadOwner(resumeId: string): Promise<ResumeDownloadOwner> {
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

export async function hasStoredResume(resumeId: string): Promise<boolean> {
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

export async function updateStoredResumeMarkdown(resumeId: string, markdown: string) {
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

export async function ensureResumePdf(resumeId: string, markdownOverride?: string) {
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

export function isExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

export async function downloadResumeById(
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

export function handleResumeUpload(
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
