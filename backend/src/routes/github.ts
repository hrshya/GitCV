import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import RankingSystem from "../function/rankingSys.ts";
import { geminiResponse } from "../function/openAi.ts";
import { generateMarkdownResume } from "../function/markDown.ts";
import fs from "fs";
import { markdownToPDF } from "../function/generatePDF.ts";

dotenv.config();

export const githubRouter = express.Router();

const token = process.env.GITHUB_TOKEN;

githubRouter.get("/", async (req, res) => {
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

    // ---------- RANK REPOS ----------

    const rankedRepos = await RankingSystem(
      repoResponse.data,
      username
    );

    // ---------- LLM RESPONSE ----------

    let response;

    if (rankedRepos.length > 0) {
      response = await geminiResponse(
        rankedRepos,
        jobDescription || "",
        resumeData || ""
      );

      if (response) response = JSON.parse(response);
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
