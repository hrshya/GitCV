"use client";

import JobCard from "@/components/JobCard";
import axios from "axios";
import { useEffect, useState } from "react";

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

export default function Dashboard() {
    let [Jobs, setJobs] = useState<JobPosting[]>([]);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs/active`).then((res) => {
            setJobs(res.data.jobs);
            console.log("Jobs fetched successfully:", res.data.jobs);
        });
    }, [])


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Jobs.map((job) => (
                <JobCard
                    key={job.id}
                    job={job}
                />
            ))}
        </div>
    )
}