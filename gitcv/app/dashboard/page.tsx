"use client";

import JobCard from "@/components/JobCard";
import axios from "axios";
import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";

export interface Department {
    id: number;
    name: string;
    child_ids: number[];
    parent_id: number | null;
}

export interface Office {
    id: number;
    name: string;
    location: string;
    child_ids: number[];
    parent_id: number | null;
}

export interface JobPosting {
    id: number;
    companyId: number;
    companyName: string;
    externalId: string;
    title: string;
    content: string;
    absoluteUrl: string;
    location: string;
    isActive: boolean;
    metadata: unknown | null;
    department: Department[];
    offices: Office[];
    postedAt: string | null;
    updatedAt: string;
    createdAt: string;
}

type Status = "loading" | "ready" | "error";

export default function Dashboard() {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [status, setStatus] = useState<Status>("loading");

    useEffect(() => {
        let cancelled = false;

        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs/active`)
            .then((res) => {
                if (cancelled) return;
                setJobs(res.data.jobs);
                setStatus("ready");
            })
            .catch(() => {
                if (cancelled) return;
                setStatus("error");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (status === "loading") {
        return <JobGridSkeleton />;
    }

    if (status === "error") {
        return (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
                <TriangleAlert className="h-5 w-5 text-rose-500" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Couldn't load open roles. Refresh the page to try again.
                </p>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    No open roles right now. Check back soon.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
    );
}

function JobGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <JobCardSkeleton key={i} />
            ))}
        </div>
    );
}

function JobCardSkeleton() {
    return (
        <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                    <div className="h-3 w-1/3 rounded bg-gray-200" />
                </div>
                <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
            </div>

            <div className="mt-4 flex gap-2">
                <div className="h-5 w-16 rounded-full bg-gray-200" />
                <div className="h-5 w-14 rounded-full bg-gray-200" />
                <div className="h-5 w-20 rounded-full bg-gray-200" />
            </div>

            <div className="mt-5 space-y-2">
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-4/5 rounded bg-gray-200" />
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="h-3 w-24 rounded bg-gray-200" />
                <div className="h-8 w-24 rounded-md bg-gray-200" />
            </div>
        </div>
    );
}
