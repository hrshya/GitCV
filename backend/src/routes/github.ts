import express from "express";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";
import RankingSystem from "../function/rankingSys.ts";
import { geminiResponse } from "../function/openAi.ts";
import { generateMarkdownResume } from "../function/markDown.ts";
import fs from "fs";
import { markdownToPDF } from "../function/generatePDF.ts";
import { prisma } from "../db.ts";

dotenv.config();

export const githubRouter = express.Router();

const token = process.env.GITHUB_TOKEN;
const githubHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

githubRouter.post("/", async (req, res) => {
  try {
    const { username, jobDescription, resumeData } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
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
          }));
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

    if (user?.id) {
      try {
        await prisma.resume.create({
          data: {
            userId: user.id,
            markdown: resumeMarkdown,
          },
        });
      } catch (resumeErr) {
        console.error("Prisma resume write failed:", resumeErr);
      }
    }

    // ---------- SAVE FILE ----------
    fs.writeFileSync("resume.md", resumeMarkdown);
    markdownToPDF("resume.md", "resume.pdf");

    res.json({
      response,
      resumeMarkdown,
    });
  } catch (error: any) {
    console.error(error.message);

    res.status(500).json({
      error: "Failed to generate resume",
    });
  }
});

githubRouter.get("/download", async (req, res) => {
  const filePath = path.resolve("resume.pdf");
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "PDF not found" });
  }
  res.download(filePath, "gitcv-resume.pdf", (err) => {
    if (err) {
      console.error("Download error:", err);
    }
  });
});
