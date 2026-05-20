import fs from "node:fs";
import path from "node:path";

type DailyEntry = {
  count: number;
  date: string;
  updatedAt: string;
};

type RateLimitStore = {
  generations: Record<string, DailyEntry>;
  version: 1;
};

export type RateLimitReservation = {
  allowed: boolean;
  count: number;
  key: string;
  limit: number;
  remaining: number;
  resetAt: string;
  reserved: boolean;
};

const defaultDailyLimit = 5;
const storeRoot = path.resolve("generated", "rate-limits");
const storePath = path.join(storeRoot, "resume-generations.json");

function emptyStore(): RateLimitStore {
  return {
    generations: {},
    version: 1,
  };
}

function getDailyLimit() {
  const parsedLimit = Number(process.env.RESUME_DAILY_LIMIT || defaultDailyLimit);

  if (!Number.isFinite(parsedLimit) || parsedLimit < 1) {
    return defaultDailyLimit;
  }

  return Math.floor(parsedLimit);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function nextResetAt() {
  const reset = new Date();
  reset.setUTCHours(24, 0, 0, 0);
  return reset.toISOString();
}

function readStore(): RateLimitStore {
  if (!fs.existsSync(storePath)) {
    return emptyStore();
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(storePath, "utf8")) as Partial<RateLimitStore>;

    return {
      generations: parsed.generations || {},
      version: 1,
    };
  } catch (error) {
    console.error("Rate limit store read failed, resetting store:", error);
    return emptyStore();
  }
}

function writeStore(store: RateLimitStore) {
  fs.mkdirSync(storeRoot, { recursive: true });
  const tempPath = `${storePath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(store, null, 2));
  fs.renameSync(tempPath, storePath);
}

export function reserveResumeGeneration(key: string): RateLimitReservation {
  const store = readStore();
  const date = todayKey();
  const limit = getDailyLimit();
  const now = new Date().toISOString();
  const previous = store.generations[key];
  const entry =
    previous?.date === date
      ? previous
      : {
          count: 0,
          date,
          updatedAt: now,
        };

  if (entry.count >= limit) {
    return {
      allowed: false,
      count: entry.count,
      key,
      limit,
      remaining: 0,
      resetAt: nextResetAt(),
      reserved: false,
    };
  }

  entry.count += 1;
  entry.updatedAt = now;
  store.generations[key] = entry;
  writeStore(store);

  return {
    allowed: true,
    count: entry.count,
    key,
    limit,
    remaining: Math.max(limit - entry.count, 0),
    resetAt: nextResetAt(),
    reserved: true,
  };
}

export function refundResumeGeneration(key: string) {
  const store = readStore();
  const entry = store.generations[key];

  if (!entry || entry.date !== todayKey() || entry.count < 1) {
    return;
  }

  entry.count -= 1;
  entry.updatedAt = new Date().toISOString();
  store.generations[key] = entry;
  writeStore(store);
}
