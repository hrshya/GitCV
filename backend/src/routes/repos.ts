import express from 'express';
import { prisma } from '../db.js';
import RankingSystem from '../function/rankingSys.js';
import axios from 'axios';
import { configDotenv } from 'dotenv';

configDotenv();
const token = process.env.GITHUB_TOKEN;
const githubHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

export const repoRouter = express.Router();

repoRouter.post('/rank', async (req, res) => {
    try {
        const { username } = req.body;
        let rankedRepos: any[] = [];
        let user: any = null;

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        const userResponse = await axios
            .get(`https://api.github.com/users/${username}`, githubHeaders ? { headers: githubHeaders } : {})
            .catch(() => null);

        try {
            user = await prisma.user.findUnique({
                where: {
                    githubUsername: username,
                },
            });
        } catch (dbErr) {
            console.error("Prisma find user failed:", dbErr);
        }

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

            const repoResponse = await axios
                .get(`https://api.github.com/users/${username}/repos`, githubHeaders ? { headers: githubHeaders } : {})
                .catch(() => ({ data: [] }));
                        
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

        res.json({ msg: "Repositories ranked successfully", rankedRepos });
            
    } catch (error) {
        res.status(500).json({ error: 'Failed to rank repositories' });
    }
});