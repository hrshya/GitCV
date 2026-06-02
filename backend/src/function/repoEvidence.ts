import { GoogleGenAI, Type } from "@google/genai";

type RepoTreeFile = {
  path: string;
  type?: string;
};

export type RepoEvidenceInput = {
  defaultBranch: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  name: string;
  readme: string;
  topics: string[];
  tree: RepoTreeFile[];
};

export type RepoEvidence = {
  architecture: string[];
  complexity_signals: string[];
  confidence: number;
  core_features: string[];
  project_summary: string;
  resume_bullet_evidence: string[];
  scalability_or_performance: string[];
  tech_stack: string[];
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const cheapEvidenceModel = process.env.REPO_EVIDENCE_MODEL || "gemini-3-flash-preview";

const client = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    })
  : null;

const REPO_EVIDENCE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    project_summary: { type: Type.STRING },
    tech_stack: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    architecture: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    core_features: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    complexity_signals: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    scalability_or_performance: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    resume_bullet_evidence: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    confidence: { type: Type.NUMBER },
  },
  required: [
    "project_summary",
    "tech_stack",
    "architecture",
    "core_features",
    "complexity_signals",
    "scalability_or_performance",
    "resume_bullet_evidence",
    "confidence",
  ],
};

function uniqueStrings(values: string[], limit: number) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ).slice(0, limit);
}

function stripMarkdownNoise(readme: string) {
  return readme
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]+]\(([^)]+)\)/g, " $1 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getUsefulReadmeSections(readme: string) {
  const clean = stripMarkdownNoise(readme);
  const lines = clean.split(/\r?\n/);
  const sections: string[] = [];
  let currentTitle = "overview";
  let currentLines: string[] = [];
  const usefulHeadingPattern =
    /(overview|architecture|features|tech|stack|usage|api|database|schema|deploy|performance|scal|realtime|auth|security|model|agent|pipeline|workflow|system|implementation)/i;

  function flushSection() {
    const text = currentLines.join("\n").trim();
    if (!text) {
      return;
    }

    if (sections.length === 0 || usefulHeadingPattern.test(currentTitle)) {
      sections.push(`## ${currentTitle}\n${text}`);
    }
  }

  for (const line of lines) {
    const heading = /^(#{1,4})\s+(.+)$/.exec(line.trim());

    if (heading) {
      flushSection();
      currentTitle = heading[2] || "section";
      currentLines = [];
      continue;
    }

    currentLines.push(line);
  }

  flushSection();

  return sections.join("\n\n").slice(0, 7_000);
}

function summarizeTree(tree: RepoTreeFile[]) {
  const interestingPatterns = [
    "package.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "requirements.txt",
    "pyproject.toml",
    "dockerfile",
    "docker-compose",
    "prisma/schema",
    ".github/workflows",
    "routes/",
    "api/",
    "server/",
    "backend/",
    "components/",
    "app/",
    "pages/",
    "db/",
    "database/",
    "models/",
    "schema",
    "socket",
    "websocket",
    "worker",
    "queue",
    "cron",
    "test",
    "spec",
  ];

  const paths = tree
    .filter((file) => file.type === "blob")
    .map((file) => file.path)
    .filter((path) => {
      const lower = path.toLowerCase();
      return interestingPatterns.some((pattern) => lower.includes(pattern));
    });

  return uniqueStrings(paths, 80).join("\n");
}

