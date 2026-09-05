import fs from "fs";
import path from "path";

export type ResumeDownloadOwner = {
  githubUsername: string;
  name?: string | null;
  resumeId: string;
  userId?: string | null;
};

type ResumeDownloadEntry = {
  downloadCount: number;
  githubUsername: string;
  lastDownloadedAt: string | null;
  name?: string | null;
  userId?: string | null;
};

type UserDownloadEntry = {
  downloadCount: number;
  githubUsername: string;
  lastDownloadedAt: string | null;
  name?: string | null;
  resumeIds: string[];
  userId?: string | null;
};

type DownloadAnalyticsStore = {
  resumes: Record<string, ResumeDownloadEntry>;
  totalDownloads: number;
  users: Record<string, UserDownloadEntry>;
  version: 1;
};

export type DownloadAnalyticsResult = {
  lastDownloadedAt: string;
  resumeDownloads: number;
  totalDownloads: number;
  userDownloads: number;
};

const analyticsRoot = path.resolve("generated", "analytics");
const analyticsPath = path.join(analyticsRoot, "resume-downloads.json");

function emptyStore(): DownloadAnalyticsStore {
  return {
    resumes: {},
    totalDownloads: 0,
    users: {},
    version: 1,
  };
}

function getUserKey(githubUsername: string) {
  return githubUsername.trim().toLowerCase() || "unknown";
}

function readStore(): DownloadAnalyticsStore {
  if (!fs.existsSync(analyticsPath)) {
    return emptyStore();
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(analyticsPath, "utf8")) as Partial<DownloadAnalyticsStore>;

    return {
      resumes: parsed.resumes || {},
      totalDownloads: parsed.totalDownloads || 0,
      users: parsed.users || {},
      version: 1,
    };
  } catch (error) {
    console.error("Download analytics read failed, resetting store:", error);
    return emptyStore();
  }
}

function writeStore(store: DownloadAnalyticsStore) {
  fs.mkdirSync(analyticsRoot, { recursive: true });
  const tempPath = `${analyticsPath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(store, null, 2));
  fs.renameSync(tempPath, analyticsPath);
}

export function recordResumeDownload(owner: ResumeDownloadOwner): DownloadAnalyticsResult {
  const store = readStore();
  const now = new Date().toISOString();
  const githubUsername = owner.githubUsername.trim() || "unknown";
  const userKey = getUserKey(githubUsername);
  const resumeEntry = store.resumes[owner.resumeId] || {
    downloadCount: 0,
    githubUsername,
    lastDownloadedAt: null,
    name: owner.name || null,
    userId: owner.userId || null,
  };
  const userEntry = store.users[userKey] || {
    downloadCount: 0,
    githubUsername,
    lastDownloadedAt: null,
    name: owner.name || null,
    resumeIds: [],
    userId: owner.userId || null,
  };

  resumeEntry.downloadCount += 1;
  resumeEntry.githubUsername = githubUsername;
  resumeEntry.lastDownloadedAt = now;
  resumeEntry.name = owner.name || resumeEntry.name || null;
  resumeEntry.userId = owner.userId || resumeEntry.userId || null;

  userEntry.downloadCount += 1;
  userEntry.githubUsername = githubUsername;
  userEntry.lastDownloadedAt = now;
  userEntry.name = owner.name || userEntry.name || null;
  userEntry.userId = owner.userId || userEntry.userId || null;
  if (!userEntry.resumeIds.includes(owner.resumeId)) {
    userEntry.resumeIds.push(owner.resumeId);
  }

  store.resumes[owner.resumeId] = resumeEntry;
  store.users[userKey] = userEntry;
  store.totalDownloads += 1;
  writeStore(store);

  return {
    lastDownloadedAt: now,
    resumeDownloads: resumeEntry.downloadCount,
    totalDownloads: store.totalDownloads,
    userDownloads: userEntry.downloadCount,
  };
}

export function getDownloadAnalytics() {
  const store = readStore();

  return {
    totalDownloads: store.totalDownloads,
    totalResumesDownloaded: Object.keys(store.resumes).length,
    totalUsersWithDownloads: Object.keys(store.users).length,
    users: Object.values(store.users).sort((a, b) => b.downloadCount - a.downloadCount),
    resumes: Object.entries(store.resumes)
      .map(([resumeId, entry]) => ({
        resumeId,
        ...entry,
      }))
      .sort((a, b) => b.downloadCount - a.downloadCount),
  };
}

export function getUserDownloadAnalytics(githubUsername: string) {
  const store = readStore();
  const user = store.users[getUserKey(githubUsername)];

  return (
    user || {
      downloadCount: 0,
      githubUsername,
      lastDownloadedAt: null,
      name: null,
      resumeIds: [],
      userId: null,
    }
  );
}
