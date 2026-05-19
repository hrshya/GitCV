"use client";

type Props = {
  onDownload?: () => void;
  onRegenerate?: () => void;
};

export default function CTA({ onDownload, onRegenerate }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onDownload}
        className="button-pill bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-active"
      >
        Download PDF
      </button>
      <button
        type="button"
        onClick={onRegenerate}
        className="button-pill border border-hairline bg-transparent px-5 py-3 text-sm font-semibold text-ink transition hover:bg-surface"
      >
        Regenerate
      </button>
    </div>
  );
}
