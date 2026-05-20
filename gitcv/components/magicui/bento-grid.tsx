import * as React from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}
      {...props}
    />
  );
}

type BentoGridItemProps = React.HTMLAttributes<HTMLElement> & {
  title: string;
  description: string;
  header?: React.ReactNode;
};

export function BentoGridItem({
  className,
  title,
  description,
  header,
  ...props
}: BentoGridItemProps) {
  return (
    <article
      className={cn(
        "group min-h-[260px] rounded-lg border border-[#e7e5e4] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-[#d3cec8]",
        className,
      )}
      {...props}
    >
      {header}
      <div className="mt-4">
        <p className="text-[1.02rem] font-semibold text-[#0c0a09]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[#4e4e4e]">{description}</p>
      </div>
    </article>
  );
}

export default BentoGrid;
