import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full min-h-36 resize-y rounded-lg border border-[#d4cec8] bg-white px-3 py-3 text-[0.95rem] text-[#0c0a09] outline-none",
        "focus:border-[#afa39a]",
        className
      )}
      {...props}
    />
  );
}
