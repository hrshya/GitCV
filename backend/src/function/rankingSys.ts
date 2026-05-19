import type { GitHubRepo } from "../utils/gen-type.ts";
import axios from "axios";
import dotenv from "dotenv";
import type { RankedProject } from "../utils/type.ts";
import { generateInsights } from "./insights.ts";

dotenv.config();

const token = process.env.GITHUB_TOKEN;
const BATCH_SIZE = 10;

const headers = token ? { Authorization: `Bearer ${token}` } : {};

// ---------- HELPERS ----------

async function getRepoTree(owner: string, repo: string) {
  try {
    const repoMeta = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    const branch = repoMeta.data.default_branch;

    const branchData = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`,
      { headers }
    );

    const sha = branchData.data.commit.sha;

    const tree = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`,
      { headers }
    );

    return tree.data.tree;
  } catch {
    return [];
  }
}

// ---------- MAIN ----------

async function processRepo(repo: GitHubRepo, username: string) {
  if (repo.archived || repo.disabled || repo.fork) {
    return {
      project_name: repo.name,
      summary: "",
      stack: [],
      key_features: [],
      complexity_tags: [],
      score: 0,
      impact_signals: {
        stars: 0,
        forks: 0,
        last_updated_days_ago: 0,
        is_production_ready: false,
      },
      structure: { file_count: 0, dir_count: 0, depth: 0 },
      highlight_hint: "",
    };
  }

  const [readmeRes, tree] = await Promise.all([
    axios
      .get(
        `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/README.md`
      )
      .catch(() => ({ data: "" })),
    getRepoTree(username, repo.name),
  ]);

  const readme = readmeRes.data;
  const readme_length = readmeRes.data.length;

  const lastCommitDays =
    (Date.now() - new Date(repo.pushed_at).getTime()) /
    (1000 * 3600 * 24);

  const signals = {
    core: {
      api: false,
      frontend: false,
      backend: false,
      database: false,
      auth: false,
    },
    system: {
      realtime: false,
      websocket: false,
      cron: false,
      eventDriven: false,
    },
    infra: {
      docker: false,
      kubernetes: false,
      ci: false,
      cd: false,
      cloud: false,
    },
    ai: {
      ml: false,
      notebooks: false,
      training: false,
      data: false,
    },
    quality: {
      tests: false,
      linting: false,
      docs: false,
    },
    product: {
      payments: false,
      notifications: false,
      upload: false,
      search: false,
      dashboard: false,
    },
  };

  let num_files = 0;
  let num_dirs = 0;
  let hasReadme = false;
  let hasConfig = false;
  let hasEnv = false;

  // ---------- PARSE TREE ----------

  for (const file of tree) {
    const path = file.path.toLowerCase();
    const fileName = path.split("/").pop() || "";

    if (file.type === "blob") num_files++;
    else num_dirs++;

    if (fileName.startsWith("readme")) hasReadme = true;
    if (fileName.includes(".env")) hasEnv = true;
    if (fileName.includes("config") || fileName === "package.json")
      hasConfig = true;

    // --- CORE (IMPROVED) ---
    if (
      path.includes("/api/") ||
      path.endsWith("api.ts") ||
      path.endsWith("api.js") ||
      path.includes("routes/")
    )
      signals.core.api = true;

    if (
      path.includes("components/") ||
      path.includes("pages/") ||
      path.includes("app/") ||
      path.endsWith(".tsx") ||
      path.endsWith(".jsx")
    )
      signals.core.frontend = true;

    if (
      path.includes("server/") ||
      path.includes("backend/") ||
      path.includes("controllers/") ||
      path.includes("services/")
    )
      signals.core.backend = true;

    if (
      path.includes("db/") ||
      path.includes("database/") ||
      path.includes("models/") ||
      path.includes("schema")
    )
      signals.core.database = true;

    if (
      path.includes("/auth/") ||
      path.includes("jwt") ||
      path.includes("oauth")
    )
      signals.core.auth = true;

    // --- SYSTEM ---
    if (
      path.includes("socket") ||
      path.includes("ws") ||
      path.includes("realtime")
    ) {
      signals.system.realtime = true;
      signals.system.websocket = true;
    }

    if (
      path.includes("cron") ||
      path.includes("scheduler") ||
      path.includes("jobs")
    )
      signals.system.cron = true;

    if (
      path.includes("queue") ||
      path.includes("events") ||
      path.includes("kafka") ||
      path.includes("rabbitmq")
    )
      signals.system.eventDriven = true;

    // --- INFRA ---
    if (fileName === "dockerfile") signals.infra.docker = true;

    if (
      path.includes("k8s") ||
      path.includes("kubernetes") ||
      path.includes("helm")
    )
      signals.infra.kubernetes = true;

    if (path.includes(".github/workflows")) signals.infra.ci = true;

    if (
      path.includes("deploy") ||
      path.includes("vercel") ||
      path.includes("netlify")
    )
      signals.infra.cd = true;

    if (
      path.includes("aws") ||
      path.includes("terraform") ||
      path.includes("gcp") ||
      path.includes("azure")
    )
      signals.infra.cloud = true;

    // --- AI ---
    if (fileName.endsWith(".ipynb")) signals.ai.notebooks = true;

    if (
      path.includes("/model/") ||
      path.includes("/models/") ||
      path.includes("pytorch") ||
      path.includes("tensorflow")
    )
      signals.ai.ml = true;

    if (path.includes("train") || path.includes("training"))
      signals.ai.training = true;

    if (
      path.includes("/data/") ||
      path.includes("dataset") ||
      path.includes("etl")
    )
      signals.ai.data = true;

    // --- QUALITY ---
    if (path.includes("/test/") || path.includes("/tests/"))
      signals.quality.tests = true;

    if (
      fileName.includes("eslint") ||
      fileName.includes("prettier")
    )
      signals.quality.linting = true;

    if (
      path.includes("docs") ||
      path.includes("documentation")
    )
      signals.quality.docs = true;

    // --- PRODUCT ---
    if (
      path.includes("stripe") ||
      path.includes("payment") ||
      path.includes("billing")
    )
      signals.product.payments = true;

    if (
      path.includes("notification") ||
      path.includes("email")
    )
      signals.product.notifications = true;

    if (
      path.includes("upload") ||
      path.includes("storage")
    )
      signals.product.upload = true;

    if (
      path.includes("search") ||
      path.includes("filter")
    )
      signals.product.search = true;

    if (
      path.includes("dashboard") ||
      path.includes("admin")
    )
      signals.product.dashboard = true;

    // --- EXTRA BACKEND SIGNALS ---
    if (path.includes("graphql")) signals.core.api = true;

    if (path.includes("middleware"))
      signals.system.eventDriven = true;

    if (
      path.includes("redis") ||
      path.includes("cache")
    )
      signals.system.eventDriven = true;
  }

  const complexity_tags: string[] = [];
  const key_features: string[] = [];

  generateInsights(signals, complexity_tags, key_features);

  // ---------- SCORING ----------

  const starScore = Math.log(repo.stargazers_count + 1) * 12;
  const forkScore = Math.log(repo.forks_count + 1) * 6;

  const recencyScore = 20 * Math.exp(-lastCommitDays / 60);

  const base =
    starScore +
    forkScore +
    recencyScore +
    (hasReadme ? 10 : 0) +
    (signals.quality.tests ? 15 : 0) +
    (signals.infra.docker ? 8 : 0) +
    (signals.infra.ci ? 10 : 0);

  const structure =
    (num_files > 50 ? 10 : 0) +
    (num_dirs > 5 ? 10 : 0) +
    (hasConfig ? 8 : 0) +
    (hasEnv ? 5 : 0);

  const complexity =
    (signals.core.api ? 8 : 0) +
    (signals.core.frontend ? 8 : 0) +
    (signals.core.backend ? 6 : 0) +
    (signals.core.database ? 8 : 0) +
    (signals.core.auth ? 6 : 0) +
    (signals.system.realtime ? 12 : 0) +
    (signals.system.eventDriven ? 8 : 0) +
    (signals.infra.docker ? 5 : 0) +
    (signals.infra.kubernetes ? 6 : 0) +
    (signals.ai.ml ? 10 : 0);

  const product =
    (signals.product.payments ? 6 : 0) +
    (signals.product.dashboard ? 5 : 0) +
    (signals.product.search ? 4 : 0) +
    (signals.product.upload ? 4 : 0);

  const readmeScore =
    (readme_length > 500 ? 10 : 0) +
    (repo.homepage ? 15 : 0);

  const final_score =
    base * 0.4 +
    structure * 0.2 +
    complexity * 0.25 +
    product * 0.1 +
    readmeScore * 0.05;

  return {
    project_name: repo.name,
    summary: readme.slice(0, 200) || "Project built using modern technologies",
    stack: repo.language ? [repo.language] : [],
    key_features,
    complexity_tags,
    score: final_score,
    impact_signals: {
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      last_updated_days_ago: Math.floor(lastCommitDays),
      is_production_ready:
        signals.infra.docker && signals.infra.ci && signals.core.backend,
    },
    structure: {
      file_count: num_files,
      dir_count: num_dirs,
      depth: num_dirs ? Math.round(num_files / num_dirs) : 0,
    },
    highlight_hint: complexity_tags[0] || "Solid project",
  };
}

// ---------- EXPORT ----------

export default async function RankingSystem(
  repos: GitHubRepo[],
  username: string
) {
  const ranked: RankedProject[] = [];

  for (let i = 0; i < repos.length; i += BATCH_SIZE) {
    const batch = repos.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((repo) => processRepo(repo, username))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        ranked.push(result.value);
      }
    }
  }

  ranked.sort((a, b) => b.score - a.score);

  return ranked.slice(0, 5);
}
