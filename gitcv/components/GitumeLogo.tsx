import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type GitumeLogoProps = ComponentPropsWithoutRef<"span"> & {
  showWordmark?: boolean;
};

export function GitumeLogo({ className, showWordmark = true, ...props }: GitumeLogoProps) {
  return (
    <span className={cn("gitume-logo", className)} {...props}>
      <svg
        className="gitume-logo-mark"
        viewBox="0 0 40 40"
        role="img"
        aria-label="Gitume logo mark"
      >
        <rect className="gitume-logo-plate" x="4" y="4" width="32" height="32" rx="10" />
        <path
          className="gitume-logo-line"
          d="M25 13.5h-7.2a6.7 6.7 0 1 0 0 13.4h5.9a4.7 4.7 0 0 0 0-9.4h-4.2"
        />
        <path className="gitume-logo-line" d="M23.8 17.2 29 12" />
        <path className="gitume-logo-line" d="M23.8 26.8 29 32" />
        <circle className="gitume-logo-dot" cx="29" cy="12" r="2.4" />
        <circle className="gitume-logo-dot" cx="29" cy="32" r="2.4" />
      </svg>
      {showWordmark ? <span className="gitume-logo-word">Gitume</span> : null}
    </span>
  );
}
