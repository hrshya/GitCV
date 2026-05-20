import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "outline" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        variant === "outline"
          ? "border-[#d8d3cd] bg-transparent text-[#5f5650]"
          : "border-[#e7e5e4] bg-white text-[#5f5650]",
        className
      )}
      {...props}
    />
  );
}
