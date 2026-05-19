"use client";

type Props = {
  steps?: string[];
  activeIndex?: number;
};

export default function StepLoader({ steps, activeIndex = 0 }: Props) {
  const items =
    steps || [
      "Fetching GitHub profile",
      "Ranking GitHub projects",
      "Optimizing for the role",
      "Generating ATS-ready layout",
    ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 px-4">
      <div className="w-full max-w-3xl surface-card rounded-3xl border border-hairline p-8">
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
                  index <= activeIndex ? "bg-primary" : "bg-surface-strong"
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
                index === activeIndex ? "border-primary bg-surface-strong" : "border-hairline bg-surface"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-strong text-sm font-semibold text-ink">{index + 1}</div>
              <div>
                <p className="text-body font-medium text-ink">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
