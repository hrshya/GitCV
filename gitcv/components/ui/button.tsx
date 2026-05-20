import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed";

function getVariantClasses(variant: "default" | "outline" | "ghost") {
  if (variant === "outline") {
    return "border border-[#cfcac5] bg-transparent text-[#171310] hover:-translate-y-px";
  }
  if (variant === "ghost") {
    return "border border-transparent bg-transparent text-[#171310]";
  }
  return "border border-[#16120f] bg-[#16120f] text-white hover:-translate-y-px";
}

function getSizeClasses(size: "default" | "sm" | "lg") {
  if (size === "sm") return "min-h-10 px-4 text-sm";
  if (size === "lg") return "min-h-14 px-7 text-base";
  return "min-h-12 px-6 text-[0.94rem]";
}

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(baseClasses, getVariantClasses(variant), getSizeClasses(size), className);

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
    } as { className?: string });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