function inferStackFromFiles(input: RepoEvidenceInput) {
  const stack = [input.language || "", ...input.topics];
  const paths = input.tree.map((file) => file.path.toLowerCase());
  const joinedPaths = paths.join("\n");
  const readme = input.readme.toLowerCase();
  const haystack = `${joinedPaths}\n${readme}`;

  const checks: Array<[string, RegExp]> = [
    ["TypeScript", /\.ts(x)?\b|typescript|tsconfig/],
    ["JavaScript", /\.js(x)?\b|javascript/],
    ["React", /react|components\/|\.jsx|\.tsx/],
    ["Next.js", /next\.config|nextjs|next\.js|app\/|pages\//],
    ["Node.js", /node\.js|express|fastify|nestjs|package\.json/],
    ["Express", /express|routes\//],
    ["Python", /\.py\b|python|requirements\.txt|pyproject\.toml/],
    ["FastAPI", /fastapi/],
    ["PostgreSQL", /postgres|postgresql|prisma|drizzle|schema\.prisma/],
    ["MongoDB", /mongodb|mongoose/],
    ["Docker", /dockerfile|docker-compose/],
    ["GitHub Actions", /\.github\/workflows/],
    ["WebSockets", /websocket|socket\.io|ws\b|realtime/],
    ["Redis", /redis/],
    ["OpenAI", /openai/],
    ["Gemini", /gemini|google genai|@google\/genai/],
    ["LangChain", /langchain/],
  ];

  for (const [name, pattern] of checks) {
    if (pattern.test(haystack)) {
      stack.push(name);
    }
  }

  return uniqueStrings(stack, 14);
}

export function extractDeterministicRepoEvidence(input: RepoEvidenceInput): RepoEvidence {
  const stack = inferStackFromFiles(input);
  const treeSummary = summarizeTree(input.tree);
  const readmeSections = getUsefulReadmeSections(input.readme);
  const summary =
    input.description ||
    readmeSections.split(/\n+/).find((line) => line.length > 40)?.slice(0, 260) ||
    `${input.name} is a software project built with ${stack.slice(0, 4).join(", ") || "modern engineering tools"}.`;

  return {
    architecture: uniqueStrings(treeSummary.split("\n").filter((path) => /api|routes|db|schema|server|worker|queue|socket/i.test(path)), 8),
    complexity_signals: [],
    confidence: input.readme ? 0.55 : 0.35,
    core_features: [],
    project_summary: summary,
    resume_bullet_evidence: [],
    scalability_or_performance: [],
    tech_stack: stack,
  };
}

export async function enrichRepoEvidence(input: RepoEvidenceInput): Promise<RepoEvidence | null> {
  if (!client || !input.readme.trim()) {
    return null;
  }

  const deterministicEvidence = extractDeterministicRepoEvidence(input);
  const prompt = `
Extract high-signal engineering evidence for a technical resume.

Rules:
- Do not invent metrics, users, revenue, or deployment facts.
- Prefer architecture, APIs, data models, infra, performance, realtime, auth, async jobs, AI/ML, and reliability details.
- Keep each array item concise and concrete.
- If evidence is weak, lower confidence instead of hallucinating.

Repository:
${input.name}

Description:
${input.description || ""}

Detected stack:
${deterministicEvidence.tech_stack.join(", ")}

Interesting file paths:
${summarizeTree(input.tree)}

README sections:
${getUsefulReadmeSections(input.readme)}
`.trim();

  try {
    const response = await client.models.generateContent({
      model: cheapEvidenceModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: REPO_EVIDENCE_SCHEMA,
        temperature: 0.15,
      },
    });

    const parsed = JSON.parse(response.text || "{}") as Partial<RepoEvidence>;

    return {
      architecture: uniqueStrings(parsed.architecture || [], 8),
      complexity_signals: uniqueStrings(parsed.complexity_signals || [], 8),
      confidence:
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(parsed.confidence, 1))
          : deterministicEvidence.confidence,
      core_features: uniqueStrings(parsed.core_features || [], 8),
      project_summary: parsed.project_summary?.trim() || deterministicEvidence.project_summary,
      resume_bullet_evidence: uniqueStrings(parsed.resume_bullet_evidence || [], 8),
      scalability_or_performance: uniqueStrings(parsed.scalability_or_performance || [], 6),
      tech_stack: uniqueStrings([...(parsed.tech_stack || []), ...deterministicEvidence.tech_stack], 14),
    };
  } catch (error) {
    console.error(`Repo evidence enrichment failed for ${input.name}:`, error);
    return null;
  }
}

export function mergeRepoEvidence(base: RepoEvidence, enriched: RepoEvidence | null): RepoEvidence {
  if (!enriched) {
    return base;
  }

  return {
    architecture: uniqueStrings([...enriched.architecture, ...base.architecture], 8),
    complexity_signals: uniqueStrings([...enriched.complexity_signals, ...base.complexity_signals], 8),
    confidence: Math.max(base.confidence, enriched.confidence),
    core_features: uniqueStrings([...enriched.core_features, ...base.core_features], 8),
    project_summary: enriched.project_summary || base.project_summary,
    resume_bullet_evidence: uniqueStrings([...enriched.resume_bullet_evidence, ...base.resume_bullet_evidence], 8),
    scalability_or_performance: uniqueStrings(
      [...enriched.scalability_or_performance, ...base.scalability_or_performance],
      6
    ),
    tech_stack: uniqueStrings([...enriched.tech_stack, ...base.tech_stack], 14),
  };
}
