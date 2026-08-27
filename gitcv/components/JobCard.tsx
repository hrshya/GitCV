type Department = {
  id: number;
  name: string;
  child_ids: number[];
  parent_id: number | null;
};

type Office = {
  id: number;
  name: string;
  location: string;
  child_ids: number[];
  parent_id: number | null;
};

export type JobPosting = {
  id: number;
  companyId: number;
  companyName: string;
  externalId: string;
  title: string;
  content: string;
  absoluteUrl: string;
  location: string;
  isActive: boolean;
  metadata: unknown | null;
  department: Department[];
  offices: Office[];
  postedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

type JobCardProps = {
  job: JobPosting;
  matchPercent?: number;
  cardBgColor?: string;
  skillBgColor?: string;
  skillTextColor?: string;
  onSave?: () => void;
  onDetails?: () => void;
  onPass?: () => void;
  onApply?: () => void;
};

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function formatPostedAgo(dateString: string | null) {
  if (!dateString) return "Recently posted";

  const postedDate = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - postedDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export default function JobCard({
  job,
  // matchPercent = 41,
  cardBgColor = "#e9e5fb",
  skillBgColor = "#ffffff",
  skillTextColor = "#4b4b6b",
  onPass,
  onApply,
}: JobCardProps) {
  const matchPercent = Math.random()*100;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (matchPercent / 100) * circumference;

  const companyName = job.companyName;
  const postedAgo = formatPostedAgo(job.postedAt);

  const skills = [
    ...job.department.map((dept) => dept.name),
    ...job.offices.map((office) => office.name),
  ].slice(0, 5);

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white p-1 font-sans shadow-[0_4px_20px_rgba(20,20,43,0.08)]">
      <div
        className="relative rounded-xl px-5 pb-1 pt-5 h-full"
        style={{ backgroundColor: cardBgColor }}
      >
        <div className="absolute right-5 top-5 h-16 w-16">
          <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="white"
              stroke="#e2ddf5"
              strokeWidth="4"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="#191933"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[13px] font-bold leading-none text-[#191933]">
              {matchPercent.toFixed(0)}%
            </span>
            <span className="mt-1 text-[9px] leading-none text-gray-400">
              match
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-around h-full">
          <div className="pr-16">
            <h3 className="text-[15px] font-bold leading-snug text-[#191933]">
              {job.location.split(";")[0]}
            </h3>
            <p className="mt-2 text-xs text-gray-400">{postedAgo}</p>
          </div>

          <h2 className="mt-4 text-xl font-bold leading-tight text-[#14142b]">
            {job.title}
          </h2>

          <div className="relative -mx-1 mt-3 overflow-hidden">
            <div className="flex gap-2 overflow-x-hidden px-1 pb-1">
              {skills.map((skill, i) => (
                <span
                  key={`${skill}-${i}`}
                  className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium shadow-sm"
                  style={{
                    backgroundColor: skillBgColor,
                    color: skillTextColor,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>

            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-r from-transparent"
              style={{ "--tw-gradient-to": cardBgColor } as React.CSSProperties}
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#e2ddf5] py-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                <span className="text-xs font-bold text-gray-500">
                  {companyName.toUpperCase().charAt(0)}
                </span>
              </div>

              <span className="truncate text-base font-bold text-[#191933]">
                {companyName}
              </span>
            </div>

            <button
                onClick={() => {
                  job.absoluteUrl && window.open(job.absoluteUrl, "_blank");
                }}
                className="rounded-full bg-black px-4 text-xs font-light text-white transition-colors hover:bg-gray-800"
            >
              Apply
            </button>
        </div>
        
{/* 
            {onPass && (
              <button
                onClick={onPass}
                className="rounded-full border border-gray-300 px-4 py-1 text-xs font-light text-[#191933] transition-colors hover:bg-gray-50"
              >
                Pass
              </button>
            )}

            {onApply && (
              <button
                onClick={onApply}
                className="rounded-full bg-black px-4 py-1 text-xs font-light text-white transition-colors hover:bg-gray-800"
              >
                Apply
              </button>
            )} */}
          </div>
        </div>
      </div>
  );
}