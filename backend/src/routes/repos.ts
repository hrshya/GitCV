import express from 'express';
import { prisma } from '../db.js';
import RankingSystem from '../function/rankingSys.js';
import axios from 'axios';
import { configDotenv } from 'dotenv';
import { getAuth } from '@clerk/express';

configDotenv();
const token = process.env.GITHUB_TOKEN;
const githubHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

export const repoRouter = express.Router();

repoRouter.post('/rank', async (req, res) => {
    try {
        let { userId } = getAuth(req);

        const { username } = req.body;
        let rankedRepos: any[] = [];
        let user: any = null;

        if(!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        try {
            user = await prisma.user.findUnique({
                where: {
                    clerkUserId: userId,
                },
            });
        } catch (dbErr) {
            console.error("Prisma find user failed:", dbErr);
        }

        if (!user) {
            try {
                user = await prisma.user.update({
                    where: {
                        clerkUserId: userId
                    },
                    data: {
                        githubUsername: username,
                    },
                });
            } catch (dbErr) {
                console.error("Prisma update user failed:", dbErr);
                return res.status(500).json({ error: 'Failed to update user with GitHub username' });
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
