import express from 'express';
import { scrapeGreenhouseJobs } from '../controllers/jobsScrapper.js';
import { prisma } from '../db.js';

export const jobsRouter = express.Router();

jobsRouter.get('/', async (req, res) => {
    try {
        await scrapeGreenhouseJobs();
        res.json({ message: 'Jobs fetched successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// Endpoint to get all active jobs
jobsRouter.get('/active', async (req, res) => {
    try {
        const activeJobs = await prisma.job.findMany({
            where: { isActive: true }
        });

        const formattedJobs = activeJobs.map(job => ({
            ...job,
            externalId: job.externalId.toString()
        }));

        res.status(200).json({ jobs: formattedJobs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch active jobs' });
    }
});
