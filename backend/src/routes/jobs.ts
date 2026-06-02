import express from "express";
import { syncGreenhouseJobs } from "../function/greenhouseCrawler.js";
import { isPrismaPersistenceEnabled, prisma } from "../db.js";

export const jobsRouter = express.Router();

function getStringInput(value: unknown) {
  if (Array.isArray(value)) {
    return getStringInput(value[0]);
  }

  return typeof value === "string" ? value.trim() : "";
}

function getBooleanInput(value: unknown) {
  const normalized = getStringInput(value).toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function getLimit(value: unknown) {
  const parsed = Number(getStringInput(value));

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 50;
  }

  return Math.min(Math.floor(parsed), 100);
}

function getOffset(value: unknown) {
  const parsed = Number(getStringInput(value));

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.floor(parsed);
}

function isSyncAuthorized(req: express.Request) {
  const secret = process.env.GREENHOUSE_SYNC_SECRET;

  if (!secret) {
    return false;
  }

  const authHeader = getStringInput(req.headers.authorization);
  const cronHeader = getStringInput(req.headers["x-cron-secret"]);

  return authHeader === `Bearer ${secret}` || cronHeader === secret;
}

function requirePrismaPersistence(res: express.Response) {
  if (isPrismaPersistenceEnabled()) {
    return true;
  }

  res.status(503).json({
    error: "Postgres persistence is disabled. Set ENABLE_PRISMA=true and DATABASE_URL before using jobs.",
  });
  return false;
}

jobsRouter.get("/", async (req, res) => {
  if (!requirePrismaPersistence(res)) {
    return;
  }

  try {
    const companySlug = getStringInput(req.query.company).toLowerCase();
    const search = getStringInput(req.query.search);
    const includeInactive = getBooleanInput(req.query.includeInactive);
    const includeContent = getBooleanInput(req.query.includeContent);
    const limit = getLimit(req.query.limit);
    const offset = getOffset(req.query.offset);
    const where: any = includeInactive ? {} : { active: true };

    if (companySlug) {
      where.companySlug = companySlug;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const select: any = {
      absoluteUrl: true,
      active: true,
      companyName: true,
      companySlug: true,
      department: true,
      id: true,
      lastSeenAt: true,
      location: true,
      offices: true,
      sourceJobId: true,
      sourceUpdatedAt: true,
      title: true,
    };

    if (includeContent) {
      select.content = true;
    }

    const [jobs, total] = await Promise.all([
      prisma.greenhouseJob.findMany({
        orderBy: [{ sourceUpdatedAt: "desc" }, { lastSeenAt: "desc" }],
        select,
        skip: offset,
        take: limit,
        where,
      }),
      prisma.greenhouseJob.count({ where }),
    ]);

    return res.json({
      jobs,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error) {
    console.error("Greenhouse job query failed:", error);
    return res.status(500).json({ error: "Failed to load jobs" });
  }
});

async function syncJobs(req: express.Request, res: express.Response) {
  if (!requirePrismaPersistence(res)) {
    return;
  }

  if (!isSyncAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized Greenhouse sync request" });
  }

  try {
    const result = await syncGreenhouseJobs();
    return res.json(result);
  } catch (error) {
    console.error("Greenhouse sync failed:", error);
    return res.status(500).json({ error: "Failed to sync Greenhouse jobs" });
  }
}

jobsRouter.post("/sync", syncJobs);
