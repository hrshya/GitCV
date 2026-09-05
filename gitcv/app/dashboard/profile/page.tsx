"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Pencil,
  Plus,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Rocket,
  Code2,
  BadgeCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

interface Personal {
  name: string;
  email: string;
  phone: string;
}

interface ExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string[];
  technologies: string[];
}

interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  endDate: string;
  startDate?: string;
}

interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
}

interface ResumeData {
  personal: Personal;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
}

function SectionCard({ icon, iconBg, title, subtitle, tint, children, onEdit }: any) {
  return (
    <div className={`rounded-xl border border-gray-200 p-6 ${tint ? "bg-emerald-50/40" : "bg-white"}`}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#111318]">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <button onClick={onEdit} className="text-gray-300 hover:text-gray-500 transition p-1">
          <Pencil size={15} />
        </button>
      </div>
      {children}
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: "orange" | "teal" }) {
  const palettes = {
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    teal: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${palettes[color]}`}>
      {children}
    </span>
  );
}

function getInitials(name: string, max = 2) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, max);
}

const SKILL_CATEGORY_RULES: { label: string; keywords: string[] }[] = [
  { label: "LANGUAGES", keywords: ["python", "typescript", "javascript", "c++", "java", "sql"] },
  { label: "FRAMEWORKS & LIBRARIES", keywords: ["react", "next.js", "fastapi", "langgraph", "node.js", "express"] },
  { label: "DATABASES", keywords: ["postgresql", "redis", "supabase", "neon", "qdrant", "chromadb"] },
  { label: "REAL-TIME & INFRA", keywords: ["livekit", "webrtc"] },
  { label: "TOOLS & PLATFORMS", keywords: ["docker", "git", "vercel", "cloudflare", "ci/cd pipelines", "postman", "prisma", "drizzle"] },
];

function categorizeSkills(skills: string[]) {
  const buckets = SKILL_CATEGORY_RULES.map((rule) => ({ label: rule.label, items: [] as string[] }));
  const other: string[] = [];
  skills.forEach((skill) => {
    const idx = SKILL_CATEGORY_RULES.findIndex((rule) => rule.keywords.includes(skill.toLowerCase()));
    if (idx === -1) other.push(skill);
    else buckets[idx].items.push(skill);
  });
  if (other.length) buckets.push({ label: "OTHER", items: other });
  return buckets.filter((b) => b.items.length > 0);
}

function computeCompleteness(resume: ResumeData) {
  const checks = [
    !!resume.summary?.trim(),
    (resume.education?.length ?? 0) > 0,
    (resume.experience?.length ?? 0) > 0,
    (resume.projects?.length ?? 0) > 0,
    (resume.skills?.length ?? 0) > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function formatRange(start?: string, end?: string) {
  if (start && end) return `${start} – ${end}`;
  return end ?? start ?? "";
}

export default function ProfilePage() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
    const token = await getToken();

      const res = await axios.get(`${API_URL}/api/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data: ResumeData = res.data.resumeJson ?? res.data;
      setResume(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? err.message);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Loader2 size={16} className="animate-spin" />
          Loading profile…
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <AlertCircle size={28} className="text-red-400" />
          <p className="text-sm text-gray-500">{error ?? "No profile data found."}</p>
          <button
            onClick={loadProfile}
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { personal, summary, skills, experience, education, projects } = resume;
  const skillCategories = categorizeSkills(skills ?? []);
  const totalSkills = skills?.length ?? 0;
  const completeness = computeCompleteness(resume);

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-6xl mx-auto py-10 px-6">
        {/* profile header */}
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-900 text-white flex items-center justify-center font-semibold text-sm shrink-0">
              {getInitials(personal.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-lg font-semibold text-[#111318]">{personal.name}</h1>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Open to work
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  {completeness}% complete
                  <ArrowRight size={12} />
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1 truncate">
                {[personal.email, personal.phone].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-500 mb-3">Profile details</h3>

        <div className="space-y-6">
          {/* professional summary */}
          <SectionCard title="Professional summary" iconBg="bg-transparent" icon={null} tint>
            {summary ? (
              <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
            ) : (
              <p className="text-sm text-gray-400">
                Add a professional summary, the first thing recruiters read.
              </p>
            )}
          </SectionCard>

          {/* education */}
          <SectionCard
            title="Education"
            subtitle={`${education?.length ?? 0} ${education?.length === 1 ? "entry" : "entries"}`}
            iconBg="bg-violet-100"
            icon={<GraduationCap size={17} className="text-violet-600" />}
          >
            <div className="space-y-5">
              {education?.map((edu, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-500 shrink-0">
                    {getInitials(edu.institution, 3)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111318]">{edu.institution}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {[edu.degree, edu.field].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatRange(edu.startDate, edu.endDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* experience */}
          <SectionCard
            title="Experience"
            subtitle={`${experience?.length ?? 0} ${experience?.length === 1 ? "role" : "roles"}`}
            iconBg="bg-emerald-50"
            icon={<Briefcase size={17} className="text-emerald-600" />}
          >
            <div className="space-y-6">
              {experience?.map((exp, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {getInitials(exp.company)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111318]">{exp.role}</p>
                    <p className="text-sm text-blue-600 mt-0.5">{exp.company}</p>
                    <p className="text-xs text-gray-400 mt-1 mb-2">{formatRange(exp.startDate, exp.endDate)}</p>
                    {exp.description?.length > 0 && (
                      <ul className="text-sm text-gray-500 space-y-1.5 list-disc list-outside pl-4 mb-3">
                        {exp.description.map((d, j) => (
                          <li key={j}>{d}</li>
                        ))}
                      </ul>
                    )}
                    {exp.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {exp.technologies.map((t) => (
                          <Tag key={t} color="orange">
                            {t}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* projects + skills/certifications grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* projects */}
            <div className="flex flex-col gap-6">
              <SectionCard
                title="Projects"
                subtitle={`${projects?.length ?? 0} projects`}
                iconBg="bg-orange-50"
                icon={<Rocket size={17} className="text-orange-500" />}
              >
                <div className="space-y-6">
                  {projects?.map((p) => (
                    <div key={p.name}>
                      <h4 className="text-sm font-semibold text-[#111318] mb-2">{p.name}</h4>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {p.technologies?.map((t) => (
                          <Tag key={t} color="orange">
                            {t}
                          </Tag>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{p.description}</p>
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
                      <p className="text-[11px] font-semibold tracking-wider text-gray-400 mb-2">{cat.label}</p>
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
                  <p className="text-sm text-gray-400">Add credentials, badges, or licenses.</p>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
