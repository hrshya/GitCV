import axios from 'axios';
import { GREENHOUSE_COMPANIES as companies } from '../utils/company.js';
import { prisma } from '../db.js';


export const scrapeGreenhouseJobs = async() => {
    for (const company of companies) {
        try {
            // Ensure company exists in the database
            const companyData = await prisma.company.upsert({
                where: {
                    boardToken: company,
                },
                update: {},
                create: {
                    name: company,
                    boardToken: company,
                }
            });

            // Fetch jobs for the company
            let response = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${company}/jobs`);
            const jobs = response.data.jobs;

            // Track existing jobs
            const existingJobs = await prisma.job.findMany({
                where: { companyId: companyData.id },
                select: { externalId: true },
            });

            const existingJobIds = new Set(existingJobs.map((job: any) => job.externalId));
            let newJobIds: bigint[] = [];


            for(const job of jobs) {
                console.log("processing job...")
                let isNew = !existingJobIds.has(BigInt(job.id));

                let data = await prisma.job.upsert({
                    where: {
                        companyId_externalId: {
                            companyId: companyData.id,
                            externalId: BigInt(job.id),
                        },
                    },
                    update: {
                        title: job.title,
                        location: job.location.name,
                        absoluteUrl: job.absolute_url,
                        updatedAt: new Date(),
                        postedAt: job.posted_at ? new Date(job.posted_at) : null,
                        externalId: BigInt(job.id),
                        metadata: job.metadata
                    },
                    create: {
                        companyId: companyData.id,
                        companyName: companyData.name,
                        title: job.title,
                        location: job.location.name,
                        absoluteUrl: job.absolute_url,
                        updatedAt: new Date(),
                        createdAt: new Date(),
                        postedAt: job.posted_at ? new Date(job.posted_at) : null,
                        externalId: BigInt(job.id),
                        metadata: job.metadata,
                    }
                })

                if(isNew) {
                    newJobIds.push(BigInt(job.id));
                }
            }

            // Mark jobs that are no longer present as inactive
            await prisma.job.updateMany({
                where: {
                    companyId: companyData.id,
                    externalId: { notIn: jobs.map((j: any) => BigInt(j.id)) },
                },
                data: { isActive: false },
            });

            await enrichJobs(company, companyData.id, newJobIds);

        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                console.log(`Skipping ${company} — no Greenhouse board found.`);
                continue;
            }

            console.error(`Error scraping ${company}:`, error);
            continue;
        }
    }
}

const  enrichJobs = async(company: string, companyId: number, jobIds: bigint[]) => {
    for(const jobId of jobIds) {
        try {
            let jobData = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${company}/jobs/${jobId}`);
            await prisma.job.update({
                where: {
                    companyId_externalId: {
                        companyId,
                        externalId: BigInt(jobId),
                    },
                },
                data: {
                    content: jobData.data.content,
                    department: jobData.data.departments ?? null,
                    offices: jobData.data.offices ?? null,
                }
            })
        } catch (error) {
            console.error(`Error fetching job data for job ID ${jobId}:`, error);
        }
    }
}
