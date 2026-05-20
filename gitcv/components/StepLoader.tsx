"use client";

type Props = {
  steps?: string[];
  activeIndex?: number;
  label?: string;
  inline?: boolean;
};

export default function StepLoader({ steps, activeIndex = 0, label, inline = true }: Props) {
  const items =
    steps || [
      "Fetching GitHub profile",
      "Ranking GitHub projects",
      "Optimizing for the role",
      "Generating ATS-ready layout",
    ];

  if (inline) {
    return (
      <div className="inline-loader">
        <div className="loader-pulse" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p>{label || items[activeIndex] || "Generating your resume"}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 px-4">
      <div className="w-full max-w-3xl rounded-3xl border border-[#e7e5e4] bg-white p-8 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-caption-uppercase text-muted">Optimizing</div>
            <div className="text-title-md font-semibold text-ink">Generating your resume preview</div>
          </div>
          <div className="flex items-center gap-2">
            {items.map((_, index) => (
              <span
                key={index}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index <= activeIndex ? "bg-[#16120f]" : "bg-[#ece8e3]"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="mt-8 space-y-4">
          {items.map((step, index) => (
            <div
              key={step}
              className={`flex items-center gap-4 rounded-3xl border p-4 transition ${
                index === activeIndex
                  ? "border-[#16120f] bg-[#f7f5f2]"
                  : "border-[#e7e5e4] bg-white"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1eeea] text-sm font-semibold text-[#0c0a09]">
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-[#0c0a09]">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
