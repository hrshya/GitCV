"use client";

import Link from "next/link";
import { useState } from "react";
import { toast as sonnerToast } from "sonner";
import StepLoader from "../../components/StepLoader";
import Toast from "../../components/Toast";

const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
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

type BackendResponsePayload = {
  user?: { name?: string; title?: string; contact?: string };
  overall_summary?: string;
  skills?: string[];
  experience?: Array<{
    role?: string;
    title?: string;
    company?: string;
    organization?: string;
    duration?: string;
    date?: string;
    bullet_points?: string[];
    bullets?: string[];
  }>;
  projects?: Array<{
    project_name?: string;
    name?: string;
    description?: string;
    summary?: string;
  }>;
  education?: Array<{
    degree?: string;
    title?: string;
    institution?: string;
  }>;
};

export default function CreatePage() {
  const [step, setStep] = useState<"input" | "loading">("input");
  const [activeFormStep, setActiveFormStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState("");
  const [resumeInput, setResumeInput] = useState("");
  const [jdText, setJdText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canContinueFromStepOne = username.trim().length > 1;
  const canContinueFromStepTwo = resumeInput.trim().length > 20;
  const canGenerate = username.trim().length > 1 && resumeInput.trim().length > 20;

  const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  const submitToBackend = async () => {
    if (!canGenerate) {
      setError("Please complete all steps before optimizing.");
      return;
    }

    setError(null);
    sonnerToast("Starting optimization...");
    setStep("loading");
    setIsSubmitting(true);
    setActiveStepIndex(0);

    const interval = window.setInterval(() => {
      setActiveStepIndex((current) => Math.min(current + 1, loaderSteps.length - 1));
    }, 1300);

    try {
      const resumeData = resumeInput.trim();
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

      const result: { response?: BackendResponsePayload; resumeMarkdown?: string } = await response.json();
      const responsePayload = result.response || {};

      const structuredPreview: PreviewData = {
        name: responsePayload.user?.name || username || "Candidate",
        title: responsePayload.user?.title || "Senior Software Engineer",
        contact: responsePayload.user?.contact || `github.com/${username}`,
        summary: responsePayload.overall_summary || "Optimized resume summary generated for your job target.",
        skills: responsePayload.skills || ["TypeScript", "React", "Node.js", "AWS", "GraphQL"],
        experience:
          (responsePayload.experience || []).map((exp) => ({
            role: exp.role || exp.title || "Software Engineer",
            company: exp.company || exp.organization || "Company",
            date: exp.duration || exp.date || "",
            bullets: exp.bullet_points || exp.bullets || [],
          })) || [],
        projects:
          (responsePayload.projects || []).map((project) => ({
            title: project.project_name || project.name || "Project",
            description: project.description || project.summary || "",
          })) || [],
        education:
          (responsePayload.education || [])
            .map((edu) => `${edu.degree || edu.title || "Degree"}, ${edu.institution || "Institution"}`)
            .join("; ") || "Education details from your resume.",
      };

      setPreviewData(structuredPreview);
      setStep("input");
      sonnerToast("Optimization complete.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to generate resume."));
      setStep("input");
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
      sonnerToast("Download started.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Download failed."));
    }
  };

  const downloadDisabled = !previewData;

  return (
    <div className="create-page">
      <div className="backdrop-aura" />

      <header className="create-nav">
        <Link className="brand-pill" href="/">
          GitCV
        </Link>
        <Link className="secondary-button" href="/">
          Back to Home
        </Link>
      </header>

      <main className="create-main">
        <section className="create-layout">
          <section className="create-form-surface">
            <div className="form-head">
              <p className="eyebrow">Create Route</p>
              <h2>Build your resume in 3 steps</h2>
            </div>

            <div className="stepper-rail" aria-label="Resume creation steps">
              {[
                { id: 1, label: "GitHub" },
                { id: 2, label: "Resume" },
                { id: 3, label: "Job Description" },
              ].map((item) => {
                const isCompleted = activeFormStep > item.id;
                const isActive = activeFormStep === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveFormStep(item.id as 1 | 2 | 3)}
                    className={`step-chip ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                  >
                    <span>{item.id}</span>
                    <strong>{item.label}</strong>
                  </button>
                );
              })}
            </div>

            <div className="form-grid">
              {activeFormStep === 1 ? (
                <article className="step-panel">
                  <header>
                    <p className="eyebrow">Step 1</p>
                    <h3>Add GitHub username</h3>
                  </header>
                  <label className="field-group">
                    <span>GitHub Username</span>
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="janedoe"
                    />
                  </label>
                  <div className="panel-actions single">
                    <button
                      type="button"
                      className="primary-button"
                      disabled={!canContinueFromStepOne}
                      onClick={() => setActiveFormStep(2)}
                    >
                      Continue
                    </button>
                  </div>
                </article>
              ) : null}

              {activeFormStep === 2 ? (
                <article className="step-panel">
                  <header>
                    <p className="eyebrow">Step 2</p>
                    <h3>Paste your resume</h3>
                  </header>
                  <label className="field-group">
                    <span>Resume Content</span>
                    <textarea
                      value={resumeInput}
                      onChange={(event) => setResumeInput(event.target.value)}
                      placeholder="Paste your resume text..."
                    />
                  </label>
                  <p className="step-helper">{resumeInput.length} characters</p>
                  <div className="panel-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setActiveFormStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      disabled={!canContinueFromStepTwo}
                      onClick={() => setActiveFormStep(3)}
                    >
                      Continue
                    </button>
                  </div>
                </article>
              ) : null}

              {activeFormStep === 3 ? (
                <article className="step-panel">
                  <header>
                    <p className="eyebrow">Step 3</p>
                    <h3>Paste job description (optional)</h3>
                  </header>
                  <label className="field-group">
                    <span>Job Description (Optional)</span>
                    <textarea
                      value={jdText}
                      onChange={(event) => setJdText(event.target.value)}
                      placeholder="Paste the job description (or leave empty)..."
                    />
                  </label>
                  <p className="step-helper">{jdText.length} characters (optional)</p>
                  <div className="panel-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setActiveFormStep(2)}
                    >
                      Back
                    </button>
                    <button
                      onClick={submitToBackend}
                      disabled={isSubmitting || !canGenerate}
                      className="primary-button"
                    >
                      {isSubmitting ? "Generating..." : "Generate Resume"}
                    </button>
                  </div>
                </article>
              ) : null}

              <div className="create-actions">
                <button
                  onClick={downloadPdf}
                  disabled={downloadDisabled}
                  className="secondary-button full-width"
                >
                  Download PDF
                </button>
              </div>

              {error ? <p className="form-error">{error}</p> : null}

              {previewData ? (
                <div className="result-strip">
                  <span>Resume draft generated for {previewData.name}</span>
                  <button onClick={downloadPdf}>Download latest PDF</button>
                </div>
              ) : null}
            </div>
          </section>
        </section>

        {step === "loading" ? <StepLoader steps={loaderSteps} activeIndex={activeStepIndex} /> : null}

      </main>

      <Toast />
    </div>
  );
}
