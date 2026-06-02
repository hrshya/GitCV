"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Toaster, toast as notify } from "sonner";
import { GitumeLogo } from "@/components/GitumeLogo";
import { ResumeMarkdownPreview } from "@/components/ResumeMarkdownPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ResumeArtifact = {
  downloadUrl: string;
  expiresAt: string;
  metadata: {
    createdAt: string;
    githubUsername: string;
    name?: string | null;
    resumeId: string;
  };
  pdfReady: boolean;
  pdfUrl: string;
  resultUrl?: string;
  resumeId: string;
  resumeMarkdown: string;
};

type LoadState = "idle" | "loading" | "ready" | "error" | "expired";
type PdfState = "idle" | "loading" | "ready" | "error";

const API_BASE =
  (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
    .trim()
    .replace(/\/+$/, "");

function apiUrl(path: string) {
  return `${API_BASE}/${path.replace(/^\/+/, "")}`;
}

const PDF_TIMEOUT_MS = 120_000;

export default function ResumeResultPage() {
  const params = useParams<{ resumeId: string }>();
  const resumeId = params.resumeId;
  const [artifact, setArtifact] = useState<ResumeArtifact | null>(null);
  const [resumeMarkdown, setResumeMarkdown] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [pdfState, setPdfState] = useState<PdfState>("idle");
  const [previewMode, setPreviewMode] = useState<"pdf" | "web">("pdf");
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pdfVersion, setPdfVersion] = useState(() => Date.now());

  const pdfSrc = useMemo(() => {
    if (!artifact) {
      return "";
    }

    return `${apiUrl(
      `/api/v1/github/resumes/${artifact.resumeId}/pdf?disposition=inline&v=${pdfVersion}`
    )}#toolbar=0&navpanes=0&scrollbar=1&zoom=page-width`;
  }, [artifact, pdfVersion]);

  useEffect(() => {
    let cancelled = false;

    async function loadResume() {
      try {
        setLoadState("loading");
        const response = await axios.get<ResumeArtifact>(apiUrl(`/api/v1/github/resumes/${resumeId}`));

        if (cancelled) {
          return;
        }

        setArtifact(response.data);
        setResumeMarkdown(response.data.resumeMarkdown);
        setHasUnsavedChanges(false);
        setLoadState("ready");

        if (response.data.pdfReady) {
          setPdfState("ready");
          setPdfVersion(Date.now());
        } else {
          await generatePdfPreview(response.data.resumeMarkdown, true);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (axios.isAxiosError(error) && error.response?.status === 410) {
          setLoadState("expired");
        } else {
          setLoadState("error");
        }
      }
    }

    loadResume();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  async function saveDraft(markdown = resumeMarkdown) {
    if (!artifact) {
      return null;
    }

    setIsSaving(true);
    try {
      const response = await axios.put<ResumeArtifact>(
        apiUrl(`/api/v1/github/resumes/${artifact.resumeId}`),
        {
          markdown,
        }
      );
      setArtifact(response.data);
      setResumeMarkdown(response.data.resumeMarkdown);
      setHasUnsavedChanges(false);
      setPdfState("idle");
      notify.success("Draft saved.");
      return response.data;
    } catch (error) {
      notify.error(getErrorMessage(error, "Could not save the draft."));
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function generatePdfPreview(markdown = resumeMarkdown, silent = false) {
    if (!resumeId) {
      return;
    }

    setPdfState("loading");
    try {
      const response = await axios.post<ResumeArtifact>(
        apiUrl(`/api/v1/github/resumes/${resumeId}/pdf`),
        {
          markdown,
        },
        {
          timeout: PDF_TIMEOUT_MS,
        }
      );
      setArtifact(response.data);
      setResumeMarkdown(response.data.resumeMarkdown);
      setHasUnsavedChanges(false);
      setPdfState("ready");
      setPdfVersion(Date.now());
      if (!silent) {
        notify.success("PDF preview updated.");
      }
    } catch (error) {
      setPdfState("error");
      if (!silent) {
        notify.error(getErrorMessage(error, "Could not generate the PDF preview."));
      }
    }
  }

  async function downloadPdf() {
    if (!artifact) {
      return;
    }

    setIsDownloading(true);
    try {
      const response = await axios.post<Blob>(
        apiUrl(`/api/v1/github/download/${artifact.resumeId}`),
        {
          markdown: resumeMarkdown,
        },
        {
          responseType: "blob",
          timeout: PDF_TIMEOUT_MS,
        }
      );
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = getResumeFileName(artifact.metadata.name);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setHasUnsavedChanges(false);
      setPdfState("ready");
      setPdfVersion(Date.now());
      notify.success("PDF download started.");
    } catch (error) {
      notify.error(getErrorMessage(error, "PDF download failed."));
    } finally {
      setIsDownloading(false);
    }
  }

  function updateMarkdown(value: string) {
    setResumeMarkdown(value);
    setHasUnsavedChanges(value !== artifact?.resumeMarkdown);
    setPdfState("idle");
  }

  if (loadState === "loading") {
    return (
      <main className="site create-site">
        <ResultHeader />
        <section className="resume-result-shell shell">
          <div className="inline-loader result-loader">
            <p>Loading saved resume draft...</p>
          </div>
        </section>
      </main>
    );
  }

  if (loadState === "expired" || loadState === "error" || !artifact) {
    return (
      <main className="site create-site">
        <ResultHeader />
        <section className="resume-result-shell shell">
          <div className="result-empty">
            <Badge variant="outline">{loadState === "expired" ? "Expired" : "Not found"}</Badge>
            <h1>{loadState === "expired" ? "This resume link has expired" : "We could not load this resume"}</h1>
            <p>Saved drafts are kept for 24 hours. Generate a fresh resume to continue.</p>
            <Button asChild>
              <Link href="/create">Create a new resume</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="site create-site resume-result-site">
      <ResultHeader />

      <section className="resume-result-shell shell">
        <aside className="result-rail">
          <Badge variant="outline">Saved draft</Badge>
          <h1>{artifact.metadata.name || "Resume draft"}</h1>

          <div className="result-meta-grid">
            <div>
              <span>GitHub</span>
              <strong>{artifact.metadata.githubUsername}</strong>
            </div>
            <div>
              <span>Expires</span>
              <strong>{formatDate(artifact.expiresAt)}</strong>
            </div>
          </div>
        </aside>

        <section className="result-workspace">
          <div className="result-toolbar">
            <div>
              <Badge variant="outline">{hasUnsavedChanges ? "Unsaved edits" : "Saved"}</Badge>
              <p>{pdfState === "loading" ? "Generating PDF preview..." : "Saved for 24 hours. Edit, preview, download."}</p>
            </div>
            <div className="result-actions">
              <Button disabled={!hasUnsavedChanges || isSaving} onClick={() => saveDraft()} type="button" variant="outline">
                {isSaving ? "Saving..." : "Save draft"}
              </Button>
              <Button disabled={pdfState === "loading"} onClick={() => generatePdfPreview()} type="button" variant="outline">
                {pdfState === "loading" ? "Updating..." : "Update PDF"}
              </Button>
              <Button disabled={isDownloading} onClick={downloadPdf} type="button">
                {isDownloading ? "Preparing..." : "Download PDF"}
              </Button>
            </div>
          </div>

          <div className="result-grid">
            <section className="result-editor">
              <div className="result-panel-head">
                <span>Markdown</span>
                <small>{resumeMarkdown.length.toLocaleString()} characters</small>
              </div>
              <Textarea
                className="markdown-editor result-markdown-editor"
                onChange={(event) => updateMarkdown(event.target.value)}
                value={resumeMarkdown}
              />
            </section>

            <section className="result-preview">
              <div className="result-panel-head">
                <span>{previewMode === "pdf" ? "PDF Preview" : "Web Preview"}</span>
                <div className="markdown-mode-toggle" aria-label="Preview mode">
                  <button
                    className={previewMode === "pdf" ? "active" : ""}
                    onClick={() => setPreviewMode("pdf")}
                    type="button"
                  >
                    PDF
                  </button>
                  <button
                    className={previewMode === "web" ? "active" : ""}
                    onClick={() => setPreviewMode("web")}
                    type="button"
                  >
                    Web
                  </button>
                </div>
              </div>

              {previewMode === "pdf" ? (
                <div className="pdf-frame-shell">
                  {pdfState === "ready" ? (
                    <iframe className="pdf-frame" src={pdfSrc} title="PDF resume preview" />
                  ) : (
                    <div className="inline-loader result-loader">
                      <p>
                        {pdfState === "loading"
                          ? "Generating PDF preview..."
                          : "Update the PDF preview to see the final file."}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="markdown-preview-shell result-markdown-preview">
                  <div className="markdown-page" aria-label="Rendered markdown resume preview">
                    <ResumeMarkdownPreview markdown={resumeMarkdown} />
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>
      </section>

      <Toaster position="bottom-right" richColors />
    </main>
  );
}

function ResultHeader() {
  return (
    <header className="nav-shell shell">
      <Link href="/" className="brand-mark" aria-label="Gitume home">
        <GitumeLogo />
      </Link>
      <Button asChild variant="outline">
        <Link href="/create">Create another</Link>
      </Button>
    </header>
  );
}

function getResumeFileName(name?: string | null) {
  const safeName = (name || "Candidate")
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");

  return `${safeName || "Candidate"}_Resume.pdf`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || fallback;
  }

  return fallback;
}
