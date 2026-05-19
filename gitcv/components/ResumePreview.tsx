"use client";

type Experience = {
  role: string;
  company: string;
  date: string;
  bullets: string[];
};

type Project = {
  title: string;
  description: string;
};

type Props = {
  data: {
    name: string;
    title: string;
    contact: string;
    summary: string;
    skills: string[];
    experience: Experience[];
    projects: Project[];
    education: string;
  };
};

export default function ResumePreview({ data }: Props) {
  return (
    <div className="rounded-3xl border border-hairline bg-surface p-8">
      <div className="space-y-3">
        <div className="text-sm uppercase tracking-[0.3em] text-muted">Resume preview</div>
        <div>
          <p className="text-title-md font-semibold text-ink">{data.name}</p>
          <p className="mt-1 text-body text-black/75">{data.title}</p>
          <p className="mt-2 text-sm leading-6 text-body text-black/60">{data.contact}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <section>
            <div className="text-sm uppercase tracking-[0.3em] text-muted">Summary</div>
            <p className="mt-3 text-body text-black/70">{data.summary}</p>
          </section>

          <section>
            <div className="text-sm uppercase tracking-[0.3em] text-muted">Skills</div>
            <div className="mt-4 flex flex-wrap gap-3">
              {data.skills.map((skill) => (
                <span key={skill} className="rounded-full border border-hairline bg-surface-strong px-3 py-2 text-sm text-ink">{skill}</span>
              ))}
            </div>
          </section>

          <section>
            <div className="text-sm uppercase tracking-[0.3em] text-muted">Education</div>
            <p className="mt-3 text-body text-black/70">{data.education}</p>
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <div className="text-sm uppercase tracking-[0.3em] text-muted">Experience</div>
            <div className="mt-4 space-y-6">
              {data.experience.map((item) => (
                <div key={item.company} className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-body-strong font-semibold text-ink">{item.role}</p>
                    <span className="text-sm text-muted">{item.date}</span>
                  </div>
                  <p className="text-sm text-body text-black/70">{item.company}</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-body text-black/70">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="text-sm uppercase tracking-[0.3em] text-muted">Projects</div>
            <div className="mt-4 space-y-4">
              {data.projects.map((project) => (
                <div key={project.title} className="rounded-3xl border border-hairline bg-surface-strong p-4">
                  <p className="text-body-strong font-semibold text-ink">{project.title}</p>
                  <p className="mt-2 text-sm text-black/70">{project.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
