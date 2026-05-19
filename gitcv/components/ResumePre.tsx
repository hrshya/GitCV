export default function ResumeAppPreview() {
  return (
    <div className="w-full max-w-[980px] mx-auto rounded-[24px] border border-neutral-200 bg-[#f5f3ef] shadow-[0_12px_40px_rgba(0,0,0,0.05)] overflow-hidden">

      <div className="flex flex-col lg:flex-row min-h-[580px]">

        {/* Sidebar */}
        <aside className="w-full lg:w-[190px] bg-[#ece8e3] border-b lg:border-b-0 lg:border-r border-neutral-200 p-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center text-[10px] font-semibold">
              G
            </div>

            <div>
              <h2 className="text-[12px] font-semibold text-neutral-900">
                gitCV
              </h2>

              <p className="text-[10px] text-neutral-500">
                Resume Builder
              </p>
            </div>
          </div>

          {/* Nav */}
          <div className="space-y-1">
            {[
              "Upload",
              "GitHub",
              "Match",
              "Generate",
            ].map((item, i) => (
              <div
                key={item}
                className={`px-3 py-2 rounded-lg text-[11px] transition-all ${
                  i === 2
                    ? "bg-white border border-neutral-200 text-neutral-900 font-medium"
                    : "text-neutral-500 hover:bg-white/50"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 lg:p-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">

            <div className="max-w-[420px]">
              <p className="text-[9px] tracking-[0.22em] uppercase text-neutral-400 mb-1.5">
                Resume Optimization
              </p>

              <h1 className="text-[24px] leading-tight font-semibold tracking-tight text-neutral-900">
                Backend resume alignment
              </h1>
            </div>

          </div>

          {/* Top Section */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_180px] gap-3 mb-3">

            {/* Match Insight */}
            <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-[#eef8f0] to-[#f8faf8] p-4">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-[10px] text-neutral-500 mb-1">
                    Match Insight
                  </p>

                  <h2 className="text-[20px] leading-tight font-semibold text-neutral-900 mb-1">
                    3 strong projects selected
                  </h2>

                  <p className="text-[11px] leading-5 text-neutral-600">
                    Backend systems • infra • realtime
                  </p>
                </div>

                <div className="w-20 h-20 rounded-full border-[6px] border-green-300 bg-white flex items-center justify-center shrink-0">
                  <div className="text-center">
                    <p className="text-[22px] font-semibold text-neutral-900 leading-none">
                      94
                    </p>

                    <p className="text-[9px] text-neutral-500 mt-1">
                      Match
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signals */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              <p className="text-[10px] text-neutral-500 mb-3">
                Signals
              </p>

              <div className="flex flex-wrap gap-1.5">
                {[
                  ["APIs", "bg-blue-100 text-blue-700"],
                  ["Realtime", "bg-green-100 text-green-700"],
                  ["Redis", "bg-red-100 text-red-700"],
                  ["Scale", "bg-yellow-100 text-yellow-700"],
                ].map(([label, style]) => (
                  <span
                    key={label}
                    className={`px-2 py-1 rounded-md text-[9px] font-medium ${style}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">

            {/* Projects */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] text-neutral-500">
                    Projects
                  </p>

                  <h3 className="text-[17px] font-semibold text-neutral-900 mt-1">
                    Top portfolio
                  </h3>
                </div>

                <span className="px-2 py-1 rounded-full bg-neutral-100 text-[9px] text-neutral-500">
                  Ranked
                </span>
              </div>

              <div className="space-y-2">
                {[
                  [
                    "Realtime Engine",
                    "WebSockets • CRDT",
                  ],
                  [
                    "Queue Infra",
                    "BullMQ • Redis",
                  ],
                  [
                    "API Gateway",
                    "Caching • limits",
                  ],
                ].map(([title, meta]) => (
                  <div
                    key={title}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-neutral-50"
                  >
                    <div>
                      <h4 className="text-[12px] font-semibold text-neutral-900 mb-0.5">
                        {title}
                      </h4>

                      <p className="text-[10px] text-neutral-500">
                        {meta}
                      </p>
                    </div>

                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Bullets */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] text-neutral-500">
                    Resume Bullets
                  </p>

                  <h3 className="text-[17px] font-semibold text-neutral-900 mt-1">
                    ATS optimized
                  </h3>
                </div>

                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[9px] font-medium">
                  Ready
                </span>
              </div>

              <div className="space-y-2">
                {[
                  "Built realtime collaboration using WebSockets + CRDTs.",
                  "Designed Redis queue infrastructure with BullMQ.",
                  "Created scalable API gateway with caching.",
                ].map((bullet) => (
                  <div
                    key={bullet}
                    className="p-3 rounded-xl bg-neutral-50 text-[11px] leading-5 text-neutral-700"
                  >
                    {bullet}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <p className="text-[10px] text-neutral-500">
                  Backend focused
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}