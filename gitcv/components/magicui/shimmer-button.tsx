import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CommonProps = {
  href?: string;
  className?: string;
  children: React.ReactNode;
  size?: "default" | "sm" | "lg";
};

type ShimmerButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

function getSizeClasses(size: "default" | "sm" | "lg") {
  if (size === "sm") return "min-h-10 px-5 text-sm";
  if (size === "lg") return "min-h-14 px-8 text-base";
  return "min-h-12 px-7 text-[0.95rem]";
}

export function ShimmerButton({
  className,
  children,
  size = "default",
  href,
  disabled,
  type,
  style,
  ...props
}: ShimmerButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#1b1714] bg-[#16120f] font-semibold text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60",
    getSizeClasses(size),
    className,
  );
  const content = (
    <>
      <span className="relative z-10" style={{ color: "var(--button-text, #ffffff)" }}>
        {children}
      </span>
      <span className="absolute inset-0 -translate-x-[120%] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.28),transparent)] transition-transform duration-700 group-hover:translate-x-[120%]" />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled} style={{ color: "var(--button-text, #ffffff)", ...style }}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} style={{ color: "var(--button-text, #ffffff)", ...style }} type={type} {...props}>
      {content}
    </button>
  );
}

export default ShimmerButton;
