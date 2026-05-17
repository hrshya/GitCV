import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import RankingSystem from "../function/rankingSys.ts";
import { geminiResponse } from "../function/openAi.ts";

dotenv.config();

export const githubRouter = express.Router();

const token = process.env.GITHUB_TOKEN;

githubRouter.get("/", async (req, res) => {
  try {
    const username = "hrshya";

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

    const rankedRepos = await RankingSystem(repoResponse.data, username);
    let response;
    if (rankedRepos.length > 0) {
      response = await geminiResponse(rankedRepos);
    }

    res.json({
      // profile: userResponse.data,
      // repos: repoResponse.data,
      // rankedRepos,
      response
    });
  } catch (error: any) {
    console.error(error.message);

    res.status(500).json({
      error: "Failed to fetch GitHub data",
    });
  }
});


