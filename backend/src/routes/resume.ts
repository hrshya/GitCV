import express from 'express';
import { extractTextFromPdf } from '../function/pdfParser.js';
import { getResumePaths, getUploadedResumeFile, handleResumeUpload } from '../controllers/resumeOps.js';
import { extractResumeJson } from '../function/geminiParse.js';
import { prisma } from '../db.js';
import { getAuth } from '@clerk/express';
import { geminiResponse } from '../function/openAi.js';
import { generateMarkdownResume } from '../function/markDown.js';
import { markdownToPDF } from '../function/generatePDF.js';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { uploadPDFToR2 } from '../lib/uploadToR2.js';

export const resumeRouter = express.Router();

resumeRouter.post('/upload', handleResumeUpload, async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const resumePdf = getUploadedResumeFile(req);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if(!resumePdf) {
            return res.status(400).json({ error: 'No resume file uploaded' });
        }

        let resumeData = await extractTextFromPdf(resumePdf.buffer);
        let resumeJson = await extractResumeJson(resumeData);

        await prisma.user.update({
            where: { clerkUserId: userId },
            data: {
                personalDetails: resumeJson || {},
            },
        });

        res.status(200).json({ 
            message: 'Resume uploaded successfully',
            resumeData,
            resumeJson
        });
    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ error: 'Failed to upload resume' });
    }
});


resumeRouter.post('/generate/:id', async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { id } = req.params;
        const jobId = Number(id);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!jobId) {
            return res.status(400).json({ error: 'No jobId or job description provided' });
        }

        let user = await prisma.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user || !user.personalDetails) {
            return res.status(404).json({ error: 'User or personal details not found' });
        }

        let resumeJson = user.personalDetails;

        let cachedRepos = await prisma.repoCache.findMany({
            where: { userId: user.id },
        });

        // if (cachedRepos.length==0 || !cachedRepos) {
        //     return res.status(404).json({ error: 'No cached repositories found for user' });
        // }

        let rankedRepos = cachedRepos.map((cache: any) => ({
            project_name: cache.repoName,
            score: cache.score,
            summary: cache.metadata?.summary,
            stack: cache.metadata?.stack,
            key_features: cache.metadata?.key_features,
            complexity_tags: cache.metadata?.complexity_tags,
            impact_signals: cache.metadata?.impact_signals,
            structure: cache.metadata?.structure,
            highlight_hint: cache.metadata?.highlight_hint,
        }));

        let job = await prisma.job.findUnique({
            where: {
                id: jobId
            }
        })

        let jobDescription = job?.content?.toString();

        if(!jobDescription) {
            return res.status(500).json({
                msg: "job description not found"
            })
        }


        const rawllm = await geminiResponse(rankedRepos, jobDescription, resumeJson || null);
        let response = rawllm ? JSON.parse(rawllm) : null;

        if (!response || typeof response !== "object") {
            response = {
                user: {
                    name: user.name,
                    contact: user.email || `https://github.com/${user.githubUsername}`,
                },
                overall_summary:
                    typeof resumeJson === "string" && resumeJson.trim().length > 0
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

        let resumeMarkdown = generateMarkdownResume({
            name: user.name || response.username,

            contact: response?.user?.contact || response?.data?.html_url || "",

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

        const resumeId = randomUUID();
        const { resumeDir, markdownPath, pdfPath } = getResumePaths(resumeId);
        fs.mkdirSync(resumeDir, { recursive: true });
        fs.writeFileSync(markdownPath, resumeMarkdown);

        await markdownToPDF(markdownPath, pdfPath);

        const r2Key = `resumes/${resumeId}.pdf`;
        const pdfUrl = await uploadPDFToR2(pdfPath, r2Key);

        try {
            fs.rmSync(resumeDir, { recursive: true, force: true });
        } catch (cleanupErr) {
            console.error('Failed to clean up local resume dir:', cleanupErr);
        }

        res.status(200).json({ 
            message: 'Resume generated successfully',
            pdfUrl,
        });
    } catch (error) {
        console.error('Error generating resume:', error);
        res.status(500).json({ error: 'Failed to generate resume' });
    }
});
