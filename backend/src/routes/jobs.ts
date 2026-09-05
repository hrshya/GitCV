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

jobsRouter.get('/job/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if(!id || isNaN(Number(id))) {
            return res.status(400).json({ error: 'Invalid job ID' });
        }

        const jobId = Number(id);
        const job = await prisma.job.findUnique({
            where: {
                id: jobId
            }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

          const safeJob = {
            ...job,
            externalId: job.externalId.toString(),
        };

        return res.status(200).json({ job: safeJob, msg: 'Job fetched successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});
