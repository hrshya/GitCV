import Link from "next/link";
import { GitumeLogo } from "@/components/GitumeLogo";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

const navItems = [
  ["Features", "#features"],
  ["Workflow", "#workflow"],
  ["Preview", "#preview"],
  ["FAQ", "#faq"],
];

const roleSignals = [
  ["Backend", "APIs", "Postgres", "system design"],
  ["Frontend", "state", "performance", "UI depth"],
  ["Infra", "queues", "reliability", "scale"],
];

const featureCards = [
  {
    title: "Dynamic Project Selection",
    body: "Picks different projects for different roles automatically.",
    metric: "3/14",
    label: "best-fit projects",
  },
  {
    title: "Project Ranking",
    body: "Identifies the strongest work from your public repositories.",
    metric: "94",
    label: "role-fit score",
  },
  {
    title: "Structured Bullet Generation",
    body: "Turns real engineering decisions into clear recruiter-ready bullets.",
    metric: "ATS",
    label: "clean output",
  },
];

const workflow = [
  ["01", "Add GitHub", "We scan repositories and extract meaningful engineering signals."],
  ["02", "Add Resume", "We preserve your background, experience, education, and voice."],
  ["03", "Add Role", "The job description guides which projects deserve the spotlight."],
  ["04", "Download PDF", "You get a focused resume built from your actual work."],
];

function MatchGalaxy() {
  return (
    <div className="os-galaxy" aria-label="GitHub project matching visual">
      <div className="os-galaxy-core">
        <span>94</span>
        <p>Role-fit</p>
      </div>
      {["API Gateway", "Realtime Voice", "Finance Core", "Branch Graph"].map((project, index) => (
        <div className={`os-project-chip os-chip-${index + 1}`} key={project}>
          <span>{project}</span>
          <small>{index === 0 ? "Selected" : "Ranked"}</small>
        </div>
      ))}
      <div className="os-galaxy-ring ring-one" />
      <div className="os-galaxy-ring ring-two" />
    </div>
  );
}

function ResumePreview() {
  return (
    <div className="os-preview-window" id="preview" aria-label="Role-specific resume preview">
      <div className="os-window-bar">
        <span />
        <span />
        <span />
        <p>Gitume resume engine</p>
      </div>
      <div className="os-preview-body">
        <aside className="os-preview-panel">
          <p>Signal Map</p>
          {roleSignals.map(([role, ...signals]) => (
            <div className="os-signal-row" key={role}>
              <strong>{role}</strong>
              <span>{signals.join(" / ")}</span>
            </div>
          ))}
        </aside>
        <section className="os-resume-card">
          <div>
            <p>Generated Resume</p>
            <h3>Backend AI Engineer</h3>
          </div>
          <article>
            <span>Selected Project</span>
            <strong>Finance ingestion platform</strong>
            <p>
              Engineered parallel ingestion and deduplication pipelines across live payment systems,
              reducing dashboard latency to sub-second reads.
            </p>
          </article>
          <article>
            <span>Recruiter Emphasis</span>
            <strong>systems depth, data reliability, backend ownership</strong>
          </article>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="os-site">
      <div className="os-noise" aria-hidden="true" />

      <header className="os-nav">
        <Link className="os-brand" href="/" aria-label="Gitume home">
          <GitumeLogo />
        </Link>
        <nav aria-label="Primary navigation">
          {navItems.map(([label, href]) => (
            <a href={href} key={label}>
              {label}
            </a>
          ))}
        </nav>
        <ShimmerButton className="os-nav-button" href="/create" size="sm">
          Generate
        </ShimmerButton>
      </header>

      <section className="os-hero">
        <div className="os-hero-badge">
          <span>AI</span>
          <p>Dynamic resume generation</p>
        </div>
        <h1>Turn Your GitHub Into a Resume That Gets Interviews</h1>
        <p>
          Upload your resume, paste a job description, and generate a tailored, ATS-friendly resume
          using your most relevant projects.
        </p>
        <div className="os-hero-actions">
          <ShimmerButton className="os-primary-button" href="/create" size="lg">
            Generate My Resume
          </ShimmerButton>
          <a className="os-secondary-button" href="#features">
            See how it works
          </a>
        </div>

        <div className="os-hero-strip" aria-label="Resume generation highlights">
          {["GitHub analyzed", "Projects ranked", "Role matched", "PDF exported"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="os-feature-stage" id="features">
        <div className="os-section-heading">
          <p>Supercharge Your Resume Workflow</p>
          <h2>One engine for project selection, bullet quality, and role alignment.</h2>
        </div>

        <div className="os-bento">
          <article className="os-card os-card-list">
            <span className="os-card-kicker">Project evidence</span>
            <h3>Your resume stops underselling the work.</h3>
            <div className="os-evidence-list">
              {["System architecture", "Scalability patterns", "Engineering complexity"].map((item) => (
                <div key={item}>
                  <i />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="os-card os-card-center">
            <span className="os-card-kicker">Matching layer</span>
            <h3>The right projects rise to the top.</h3>
            <MatchGalaxy />
          </article>

          <article className="os-card os-card-filter">
            <span className="os-card-kicker">Precision filters</span>
            <h3>Different role, different resume.</h3>
            <div className="os-filter-stack">
              {roleSignals.map(([role, ...signals]) => (
                <div key={role}>
                  <strong>{role}</strong>
                  <p>{signals.join(", ")}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="os-preview-section">
        <ResumePreview />
      </section>

      <section className="os-workflow" id="workflow">
        <div className="os-section-heading compact">
          <p>How it works</p>
          <h2>Four steps. One role-specific PDF.</h2>
        </div>
        <div className="os-timeline">
          {workflow.map(([number, title, body]) => (
            <article key={title}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="os-feature-row">
        {featureCards.map((feature) => (
          <article className="os-stat-card" key={feature.title}>
            <div>
              <span>{feature.metric}</span>
              <small>{feature.label}</small>
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </article>
        ))}
      </section>

      <section className="os-faq" id="faq">
        <div className="os-section-heading compact">
          <p>Final CTA</p>
          <h2>Make Your Work Speak Clearly</h2>
        </div>
        <p>Use the right projects for the right role, automatically.</p>
        <ShimmerButton className="os-primary-button" href="/create" size="lg">
          Generate My Resume
        </ShimmerButton>
      </section>
    </main>
  );
}
