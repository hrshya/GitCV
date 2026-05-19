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

githubRouter.post("/", async (req, res) => {
  try {
    const { username, jobDescription, resumeData } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // ---------- GITHUB FETCH ----------

    const userResponse = await axios.get(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const repoResponse = await axios.get(
      `https://api.github.com/users/${username}/repos`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let user = await prisma.user.findUnique({
      where: {
        githubUsername: username,
      },
    });

    let rankedRepos;

    if (!user) {
      user = await prisma.user.create({
        data: {
          githubUsername: username,
          name: userResponse.data.name,
          email: userResponse.data.email,
        },
      });

      rankedRepos = await RankingSystem(
        repoResponse.data,
        username
      );

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
        await prisma.repoCache.create({
          data: {
            userId: user.id,
            repoName: ranked.project_name,
            score: ranked.score,
            metadata: metadata,
          },
        });
      }
    }

    if(!rankedRepos) {
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
    }
    
    // ---------- LLM RESPONSE ----------

    let response;

    if (rankedRepos.length > 0) {
      response = await geminiResponse(
        rankedRepos,
        jobDescription || "",
        resumeData || ""
      );

      if (response) response = JSON.parse(response);
      let userCache = await prisma.userCache.findUnique({
        where: {
          userId: user.id,
        },
      });

      if(!userCache) {
        let temp = {
          name: response.user.name,
          contact: response.user.contact,
          experience: response.experience,
          education: response.education,
          skills: response.skills,
        }
        await prisma.userCache.create({
          data: {
            userId: user.id,
            details: temp,
          },
        });
      }
    }

    // ---------- RESUME MARKDOWN ----------

    let resumeMarkdown = generateMarkdownResume({
      name: userResponse.data.name || username,

      contact: response.user.contact || "",

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

    await prisma.resume.create({
      data: {
        userId: user.id,
        markdown: resumeMarkdown,
      },
    });

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
