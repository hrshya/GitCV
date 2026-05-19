"use client";

type Props = {
  score?: number;
};

export default function InsightsPanel({ score = 82 }: Props) {
  return (
    <aside className="surface-card rounded-3xl border border-hairline p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-caption-uppercase text-muted">AI insights</div>
          <h3 className="mt-3 text-title-md font-semibold text-ink">Match & recommendations</h3>
        </div>
        <div className="rounded-full bg-surface-strong px-4 py-3 text-center text-sm font-semibold text-primary">
          ATS
          <div className="mt-2 text-3xl leading-none">{score}%</div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="rounded-3xl border border-hairline bg-surface-strong p-5">
          <div className="text-sm font-semibold text-ink">Top improvements made</div>
          <ul className="mt-4 space-y-3 text-body text-black/70">
            <li>Refined summary for product focus</li>
            <li>Elevated project outcomes with metrics</li>
            <li>Added key technical keywords</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-hairline bg-surface-strong p-5">
          <div className="text-sm font-semibold text-ink">Missing keywords</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Kubernetes', 'AWS', 'GraphQL', 'CI/CD'].map((keyword) => (
              <span key={keyword} className="rounded-full border border-hairline bg-surface px-3 py-2 text-sm text-ink">{keyword}</span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-hairline bg-surface-strong p-5">
          <div className="text-sm font-semibold text-ink">Suggested edits</div>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-body text-black/70">
            <li>Replace generic bullets with measurable outcomes.</li>
            <li>Highlight leadership and cross-team work.</li>
            <li>Surface GitHub projects closer to the top.</li>
          </ol>
        </div>
      </div>
    </aside>
  );
}
