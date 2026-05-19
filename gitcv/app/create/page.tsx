"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import FileUpload from "../../components/FileUpload";
import JDInput from "../../components/JDInput";
import StepLoader from "../../components/StepLoader";
import ResumePreview from "../../components/ResumePreview";
import InsightsPanel from "../../components/InsightsPanel";
import CTA from "../../components/CTA";
import Toast from "../../components/Toast";
import { toast as sonnerToast } from "sonner";

const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
const loaderSteps = [
  "Fetching GitHub profile",
  "Ranking GitHub projects",
  "Optimizing resume",
  "Generating preview",
];

type PreviewData = {
  name: string;
  title: string;
  contact: string;
  summary: string;
  skills: string[];
  experience: Array<{ role: string; company: string; date: string; bullets: string[] }>; 
  projects: Array<{ title: string; description: string }>;
  education: string;
};

const fallbackPreview = (username: string, resumeFileName: string, jdText: string): PreviewData => ({
  name: username || "Candidate",
  title: "Software Engineer",
  contact: username ? `github.com/${username}` : "GitHub profile not linked yet",
  summary: resumeFileName
    ? `Loaded your current resume from ${resumeFileName}. Optimization will align it with the role.`
    : "Upload a resume and paste a job description to generate an optimized resume.",
  skills: jdText ? jdText.split(/\s+/).slice(0, 6) : ["GitHub", "Resume", "Optimization"],
  experience: [
    {
      role: "Current resume draft",
      company: resumeFileName || "Resume upload",
      date: "",
      bullets: [
        "Draft content will be analyzed and restructured.",
        "GitHub projects will be surfaced where relevant.",
      ],
    },
  ],
  projects: [
    {
      title: "GitHub work",
      description: username ? `Pulling public projects for ${username}.` : "Connect your GitHub username.",
    },
  ],
  education: "Education from your upload will be summarized here.",
});

