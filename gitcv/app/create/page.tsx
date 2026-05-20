"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Toaster, toast as notify } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

type GenerationState = "idle" | "loading" | "success" | "error";
type GenerateResumeResponse = {
  response?: {
    user?: {
      name?: string;
    };
  };
  resumeId?: string;
  downloadUrl?: string;
  usage?: {
    dailyLimit?: number;
    remainingToday?: number;
    resetAt?: string | null;
  };
};

type BackendErrorResponse = {
  error?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const steps = [
  {
    label: "GitHub",
    title: "Add GitHub username",
    caption: "We use repositories as the project evidence layer.",
  },
  {
    label: "Resume",
    title: "Upload PDF or paste content",
    caption: "Use a PDF resume or paste the current resume text.",
  },
  {
    label: "Role",
    title: "Add job context",
    caption: "Optional, but it helps the engine select the right projects.",
  },
];

const loadingSteps = [
  "Analyzing repositories...",
  "Ranking projects...",
  "Generating resume...",
  "Refining for recruiters...",
];

export default function CreatePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [username, setUsername] = useState("");
  const [resumeData, setResumeData] = useState("");
  const [resumePdf, setResumePdf] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<GenerationState>("idle");
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);
  const [generatedResumeId, setGeneratedResumeId] = useState("");
  const [downloadFileName, setDownloadFileName] = useState("Candidate_Resume.pdf");

  const completion = useMemo(() => {
    const done = [username.trim(), resumeData.trim() || resumePdf, jobDescription.trim()].filter(Boolean).length;
    return Math.round((done / 3) * 100);
  }, [jobDescription, resumeData, resumePdf, username]);

  const hasResumeInput = resumeData.trim().length > 0 || Boolean(resumePdf);
  const canGenerate = username.trim().length > 0 && hasResumeInput;

  useEffect(() => {
    if (status !== "loading") {
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingStepIndex((index) => Math.min(index + 1, loadingSteps.length - 1));
    }, 1400);

    return () => window.clearInterval(interval);
  }, [status]);

  async function submitToBackend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canGenerate) {
      notify.error("Add a GitHub username and resume content first.");
      return;
    }

    setStatus("loading");
    setLoadingStepIndex(0);
    setDownloadReady(false);
    setGeneratedResumeId("");
    setDownloadFileName("Candidate_Resume.pdf");

    try {
      let result: GenerateResumeResponse;
      if (resumePdf) {
        const response = await axios.post<GenerateResumeResponse>(
          `${API_BASE}/api/v1/github`,
          buildPdfPayload()
        );
        result = response.data;
      } else {
        const response = await axios.post<GenerateResumeResponse>(`${API_BASE}/api/v1/github`, {
          username: username.trim(),
          resumeData: resumeData.trim(),
          jobDescription: jobDescription.trim(),
        });
        result = response.data;
      }

      if (!result.resumeId) {
        throw new Error("Generation response did not include a resume id");
      }

      setGeneratedResumeId(result.resumeId);
      setDownloadFileName(getResumeFileName(result.response?.user?.name));
      setStatus("success");
      setDownloadReady(true);
      notify.success(
        typeof result.usage?.remainingToday === "number"
          ? `Resume generated. ${result.usage.remainingToday} generations left today.`
          : "Resume generated. PDF is ready to download."
      );
    } catch (error) {
      setStatus("error");
      notify.error(getBackendErrorMessage(error, "Could not generate the resume. Check the backend and try again."));
    }
  }

  async function downloadPdf() {
    if (!generatedResumeId) {
      notify.error("Generate a resume before downloading.");
      return;
    }

    try {
      const response = await axios.get<Blob>(`${API_BASE}/api/v1/github/download/${generatedResumeId}`, {
        responseType: "blob",
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = downloadFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      notify.success("PDF download started.");
    } catch {
      notify.error("PDF download failed. Generate the resume again and retry.");
    }
  }

  function nextStep() {
    setActiveStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function previousStep() {
    setActiveStep((step) => Math.max(step - 1, 0));
  }

  function buildPdfPayload() {
    const formData = new FormData();
    formData.append("username", username.trim());
    formData.append("jobDescription", jobDescription.trim());
    if (resumeData.trim()) {
      formData.append("resumeData", resumeData.trim());
    }
    if (resumePdf) {
      formData.append("resumePdf", resumePdf);
    }
    return formData;
  }

  function getResumeFileName(name?: string) {
    const safeName = (name || "Candidate")
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, "_")
      .replace(/^_+|_+$/g, "");

    return `${safeName || "Candidate"}_Resume.pdf`;
  }

  function getBackendErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError<BackendErrorResponse>(error)) {
      return error.response?.data?.error || fallback;
    }

    return fallback;
  }

  return (
    <main className="site create-site">
      <header className="nav-shell shell">
        <Link href="/" className="brand-mark" aria-label="GitCV home">
          <span>G</span>
          GitCV
        </Link>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </header>

      <section className="studio-shell shell">
        <aside className="studio-rail">
          <Badge variant="outline">Create route</Badge>
          <h1>Build a role-specific resume in three calm steps</h1>
          <p>
            Paste the pieces you already have. GitCV will use your GitHub projects as evidence and
            shape the final draft around the role.
          </p>

          <div className="progress-card">
            <div>
              <span>Input readiness</span>
              <strong>{completion}%</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${completion}%` }} />
            </div>
          </div>

          <div className="step-list" aria-label="Resume generation steps">
            {steps.map((step, index) => {
              const isComplete =
                (index === 0 && username.trim()) ||
                (index === 1 && hasResumeInput) ||
                (index === 2 && jobDescription.trim());

              return (
                <button
                  className={activeStep === index ? "step-button active" : "step-button"}
                  key={step.label}
                  onClick={() => setActiveStep(index)}
                  type="button"
                >
                  <span>{isComplete ? "OK" : index + 1}</span>
                  <div>
                    <strong>{step.label}</strong>
                    <small>{step.caption}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <form className="studio-form" onSubmit={submitToBackend}>
          <Card className="form-card">
            <CardHeader>
              <Badge variant="outline">{`Step ${activeStep + 1}`}</Badge>
              <CardTitle>{steps[activeStep].title}</CardTitle>
            </CardHeader>

            <CardContent>
              {activeStep === 0 && (
                <div className="field-stack">
                  <label htmlFor="username">GitHub username</label>
                  <Input
                    autoFocus
                    id="username"
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="vasu-devs"
                    value={username}
                  />
                  <p>Use the public username whose repositories should be analyzed.</p>
                </div>
              )}

              {activeStep === 1 && (
                <div className="field-stack">
                  <label htmlFor="resumePdf">Resume PDF</label>
                  <Input
                    accept="application/pdf,.pdf"
                    id="resumePdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      const isPdf =
                        file &&
                        (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
                      if (file && !isPdf) {
                        notify.error("Please select a PDF resume.");
                        event.target.value = "";
                        setResumePdf(null);
                        return;
                      }
                      setResumePdf(file);
                    }}
                    type="file"
                  />
                  <p>{resumePdf ? resumePdf.name : "Upload a PDF resume, or paste the text below instead."}</p>

                  <label htmlFor="resume">Resume content</label>
                  <Textarea
                    id="resume"
                    onChange={(event) => setResumeData(event.target.value)}
                    placeholder="Optional if you uploaded a PDF. Paste resume text here as a fallback..."
                    rows={14}
                    value={resumeData}
                  />
                  <p>When a PDF is uploaded, the backend extracts its text and sends that string through the pipeline.</p>
                </div>
              )}

              {activeStep === 2 && (
                <div className="field-stack">
                  <div className="label-row">
                    <label htmlFor="jobDescription">Job description</label>
                    <Badge variant="outline">Optional</Badge>
                  </div>
                  <Textarea
                    id="jobDescription"
                    onChange={(event) => setJobDescription(event.target.value)}
                    placeholder="Paste the role description when you want stronger project matching..."
                    rows={14}
                    value={jobDescription}
                  />
                  <p>Leave this blank to generate from your GitHub and resume alone.</p>
                </div>
              )}

              {status === "loading" && (
                <div className="smart-loader" role="status" aria-live="polite">
                  <div className="smart-loader-head">
                    <span>Generation pipeline</span>
                    <strong>{loadingSteps[loadingStepIndex]}</strong>
                  </div>
                  <div className="smart-loader-progress" aria-hidden="true">
                    <span style={{ width: `${((loadingStepIndex + 1) / loadingSteps.length) * 100}%` }} />
                  </div>
                  <div className="smart-loader-steps">
                    {loadingSteps.map((step, index) => (
                      <div
                        className={
                          index < loadingStepIndex
                            ? "smart-loader-step complete"
                            : index === loadingStepIndex
                              ? "smart-loader-step active"
                              : "smart-loader-step"
                        }
                        key={step}
                      >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <p>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <Button disabled={activeStep === 0 || status === "loading"} onClick={previousStep} type="button" variant="outline">
                  Back
                </Button>
                {activeStep < steps.length - 1 ? (
                  <Button onClick={nextStep} type="button">
                    Continue
                  </Button>
                ) : (
                  <ShimmerButton disabled={!canGenerate || status === "loading"} type="submit">
                    {status === "loading" ? "Working..." : "Generate Resume"}
                  </ShimmerButton>
                )}
              </div>

              <Button
                className="download-button"
                disabled={!downloadReady || status === "loading"}
                onClick={downloadPdf}
                type="button"
                variant="outline"
              >
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </form>
      </section>

      <Toaster position="bottom-right" richColors />
    </main>
  );
}
