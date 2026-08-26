"use client";

import {
  Pencil,
  Plus,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Rocket,
  Code2,
  BadgeCheck,
} from "lucide-react";

function SectionCard({ icon, iconBg, title, subtitle, tint, children, onEdit }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 p-6 ${
        tint ? "bg-emerald-50/40" : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#111318]">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <button
          onClick={onEdit}
          className="text-gray-300 hover:text-gray-500 transition p-1"
        >
          <Pencil size={15} />
        </button>
      </div>
      {children}
    </div>
  );
}

function Tag({ children, color }) {
  const palettes = {
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    teal: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-md border ${palettes[color]}`}
    >
      {children}
    </span>
  );
}

const projects = [
  {
    name: "Gitume",
    tags: ["Next.js 16", "React 19", "Express", "Prisma", "PostgreSQL", "Gemini AI"],
    bullets: [
      "Built a 5-stage generation pipeline: PDF parsing, concurrent GitHub repo ranking, Gemini LLM synthesis, Markdown generation, and Puppeteer A4 PDF export, completing end-to-end in 40s median from username + resume + JD inputs (timed via server-side logging).",
      "Designed a 7-signal repository ranking engine with concurrent 10-repo GitHub API batching and Postgres caching, eliminating redundant API calls for repeat users.",
      "Hardened the pipeline with dual rate limiting (per-user/IP, 5 generations/day), MIME/path upload validation, and 24-hour draft expiry tracking.",
    ],
  },
  {
    name: "Branchy",
    tags: ["Next.js 16", "TypeScript", "Drizzle", "Neon PG", "Groq", "Docker"],
    bullets: [
      "Modeled conversations as a Directed Acyclic Graph – fork any message into parallel branches, explore tangents without polluting the main context window.",
      "Implemented LLM-summarized merges via Llama 3.3 that retain insight without transcript bloat – merge logic filters shared history, appending only new content.",
      "Designed a PostgreSQL self-referencing schema for tree lineage with recursive traversal for dynamic history reconstruction.",
    ],
  },
  {
    name: "CanvasFlow",
    tags: ["React", "Canvas API", "WebSockets", "CRDTs", "TypeScript"],
    bullets: [
      "Implemented a real-time collaborative drawing engine using CRDTs and the Canvas 2D API, achieving conflict-free multi-user editing with sub-40ms synchronization latency.",
      "Engineered a high-performance rendering layer supporting infinite canvas, vector interpolation, and smooth panning/zooming for complex drawing interactions.",
    ],
  },
];

const skillCategories = [
  { label: "PROGRAMMING LANGUAGES", items: ["C++", "Python", "TypeScript", "JavaScript", "SQL"] },
  {
    label: "FRAMEWORKS & LIBRARIES",
    items: ["React", "Next.js", "Node.js", "Express", "WebSockets", "Prisma", "Drizzle", "Tailwind CSS", "Zustand"],
  },
  { label: "DATABASES", items: ["PostgreSQL", "Redis"] },
  { label: "TOOLS & SOFTWARE", items: ["Docker", "CI/CD Pipelines", "Jest", "Playwright", "Puppeteer", "Git", "Postman"] },
  { label: "CLOUD PLATFORMS", items: ["AWS", "Vercel", "Cloudflare Workers"] },
];

const totalSkills = skillCategories.reduce((sum, c) => sum + c.items.length, 0);

export default function ProfilePage() {
  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-6xl mx-auto py-10 px-6">
        {/* profile header */}
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-900 text-white flex items-center justify-center font-semibold text-sm shrink-0">
              HY
            </div>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-lg font-semibold text-[#111318]">Harsh Yadav</h1>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Open to work
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  94% complete
                  <ArrowRight size={12} />
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1 truncate">
                Rewari, Haryana, India · harshyadav6057@gmail.com · +91 7404891893
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-500 mb-3">Profile details</h3>

        <div className="space-y-6">
          {/* professional summary */}
          <SectionCard
            title="Professional summary"
            iconBg="bg-transparent"
            icon={null}
            tint
          >
            <p className="text-sm text-gray-400">
              Add a professional summary, the first thing recruiters read.
            </p>
          </SectionCard>

          {/* education */}
          <SectionCard
            title="Education"
            subtitle="1 entry"
            iconBg="bg-violet-100"
            icon={<GraduationCap size={17} className="text-violet-600" />}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-500 shrink-0">
                VIT
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111318]">
                  Vellore Institute of Technology University
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Bachelor of Technology · Computer Science and Engineering
                </p>
                <p className="text-xs text-gray-400 mt-1">Sep 2023 - May 2027</p>
              </div>
            </div>
          </SectionCard>

          {/* experience */}
          <SectionCard
            title="Experience"
            subtitle="1 role"
            iconBg="bg-emerald-50"
            icon={<Briefcase size={17} className="text-emerald-600" />}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-semibold shrink-0">
                ST
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111318]">
                  Open Source Contributor
                </p>
                <p className="text-sm text-blue-600 mt-0.5">stdlib/stdlib-js</p>
                <p className="text-xs text-gray-400 mt-1 mb-2">
                  Feb 2025 – Jan 2026 · 1 yr
                </p>
                <ul className="text-sm text-gray-500 space-y-1.5 list-disc list-outside pl-4">
                  <li>
                    Contributed 200+ merged pull requests to stdlib, improving
                    benchmarking systems, documentation infrastructure, and
                    numerical computing utilities.
                  </li>
                </ul>
              </div>
            </div>
          </SectionCard>

          {/* projects + skills/certifications grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* projects */}
            <div className="flex flex-col gap-6">
              <SectionCard
                title="Projects"
                subtitle={`${projects.length} projects`}
                iconBg="bg-orange-50"
                icon={<Rocket size={17} className="text-orange-500" />}
              >
                <div className="space-y-6">
                  {projects.map((p) => (
                    <div key={p.name}>
                      <h4 className="text-sm font-semibold text-[#111318] mb-2">
                        {p.name}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {p.tags.map((t) => (
                          <Tag key={t} color="orange">
                            {t}
                          </Tag>
                        ))}
                      </div>
                      <ul className="text-sm text-gray-500 space-y-1.5 list-disc list-outside pl-4">
                        {p.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <button className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition py-2">
                <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                  <Plus size={13} />
                </span>
                Add custom section
              </button>
            </div>

            {/* skills + certifications */}
            <div className="flex flex-col gap-6">
              <SectionCard
                title="Skills"
                subtitle={`${totalSkills} skills across ${skillCategories.length} categories`}
                iconBg="bg-blue-50"
                icon={<Code2 size={17} className="text-blue-600" />}
              >
                <div className="space-y-5">
                  {skillCategories.map((cat) => (
                    <div key={cat.label}>
                      <p className="text-[11px] font-semibold tracking-wider text-gray-400 mb-2">
                        {cat.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cat.items.map((item) => (
                          <Tag key={item} color="teal">
                            {item}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Certifications"
                iconBg="bg-orange-50"
                icon={<BadgeCheck size={17} className="text-orange-500" />}
              >
                <div className="rounded-lg border border-dashed border-gray-200 py-8 flex items-center justify-center">
                  <p className="text-sm text-gray-400">
                    Add credentials, badges, or licenses.
                  </p>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
