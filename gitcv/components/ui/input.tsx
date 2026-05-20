import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-[#d4cec8] bg-white px-3 py-3 text-[0.95rem] text-[#0c0a09] outline-none",
        "focus:border-[#afa39a]",
        className
      )}
      {...props}
    />
  );
}
