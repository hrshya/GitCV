"use client";

import axios from "axios";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, LogOut, CornerDownLeft, MessageCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function ResumeUploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      setSelectedFile(files[0]);
      setFileName(files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("resumePdf", selectedFile);

    try {
        const token = await getToken();

        await axios.post("http://localhost:3001/api/v1/resume/upload", formData, {
            headers: {
            "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        router.push("/onboarding/github");
    } catch (error) {
        console.error("Resume upload failed", error);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] font-sans">

      {/* main content */}
      <main className="px-6 md:px-8 py-10">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1px_1fr]">
          {/* left sidebar */}
          <div className="p-8">
            <p className="text-xs font-semibold tracking-wider text-gray-400 mb-4">
              GETTING STARTED
            </p>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Upload your resume and we&apos;ll extract your profile, draft a cover letter,
              and queue jobs for you, usually in under a minute.
            </p>
            <ul className="space-y-4">
              {[
                "AI pulls your skills, roles, and dates straight from the PDF.",
                "A first-pass cover letter is written from your experience.",
                "Personalized matches ready by the time you finish setup.",
              ].map((text, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-gray-500 leading-relaxed">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:block bg-gray-100" />

          {/* right content */}
          <div className="p-8 md:p-10">
            <p className="text-xs font-semibold tracking-wider text-gray-400 mb-2">
              RESUME
            </p>
            <h1 className="text-3xl font-semibold text-[#111318] mb-3">
              Upload your resume.
            </h1>
            <p className="text-sm text-gray-500 mb-6 max-w-lg leading-relaxed">
              PDF only, under 10MB. We parse it, draft a cover letter, and have
              matches waiting by the time you finish setup.
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed py-14 flex flex-col items-center justify-center text-center transition-colors ${
                isDragging ? "border-gray-400 bg-gray-50" : "border-gray-200"
              }`}
            >
              <UploadCloud className="text-gray-300 mb-3" size={34} strokeWidth={1.5} />
              {fileName ? (
                <p className="text-sm font-medium text-[#111318]">{fileName}</p>
              ) : (
                <>
                  <p className="text-sm text-[#111318]">
                    Drop your PDF here, or{" "}
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="underline font-medium"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Resume · PDF only · up to 10MB
                  </p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button onClick={handleUpload} className="flex items-center gap-2 bg-[#111318] text-white text-sm font-medium px-5 py-3 rounded-lg hover:bg-[#22252d] transition">
                Continue
                <span className="bg-white/10 rounded p-1 flex items-center justify-center">
                  <CornerDownLeft size={12} />
                </span>
              </button>
              <span className="text-xs text-gray-400">Takes about 30 seconds</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
