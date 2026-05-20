import { cn } from "@/lib/utils";

export type TimelineItem = {
  title: string;
  description: string;
};

type TimelineProps = {
  items: TimelineItem[];
  className?: string;
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("timeline-frame", className)}>
      {items.map((item, index) => (
        <article className="timeline-item" key={item.title}>
          <span>{index + 1}</span>
          <div>
            <p>{item.title}</p>
            <small>{item.description}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

export default Timeline;
