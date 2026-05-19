"use client";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

export default function JDInput({ value = "", onChange }: Props) {
  const max = 5000;

  return (
    <div className="surface-card rounded-3xl border border-hairline p-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-caption-uppercase text-muted">Job description</div>
          <div className="text-title-md font-semibold text-ink">Paste the role details</div>
        </div>
        <div className="rounded-full border border-hairline px-3 py-1 text-xs uppercase tracking-[0.14em] text-muted">Optional upload</div>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="Paste the job description here..."
        maxLength={max}
        className="field-base min-h-[240px] w-full resize-none px-5 py-4 text-body text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <span className="text-body text-black/70">or upload JD file</span>
        <span>{value.length}/{max}</span>
      </div>
    </div>
  );
}
