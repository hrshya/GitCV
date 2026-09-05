"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Download, ExternalLink, RotateCcw, TriangleAlert } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Status = "idle" | "generating" | "ready" | "error";

interface ResumeGeneratorProps {
    jobId: number | string;
    viewPath?: string;
    onGenerated?: (pdfUrl: string) => void;
}

export default function ResumeGenerator({
    jobId,
    viewPath,
    onGenerated,
}: ResumeGeneratorProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const [status, setStatus] = useState<Status>("idle");
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const requestId = useRef(0);

    const generate = useCallback(async () => {
        const thisRequest = ++requestId.current;
        setStatus("generating");
        setError(null);

        try {
            const token = await getToken();
            const res = await axios.post(
                `${API_BASE_URL}/api/v1/resume/generate/${jobId}`,
                null,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const body = res.data;
            if (!body?.pdfUrl) {
                throw new Error(body?.error || body?.msg || "Couldn't generate the resume.");
            }
            if (thisRequest !== requestId.current) return;

            setPdfUrl(body.pdfUrl);
            setStatus("ready");
            onGenerated?.(body.pdfUrl);
        } catch (err) {
            if (thisRequest !== requestId.current) return;
            const message = axios.isAxiosError(err)
                ? err.response?.data?.error || err.response?.data?.msg || err.message
                : err instanceof Error
                ? err.message
                : "Couldn't generate the resume.";
            setError(message);
            setStatus("error");
        }
    }, [jobId, getToken, onGenerated]);

    const download = useCallback(async () => {
        if (!pdfUrl) return;
        try {
            const res = await axios.get(pdfUrl, { responseType: "blob" });
            const blobUrl = URL.createObjectURL(res.data);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `resume-${jobId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(pdfUrl, "_blank", "noopener,noreferrer");
        }
    }, [pdfUrl, jobId]);

    const view = useCallback(() => {
        router.push(viewPath ?? `/resume/${jobId}`);
    }, [router, viewPath, jobId]);

    return (
        <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    resume · job #{jobId}
                </span>
                <StatusDot status={status} />
            </div>

            <div className="p-4">
                {status === "idle" && (
                    <>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Compile your ranked repos and details into a tailored resume for this job.
                        </p>
                        <button
                            onClick={generate}
                            className="mt-3 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            Generate resume
                        </button>
                    </>
                )}

                {status === "generating" && <GeneratingState />}

                {status === "error" && (
                    <div role="alert" aria-live="assertive">
                        <div className="flex gap-2 text-sm text-rose-600 dark:text-rose-400">
                            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>{error}</p>
                        </div>
                        <button
                            onClick={generate}
                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Try again
                        </button>
                    </div>
                )}

                {status === "ready" && (
                    <div aria-live="polite">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Resume ready.
                        </p>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={download}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </button>
                            <button
                                onClick={view}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusDot({ status }: { status: Status }) {
    const color =
        status === "ready"
            ? "bg-emerald-500"
            : status === "generating"
            ? "bg-amber-500"
            : status === "error"
            ? "bg-rose-500"
            : "bg-zinc-300 dark:bg-zinc-700";

    return (
        <span className="relative flex h-2 w-2">
            {status === "generating" && (
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`} />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
        </span>
    );
}

function GeneratingState() {
    return (
        <div aria-live="polite">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Building your resume&hellip;
            </p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                <div className="h-full w-1/3 animate-[scan_1.1s_ease-in-out_infinite] rounded-full bg-zinc-900 dark:bg-white" />
            </div>
            <style>{`
                @keyframes scan {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                }
            `}</style>
        </div>
    );
}