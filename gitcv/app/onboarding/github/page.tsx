"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, CornerDownLeft, MessageCircle, Loader2 } from "lucide-react";

type GithubProfile = {
  avatar_url: string;
  login: string;
  name: string | null;
  public_repos: number;
  bio: string | null;
};

export default function GithubOnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<GithubProfile | null>(null);
  const [status, setStatus] = useState("idle"); // idle | loading | found | not-found

  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      setStatus("idle");
      setProfile(null);
      return;
    }

    setStatus("loading");
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${trimmed}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        setProfile(data);
        setStatus("found");
      } catch {
        setProfile(null);
        setStatus("not-found");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [username]);

  return (
    <div className="max-h-screen bg-[#F6F7F9] font-sans">

      {/* main content */}
      <main className="px-6 md:px-8 py-10">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1px_1fr]">
          {/* left sidebar */}
          <div className="p-8">
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Connect your GitHub and we&apos;ll pull your repos, languages, and
              activity to sharpen your matches.
            </p>
            <ul className="space-y-4">
              {[
                "We read your public repos and pinned projects.",
                "Languages and frameworks build your skill graph.",
                "Contribution activity helps us match technical roles.",
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
              GITHUB
            </p>
            <h1 className="text-3xl font-semibold text-[#111318] mb-3">
              Connect your GitHub.
            </h1>
            <p className="text-sm text-gray-500 mb-8 max-w-lg leading-relaxed">
              Public profile only — we never request write access or see
              private repos.
            </p>

            <p className="text-xs font-semibold tracking-wider text-gray-400 mb-2">
              GITHUB USERNAME
            </p>
            <div
              className={`flex items-center rounded-lg border px-4 py-3 transition-colors ${
                status === "not-found"
                  ? "border-red-200"
                  : "border-gray-200 focus-within:border-gray-400"
              }`}
            >
              <span className="text-sm text-gray-300 mr-0.5">github.com/</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                placeholder="octocat"
                className="flex-1 text-sm text-[#111318] placeholder-gray-300 bg-transparent focus:outline-none"
              />
              {status === "loading" && (
                <Loader2 size={16} className="text-gray-300 animate-spin shrink-0" />
              )}
            </div>
            {status === "not-found" && (
              <p className="text-xs text-red-400 mt-2">
                We couldn&apos;t find that username on GitHub.
              </p>
            )}

            {status === "found" && profile && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <img
                  src={profile.avatar_url}
                  alt={profile.login}
                  className="w-10 h-10 rounded-full"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#111318] truncate">
                    {profile.name || profile.login}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {profile.public_repos} public repos
                    {profile.bio ? ` · ${profile.bio}` : ""}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center gap-4">
              <button
                disabled={status !== "found"}
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 bg-[#111318] text-white text-sm font-medium px-5 py-3 rounded-lg hover:bg-[#22252d] transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
                <span className="bg-white/10 rounded p-1 flex items-center justify-center">
                  <CornerDownLeft size={12} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}