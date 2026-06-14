import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ShimmerButtonProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "ghost";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "type"> & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "href">;

const baseClasses =
  "inline-flex items-center justify-center rounded-full border border-transparent font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-60";

function getSizeClasses(size: ShimmerButtonProps["size"]) {
  if (size === "sm") return "h-11 px-4 text-sm";
  if (size === "lg") return "h-14 px-7 text-base";
  return "h-12 px-6 text-sm";
}

function getVariantClasses(variant: ShimmerButtonProps["variant"]) {
  if (variant === "ghost") {
    return "bg-white text-slate-950 shadow-sm hover:bg-slate-100";
  }
  return "bg-slate-950 text-white shadow-lg shadow-slate-900/5 hover:bg-slate-800";
}

export function ShimmerButton({
  href,
  size = "md",
  variant = "solid",
  className,
  disabled,
  type = "button",
  children,
  ...props
}: ShimmerButtonProps) {
  const classes = cn(baseClasses, getSizeClasses(size), getVariantClasses(variant), className);

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled ? true : undefined} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

export default ShimmerButton;
