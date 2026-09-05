"use client";

import ResumeGenerator from "@/components/pdf-generate";
import axios from "axios";
import DOMPurify from "isomorphic-dompurify";
import { AlertCircle, Building2, CalendarClock, ExternalLink, MapPin, RefreshCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type Department = {
  id: number;
  name: string;
  child_ids: number[];
  parent_id: number | null;
};

type Office = {
  id: number;
  name: string;
  location: string;
  child_ids: number[];
  parent_id: number | null;
};

type Job = {
  id: number;
  companyId: number;
  companyName: string;
  externalId: string;
  title: string;
  content: string;
  absoluteUrl: string;
  location: string;
  isActive: boolean;
  metadata: unknown;
  department: Department[];
  offices: Office[];
  postedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

type JobResponse = {
  job: Job;
};

function decodeHtmlEntities(html: string): string {
  if (typeof document === "undefined") return html;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
}

function sanitizeJobContent(rawContent: string): string {
  const decoded = decodeHtmlEntities(rawContent);

  return DOMPurify.sanitize(decoded, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "ul", "ol", "li", "a",
      "h1", "h2", "h3", "h4", "blockquote", "span", "div",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

function useJob(jobId: string | undefined) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const refetch = useCallback(() => setRetryToken((n) => n + 1), []);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      setError("Missing job id.");
      return;
    }

    if (!BACKEND_URL) {
      setLoading(false);
      setError("Backend URL is not configured.");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get<JobResponse>(`${BACKEND_URL}/api/v1/jobs/job/${jobId}`, {
        signal: controller.signal,
      })
      .then((res) => setJob(res.data.job))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        console.error("Failed to fetch job:", err);
        setError("We couldn't load this job. Please try again.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [jobId, retryToken]);

  return { job, loading, error, refetch };
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`}
        aria-hidden="true"
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm text-slate-700">
      {children}
    </span>
  );
}

function TaxonomyGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function JobHeader({ job }: { job: Job }) {
  const postedDate = formatDate(job.postedAt);

  return (
    <header className="mb-8 border-b border-slate-200 pb-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge isActive={job.isActive} />
        <Badge>Job ID {job.id}</Badge>
        <Badge>External ID {job.externalId}</Badge>
      </div>

      <div>
        <ResumeGenerator jobId={job.id}  />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{job.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-600">
        <span className="flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {job.companyName}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {job.location}
        </span>
        {postedDate && (
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Posted {postedDate}
          </span>
        )}
      </div>

      <a
        href={job.absoluteUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
      >
        View original posting
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </header>
  );
}

function JobDescription({ content }: { content: string }) {
  const html = useMemo(() => sanitizeJobContent(content), [content]);

  return (
    <section aria-label="Job description" className="prose prose-slate max-w-none">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

function JobTaxonomy({
  departments = [],
  offices = [],
}: {
  departments?: Department[];
  offices?: Office[];
}) {
  if (departments.length === 0 && offices.length === 0) return null;

  return (
    <div className="mt-10 grid gap-8 sm:grid-cols-2">
      {departments.length > 0 && (
        <TaxonomyGroup label="Departments">
          {departments.map((dept) => (
            <Tag key={dept.id}>{dept.name}</Tag>
          ))}
        </TaxonomyGroup>
      )}

      {offices.length > 0 && (
        <TaxonomyGroup label="Offices">
          {offices.map((office) => (
            <Tag key={office.id}>
              {office.name} — {office.location}
            </Tag>
          ))}
        </TaxonomyGroup>
      )}
    </div>
  );
}

function JobSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-6 py-10" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading job details…</span>
      <div className="mb-3 flex gap-2">
        <div className="h-6 w-20 rounded-full bg-slate-200" />
        <div className="h-6 w-24 rounded-full bg-slate-200" />
      </div>
      <div className="h-8 w-2/3 rounded bg-slate-200" />
      <div className="mt-3 h-4 w-1/3 rounded bg-slate-200" />
      <div className="mt-8 space-y-3">
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}

function JobErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-5 text-red-700"
      >
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          {message}
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
        >
          <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Try again
        </button>
      </div>
    </div>
  );
}

export default function JobDashboardPage() {
  const params = useParams();
  const jobId = params.jobId as string | undefined;

  const { job, loading, error, refetch } = useJob(jobId);

  if (loading) return <JobSkeleton />;
  if (error) return <JobErrorState message={error} onRetry={refetch} />;
  if (!job) {
    return <div className="mx-auto max-w-4xl px-6 py-10 text-slate-500">No job found.</div>;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <JobHeader job={job} />
      <JobDescription content={job.content} />
      <JobTaxonomy departments={job.department} offices={job.offices} />
    </main>
  );
}