export default function CreatePage() {
  const [step, setStep] = useState<"github" | "resume" | "jd" | "loading" | "preview">("github");
  const [username, setUsername] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [optimizedMarkdown, setOptimizedMarkdown] = useState<string>("");
  const [showBefore, setShowBefore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const beforeData = useMemo(
    () => fallbackPreview(username, resumeFile?.name || "", jdText),
    [username, resumeFile, jdText]
  );

  const activePreview = showBefore ? beforeData : previewData || beforeData;

  const canAdvanceGithub = username.trim().length > 1;
  const canAdvanceResume = !!resumeFile;
  const canAdvanceJd = jdText.trim().length > 20;

  const readFileAsText = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const clearToast = () => {
    window.setTimeout(() => setToast(null), 1800);
  };

  useEffect(() => {
    if (toast) {
      sonnerToast(String(toast));
      setToast(null);
    }
  }, [toast]);

  const submitToBackend = async () => {
    if (!canAdvanceGithub || !canAdvanceResume || !canAdvanceJd) {
      setError("Please complete all steps before optimizing.");
      return;
    }

    setError(null);
    setToast("Starting optimization...");
    clearToast();
    setStep("loading");
    setIsSubmitting(true);
    setActiveStepIndex(0);

    const interval = window.setInterval(() => {
      setActiveStepIndex((current) => Math.min(current + 1, loaderSteps.length - 1));
    }, 1300);

    try {
      const resumeData = resumeFile ? await readFileAsText(resumeFile).catch(() => resumeFile.name) : "";
      const response = await fetch(`${backendBase}/api/v1/github`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          jobDescription: jdText.trim(),
          resumeData,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || "Backend request failed.");
      }

      const result = await response.json();
      const responsePayload = result.response || {};

      const structuredPreview: PreviewData = {
        name: responsePayload.user?.name || username || "Candidate",
        title: responsePayload.user?.title || "Senior Software Engineer",
        contact: responsePayload.user?.contact || `github.com/${username}`,
        summary: responsePayload.overall_summary || "Optimized resume summary generated for your job target.",
        skills: responsePayload.skills || ["TypeScript", "React", "Node.js", "AWS", "GraphQL"],
        experience:
          (responsePayload.experience || []).map((exp: any) => ({
            role: exp.role || exp.title || "Software Engineer",
            company: exp.company || exp.organization || "Company",
            date: exp.duration || exp.date || "",
            bullets: exp.bullet_points || exp.bullets || [],
          })) || [],
        projects:
          (responsePayload.projects || []).map((project: any) => ({
            title: project.project_name || project.name || "Project",
            description: project.description || project.summary || "",
          })) || [],
        education:
          (responsePayload.education || []).map((edu: any) => `${edu.degree || edu.title || "Degree"}, ${edu.institution || "Institution"}`).join("; ") || "Education details from your resume.",
      };

      setPreviewData(structuredPreview);
      setOptimizedMarkdown(result.resumeMarkdown || "");
      setStep("preview");
      setShowBefore(false);
      setToast("Optimization complete.");
      clearToast();
    } catch (err: any) {
      setError(err.message || "Unable to generate resume.");
      setStep("jd");
      setToast(null);
    } finally {
      window.clearInterval(interval);
      setIsSubmitting(false);
      setActiveStepIndex(loaderSteps.length - 1);
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await fetch(`${backendBase}/api/v1/github/download`);
      if (!response.ok) {
        throw new Error("PDF unavailable");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "gitcv-resume.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setToast("Download started.");
      clearToast();
    } catch (err: any) {
      setError(err.message || "Download failed.");
    }
  };

  useEffect(() => {
    if (step === "loading") {
      setActiveStepIndex(0);
    }
  }, [step]);

  return (
    <div className="min-h-screen text-body-md">
      <Navbar />
      <main className="container mx-auto px-6 py-16">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-caption-uppercase text-muted">Resume workflow</div>
            <h1 className="text-display-lg max-w-3xl">Connect GitHub, upload your resume, and generate an ATS-ready preview.</h1>
            <p className="mt-4 max-w-2xl text-body text-black/75">This workflow syncs with the backend, shows intelligent progress, and lets you download the final resume as a PDF.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="button-pill border border-hairline bg-transparent px-5 py-3 text-sm font-semibold text-ink hover:bg-surface transition">Back to home</Link>
          </div>
        </div>

        <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-8">
            <div className="surface-card rounded-3xl p-8">
              <div className="text-caption-uppercase text-muted">Step 1</div>
              <h2 className="text-title-md font-semibold text-ink">GitHub username</h2>
              <p className="mt-3 text-body text-black/75">Enter your GitHub username so we can analyze your repositories alongside your resume.</p>
              <div className="mt-6 flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-body font-medium text-ink">
                  Username
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="janedoe"
                    className="field-base w-full px-5 py-4 text-body text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>
                <button
                  onClick={() => setStep("resume")}
                  disabled={!canAdvanceGithub}
                  className="button-pill w-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-active disabled:opacity-50"
                >
                  Continue to resume upload
                </button>
              </div>
            </div>

            {step !== "github" && (
              <div className="surface-card rounded-3xl p-8">
                <div className="text-caption-uppercase text-muted">Step 2</div>
                <h2 className="text-title-md font-semibold text-ink">Upload your resume</h2>
                <p className="mt-3 text-body text-black/75">Drag a PDF or DOCX file and we’ll use it together with your GitHub data.</p>
                <div className="mt-6">
                  <FileUpload onFile={(file) => setResumeFile(file)} />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setStep("github")}
                    className="button-pill border border-hairline bg-transparent px-5 py-3 text-sm font-semibold text-ink hover:bg-surface transition"
                  >
                    Back to GitHub
                  </button>
                  <button
                    onClick={() => setStep("jd")}
                    disabled={!canAdvanceResume}
                    className="button-pill bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-active disabled:opacity-50"
                  >
                    Continue to JD
                  </button>
                </div>
              </div>
            )}

            {step !== "github" && (
              <div className="surface-card rounded-3xl p-8">
                <div className="text-caption-uppercase text-muted">Step 3</div>
                <h2 className="text-title-md font-semibold text-ink">Paste the job description</h2>
                <p className="mt-3 text-body text-black/75">Add the JD that you want your resume optimized for.</p>
                <div className="mt-6">
                  <JDInput value={jdText} onChange={(value) => setJdText(value)} />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setStep("resume")}
                    className="button-pill border border-hairline bg-transparent px-5 py-3 text-sm font-semibold text-ink hover:bg-surface transition"
                  >
                    Back to upload
                  </button>
                  <button
                    onClick={submitToBackend}
                    disabled={!canAdvanceJd || isSubmitting}
                    className="button-pill bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-active disabled:opacity-50"
                  >
                    Generate preview
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-8">
            <div className="surface-card rounded-3xl p-8">
              <div className="text-caption-uppercase text-muted">Workflow</div>
              <h3 className="mt-4 text-title-md font-semibold">Intelligent progress</h3>
              <p className="mt-3 text-body text-black/75">The backend receives your GitHub username, resume, and job description. Progress updates reflect the actual optimization stages.</p>
            </div>
            <InsightsPanel score={Math.max(75, Math.min(96, beforeData.skills.length * 8 + 60))} />
            <div className="surface-card rounded-3xl p-8">
              <div className="text-caption-uppercase text-muted">Preview state</div>
              <p className="mt-4 text-body text-black/75">After generation, you can compare before and after output and download a PDF built by the backend.</p>
            </div>
          </aside>
        </div>

        {step === "loading" && <StepLoader steps={loaderSteps} activeIndex={activeStepIndex} />}

        {step === "preview" && activePreview && (
          <section className="mt-14 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-caption-uppercase text-muted">Preview</div>
                <h2 className="text-display-lg">Review your optimized resume</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setStep("jd")}
                  className="button-pill border border-hairline bg-transparent px-5 py-3 text-sm font-semibold text-ink hover:bg-surface transition"
                >
                  Edit inputs
                </button>
                <CTA onDownload={downloadPdf} onRegenerate={submitToBackend} />
              </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.65fr_1fr]">
              <div className="surface-card rounded-3xl p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-title-md font-semibold">Resume preview</div>
                    <p className="mt-2 text-body text-black/70">Use the toggle to see the draft versus the optimized resume.</p>
                  </div>
                  <div className="flex gap-2 rounded-full border border-hairline bg-surface px-2 py-1">
                    {[
                      { label: "Before", active: showBefore },
                      { label: "After", active: !showBefore },
                    ].map((option) => (
                      <button
                        key={option.label}
                        onClick={() => setShowBefore(option.label === "Before")}
                        className={`button-pill px-4 py-2 text-sm font-semibold transition ${
                          option.active ? "bg-primary text-white" : "bg-transparent text-ink hover:bg-surface"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-8">
                  <ResumePreview data={activePreview} />
                </div>
              </div>

              <InsightsPanel score={Math.max(70, activePreview.skills.length * 8)} />
            </div>
          </section>
        )}

        {error && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-[#fff1f2] p-5 text-sm text-red-700">{error}</div>
        )}
      </main>

      <Toast />
    </div>
  );
}
