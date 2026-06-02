import axios from "axios";
import { prisma } from "../db.js";
import { GREENHOUSE_COMPANIES } from "../utils/company.js";

type GreenhouseOffice = {
  name?: string | null;
};

type GreenhouseDepartment = {
  name?: string | null;
};

type GreenhouseLocation = {
  name?: string | null;
};

type GreenhouseJobResponse = {
  absolute_url?: string | null;
  content?: string | null;
  departments?: GreenhouseDepartment[];
  id?: number | string;
  internal_job_id?: number | string;
  location?: GreenhouseLocation | null;
  metadata?: unknown;
  offices?: GreenhouseOffice[];
  title?: string | null;
  updated_at?: string | null;
};

type GreenhouseJobsResponse = {
  jobs?: GreenhouseJobResponse[];
};

type NormalizedGreenhouseJob = {
  absoluteUrl: string;
  companyName: string;
  companySlug: string;
  content: string | null;
  department: string | null;
  location: string | null;
  offices: string | null;
  raw: GreenhouseJobResponse;
  sourceJobId: string;
  sourceUpdatedAt: Date | null;
  title: string;
};

export type GreenhouseSyncFailure = {
  companySlug: string;
  message: string;
};

export type GreenhouseSyncResult = {
  companiesAttempted: number;
  companiesSkipped: number;
  companiesSucceeded: number;
  failures: GreenhouseSyncFailure[];
  jobsFetched: number;
  jobsMarkedInactive: number;
  jobsUpserted: number;
  syncedAt: string;
};

type CompanySyncResult = {
  companySlug: string;
  jobsFetched: number;
  jobsMarkedInactive: number;
  skipped: boolean;
  jobsUpserted: number;
};

function getPositiveIntegerEnv(name: string, fallback: number, max: number) {
  const parsed = Number(process.env[name] || fallback);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), max);
}

function uniqueGreenhouseCompanies() {
  return Array.from(
    new Set(
      GREENHOUSE_COMPANIES.map((company) => company.trim().toLowerCase()).filter(Boolean)
    )
  );
}

function formatCompanyName(companySlug: string) {
  return companySlug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ") || companySlug;
}

function joinNames(items?: Array<{ name?: string | null }>) {
  const names = (items || [])
    .map((item) => item.name?.trim())
    .filter((name): name is string => Boolean(name));

  return names.length > 0 ? names.join(", ") : null;
}

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeGreenhouseJob(companySlug: string, job: GreenhouseJobResponse): NormalizedGreenhouseJob | null {
  const sourceJobId = String(job.id || job.internal_job_id || "").trim();

  if (!sourceJobId) {
    return null;
  }

  return {
    absoluteUrl:
      job.absolute_url?.trim() ||
      `https://boards.greenhouse.io/${companySlug}/jobs/${sourceJobId}`,
    companyName: formatCompanyName(companySlug),
    companySlug,
    content: job.content?.trim() || null,
    department: joinNames(job.departments),
    location: job.location?.name?.trim() || null,
    offices: joinNames(job.offices),
    raw: job,
    sourceJobId,
    sourceUpdatedAt: parseDate(job.updated_at),
    title: job.title?.trim() || "Untitled role",
  };
}

async function fetchGreenhouseJobs(companySlug: string) {
  try {
    const response = await axios.get<GreenhouseJobsResponse>(
      `https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs`,
      {
        params: {
          content: true,
        },
        timeout: getPositiveIntegerEnv("GREENHOUSE_FETCH_TIMEOUT_MS", 10_000, 30_000),
      }
    );

    return Array.isArray(response.data.jobs) ? response.data.jobs : [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

async function syncCompanyGreenhouseJobs(companySlug: string, syncedAt: Date): Promise<CompanySyncResult> {
  const jobs = await fetchGreenhouseJobs(companySlug);

  if (!jobs) {
    return {
      companySlug,
      jobsFetched: 0,
      jobsMarkedInactive: 0,
      jobsUpserted: 0,
      skipped: true,
    };
  }

  const normalizedJobs = jobs
    .map((job) => normalizeGreenhouseJob(companySlug, job))
    .filter((job): job is NormalizedGreenhouseJob => Boolean(job));
  const activeSourceIds = normalizedJobs.map((job) => job.sourceJobId);
  let jobsUpserted = 0;

  for (const job of normalizedJobs) {
    await prisma.greenhouseJob.upsert({
      where: {
        companySlug_sourceJobId: {
          companySlug: job.companySlug,
          sourceJobId: job.sourceJobId,
        },
      },
      update: {
        absoluteUrl: job.absoluteUrl,
        active: true,
        companyName: job.companyName,
        content: job.content,
        department: job.department,
        lastSeenAt: syncedAt,
        location: job.location,
        offices: job.offices,
        raw: job.raw,
        sourceUpdatedAt: job.sourceUpdatedAt,
        title: job.title,
      },
      create: {
        absoluteUrl: job.absoluteUrl,
        active: true,
        companyName: job.companyName,
        companySlug: job.companySlug,
        content: job.content,
        department: job.department,
        firstSeenAt: syncedAt,
        lastSeenAt: syncedAt,
        location: job.location,
        offices: job.offices,
        raw: job.raw,
        sourceJobId: job.sourceJobId,
        sourceUpdatedAt: job.sourceUpdatedAt,
        title: job.title,
      },
    });

    jobsUpserted += 1;
  }

  const inactiveResult = await prisma.greenhouseJob.updateMany({
    where: {
      companySlug,
      sourceJobId: {
        notIn: activeSourceIds,
      },
    },
    data: {
      active: false,
    },
  });

  return {
    companySlug,
    jobsFetched: normalizedJobs.length,
    jobsMarkedInactive: inactiveResult.count || 0,
    jobsUpserted,
    skipped: false,
  };
}

export async function syncGreenhouseJobs(): Promise<GreenhouseSyncResult> {
  const companies = uniqueGreenhouseCompanies();
  const failures: GreenhouseSyncFailure[] = [];
  const syncedAt = new Date();
  const concurrency = getPositiveIntegerEnv("GREENHOUSE_SYNC_CONCURRENCY", 8, 20);
  let companiesSucceeded = 0;
  let jobsFetched = 0;
  let jobsMarkedInactive = 0;
  let companiesSkipped = 0;
  let jobsUpserted = 0;

  for (let index = 0; index < companies.length; index += concurrency) {
    const batch = companies.slice(index, index + concurrency);
    const results = await Promise.allSettled(
      batch.map((companySlug) => syncCompanyGreenhouseJobs(companySlug, syncedAt))
    );

    for (const [resultIndex, result] of results.entries()) {
      if (result.status === "fulfilled") {
        if (result.value.skipped) {
          companiesSkipped += 1;
          continue;
        }

        jobsFetched += result.value.jobsFetched;
        jobsMarkedInactive += result.value.jobsMarkedInactive;
        jobsUpserted += result.value.jobsUpserted;
        companiesSucceeded += 1;
        continue;
      }

      failures.push({
        companySlug: batch[resultIndex] || "unknown",
        message: result.reason instanceof Error ? result.reason.message : "Unknown Greenhouse sync error",
      });
    }
  }

  return {
    companiesAttempted: companies.length,
    companiesSucceeded,
    companiesSkipped,
    failures,
    jobsFetched,
    jobsMarkedInactive,
    jobsUpserted,
    syncedAt: syncedAt.toISOString(),
  };
}
