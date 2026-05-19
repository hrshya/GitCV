"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onFile?: (file: File) => void;
};

export default function FileUpload({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      setFileName(file.name);
      onFile?.(file);
    },
    [onFile]
  );

  return (
    <div className="relative surface-card rounded-3xl border border-hairline p-7">
      <div className="absolute right-6 top-6 h-24 w-24 orb orb-sky" />
      <div className="absolute left-6 bottom-6 h-24 w-24 orb orb-rose" />
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          handleFile(file);
        }}
        className={`relative flex min-h-[220px] w-full flex-col items-center justify-center gap-4 rounded-[20px] border ${dragging ? "border-primary bg-surface-strong" : "border-hairline bg-surface"} px-6 py-8 text-center transition-all`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <div className="text-title-md font-semibold text-ink">Drag & drop your resume</div>
        <p className="max-w-sm text-body text-body text-black/70">PDF or DOCX accepted. We extract your experience, education, and achievements automatically.</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="button-pill border border-hairline bg-transparent px-5 py-3 text-sm font-semibold text-ink transition hover:bg-surface"
        >
          Browse file
        </button>
        {fileName && <div className="mt-2 text-sm font-medium text-success">Uploaded: {fileName}</div>}
      </label>
    </div>
  );
}
