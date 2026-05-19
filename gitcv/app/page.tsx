"use client";

import { useState } from "react";

const problemDeveloperItems = [
  "Undersell their projects",
  "Write vague, generic bullet points",
  "Reuse the same projects for every application",
];

const githubSignals = [
  "Real systems you've built",
  "Technical decisions you've made",
  "The complexity you've handled",
];

const analysisSignals = [
  "System architecture",
  "Scalability patterns",
  "Engineering complexity",
  "Tech stack depth",
];

const solutionSteps = [
  "Match your projects against the job description",
  "Select the most relevant ones",
  "Generate clear, structured bullet points",
];

const resumeOutcomes = ["Focused", "Role-specific", "Built from your actual work"];

const workSteps = [
  {
    title: "Add GitHub Username",
    body: "We analyze and rank your projects.",
  },
  {
    title: "Upload Resume",
    body: "We extract your education, experience, and background.",
  },
  {
    title: "Paste Job Description",
    body: "We match your projects to what the role actually needs.",
  },
  {
    title: "Generate & Download",
    body: "Get a clean, ready-to-use PDF.",
  },
];

const features = [
  {
    title: "Dynamic Project Selection",
    body: "Picks different projects for different roles automatically",
  },
  {
    title: "Project Ranking",
    body: "Identifies your strongest and most relevant work",
  },
  {
    title: "Structured Bullet Generation",
    body: "Clear, specific, grounded in real engineering work",
  },
  {
    title: "Job Description Alignment",
    body: "Resume adapts per role",
  },
  {
    title: "ATS-Friendly Output",
    body: "Clean formatting that works",
  },
  {
    title: "Markdown -> PDF Export",
    body: "Fast, flexible resume generation",
  },
];

const audienceProfiles = [
  {
    label: "Multi-role applicants",
    note: "Developers applying to multiple roles",
    status: "Active",
  },
  {
    label: "Project-strong engineers",
    note: "Strong projects, generic resumes",
    status: "Underrepresented",
  },
  {
    label: "Manual-edit fatigue",
    note: "Tired of resume tweaking",
    status: "High friction",
  },
];

const differentiationRoles = [
  {
    title: "Backend roles",
    signals: ["APIs", "Databases", "System design"],
  },
  {
    title: "Frontend roles",
    signals: ["UI architecture", "State management", "Performance"],
  },
  {
    title: "Infra roles",
    signals: ["Scalability", "Reliability", "Distributed systems"],
  },
];

const statTiles = [
  { value: "128", label: "Ranked repos" },
  { value: "42", label: "Matched signals" },
  { value: "16", label: "Draft bullets" },
];

const pipelineNav = [
  "Dynamic Selection",
  "Project Ranking",
  "Bullet Generation",
  "JD Alignment",
  "ATS + PDF Export",
];

const pipelineRows = [
  {
    title: "Founding Engineer",
    subtitle: "Remote - Product infra - 94%",
  },
  {
    title: "AI Tools Engineer",
    subtitle: "Hybrid - TypeScript - 88%",
  },
  {
    title: "Full-stack Builder",
    subtitle: "Remote - Public build friendly - 82%",
  },
];

const previewProjects = [
  {
    project_name: "Multi-tenant platform",
    stack: ["Node", "PostgreSQL", "JWT"],
  },
  {
    project_name: "Performance dashboard",
    stack: ["React", "State", "Charts"],
  },
  {
    project_name: "Reliability service",
    stack: ["Queues", "Workers", "Observability"],
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="landing">
      <div className="backdrop-aura" />

      <header className="top-nav">
        <a className="brand-pill" href="#top" aria-label="GitCV home">
          GitCV
        </a>

        <nav className="desktop-links" aria-label="Primary navigation">
          <a href="#workflow">Workflow</a>
          <a href="#problem">Why This</a>
          <a href="#features">Features</a>
          <a href="#audience">For You</a>
        </nav>

        <a className="support-pill" href="/create">
          Generate My Resume
        </a>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </header>

      {menuOpen ? (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <a href="#workflow" onClick={() => setMenuOpen(false)}>
            Workflow
          </a>
          <a href="#problem" onClick={() => setMenuOpen(false)}>
            Why This
          </a>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>
          <a href="#audience" onClick={() => setMenuOpen(false)}>
            For You
          </a>
        </nav>
      ) : null}

      <section id="top" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">dynamic ai resume generation</p>
          <h1 className="display-hero">
            Turn Your GitHub Into a Resume That Gets Interviews
          </h1>
          <p className="hero-subheadline">
            Upload your resume, paste a job description, and generate a
            tailored, ATS-friendly resume using your most relevant projects.
          </p>

          <div className="hero-actions">
            <a className="primary-button" href="/create">
              Generate My Resume
            </a>
            <a className="secondary-button" href="#problem">
              Why this works
            </a>
          </div>

        </div>

        <div className="product-shell" aria-label="Visual workflow preview">
          <aside className="product-sidebar">
            <p className="sidebar-brand">GitCV</p>
            <ul>
              {pipelineNav.map((item) => (
                <li key={item} className={item === "Project Ranking" ? "active" : ""}>
                  {item}
                </li>
              ))}
            </ul>
          </aside>

          <div className="product-main">
            <div className="pipeline-head">
              <div>
                <p className="eyebrow">Pipeline</p>
                <h2>Signal-first resume matching</h2>
              </div>
              <span className="scan-pill">Scan</span>
            </div>

            <article className="today-card">
              <div>
                <p>TODAY</p>
                <h3>3 high-fit roles</h3>
                <strong>2 drafts ready for review</strong>
              </div>
              <span>94</span>
            </article>

            <div className="signal-strip">
              <span>JD vectors</span>
              <span>Profile graph</span>
              <span>Quality gate</span>
              <span>CRM memory</span>
            </div>

            <div className="stat-strip">
              {statTiles.map((tile) => (
                <article key={tile.label}>
                  <h3>{tile.value}</h3>
                  <p>{tile.label}</p>
                </article>
              ))}
            </div>

            <div className="candidate-list">
              {pipelineRows.map((row) => (
                <article key={row.title}>
                  <div>
                    <h3>{row.title}</h3>
                    <p>{row.subtitle}</p>
                  </div>
                  <span>REVIEW</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="preview-band" aria-label="Generated resume preview">
        <div className="preview-shell">
          <div className="preview-header">
            <div>
              <p className="eyebrow">Selected evidence</p>
              <h2 className="display-section">Right projects, right role</h2>
            </div>
            <span className="score-pill">ATS-ready</span>
          </div>

          <div className="project-rows">
            {previewProjects.map((project, index) => (
              <article className="project-row" key={`${project.project_name}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{project.project_name}</h3>
                  <p>{project.stack.join(" / ")}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="problem" className="content-section problem-surface">
        <div className="problem-intro">
          <p className="eyebrow">Problem</p>
          <h2 className="display-section">
            Your Resume Doesn&apos;t Reflect Your Actual Work
          </h2>
        </div>

        <div className="problem-grid">
          <article className="problem-card">
            <h3>Most developers:</h3>
            <ul className="problem-list">
              {problemDeveloperItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="problem-card success">
            <h3>Meanwhile, your GitHub already shows:</h3>
            <ul className="signal-list">
              {githubSignals.map((signal) => (
                <li key={signal}>
                  <span />
                  <p>{signal}</p>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <article className="problem-insight">
          <div>
            <p className="eyebrow">Mismatch</p>
            <h3>Strong work, weak resume signal</h3>
          </div>
          <p>
            But none of that makes it into your resume properly - or worse, the
            wrong projects get highlighted.
          </p>
          <div className="signal-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </article>
      </section>

      <section id="solution" className="content-section solution-surface">
        <div className="solution-intro">
          <p className="eyebrow">Solution</p>
          <h2 className="display-section">
            We Turn Your Work Into the Right Resume for Each Role
          </h2>
        </div>

        <div className="solution-grid">
          <article className="solution-card">
            <h3>Repository signal extraction</h3>
            <p>We analyze your repositories and extract meaningful signals like:</p>
            <div className="signal-pills">
              {analysisSignals.map((signal) => (
                <span key={signal}>{signal}</span>
              ))}
            </div>
          </article>

          <article className="solution-card">
            <h3>Role matching workflow</h3>
            <ol className="step-lane">
              {solutionSteps.map((step, index) => (
                <li key={step}>
                  <strong>{index + 1}</strong>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </article>
        </div>

        <article className="solution-outcome">
          <h3>So every resume is:</h3>
          <div className="outcome-chips">
            {resumeOutcomes.map((outcome) => (
              <span key={outcome}>{outcome}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="content-section differentiation-surface">
        <div className="narrow-copy">
          <p className="eyebrow">Differentiation</p>
          <h2 className="display-section">
            Not Every Project Belongs on Every Resume
          </h2>
          <p>
            The biggest mistake isn&apos;t writing weak bullets -
            <br />
            it&apos;s choosing the wrong projects.
          </p>
          <p>Different roles look for different signals:</p>
        </div>

        <div className="differentiation-grid">
          {differentiationRoles.map((role) => (
            <article className="role-signal-card" key={role.title}>
              <h3>{role.title}</h3>
              <div className="tag-rail">
                {role.signals.map((signal) => (
                  <span key={signal}>{signal}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <article className="selection-engine">
          <div className="engine-columns">
            <div className="engine-block">
              <p className="eyebrow">Input</p>
              <h3>Same GitHub</h3>
              <div className="engine-bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="engine-block">
              <p className="eyebrow">Filter</p>
              <h3>Different job requirements</h3>
              <div className="engine-tags">
                <span>Backend</span>
                <span>Frontend</span>
                <span>Infra</span>
              </div>
            </div>
          </div>
          <p className="closing-line">
            We automatically select the projects that best match the role.
          </p>
          <p className="closing-line strong">
            Same GitHub. Different job. Different resume.
          </p>
        </article>
      </section>

      <section id="workflow" className="content-section workflow-surface">
        <div className="section-heading-row">
          <p className="eyebrow">How It Works</p>
          <h2 className="display-section">How It Works</h2>
        </div>

        <div className="workflow-grid">
          {workSteps.map((step, index) => (
            <article className="step-flow-card" key={step.title}>
              <div className="flow-head">
                <span>{index + 1}</span>
                <em>{index < workSteps.length - 1 ? "Next" : "Ready"}</em>
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              {index < workSteps.length - 1 ? <i aria-hidden="true" /> : null}
            </article>
          ))}
        </div>

        <article className="workflow-insight">
          <div className="workflow-insight-head">
            <div>
              <p className="eyebrow">Pipeline output</p>
              <h3>Role-matched resume draft + downloadable PDF</h3>
            </div>
            <span className="workflow-badge">Delivery</span>
          </div>

          <div className="workflow-output-grid">
            <article className="workflow-output-card">
              <h4>Tailored resume draft</h4>
              <p>Projects selected and bullets generated from role signals.</p>
              <div className="output-tags">
                <span>Project ranking</span>
                <span>Structured bullets</span>
              </div>
            </article>

            <article className="workflow-output-card">
              <h4>Export-ready document</h4>
              <p>ATS-safe markdown transformed into a clean downloadable PDF.</p>
              <div className="output-tags">
                <span>ATS-friendly</span>
                <span>PDF download</span>
              </div>
            </article>
          </div>

          <p className="workflow-proof">
            Role coverage: 94% match confidence on selected project evidence.
          </p>
        </article>
      </section>

      <section id="features" className="content-section features-surface">
        <div className="section-heading-row">
          <p className="eyebrow">Key Features</p>
          <h2 className="display-section">Key Features</h2>
        </div>

        <div className="features-layout">
          <div className="feature-matrix">
            {features.map((feature, index) => (
              <article
                className={`feature-panel tone-${(index % 3) + 1}`}
                key={feature.title}
              >
                <div className="feature-top">
                  <span>F{String(index + 1).padStart(2, "0")}</span>
                  <em>{index < 2 ? "Core" : index < 4 ? "Matching" : "Output"}</em>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>

          <article className="features-insight">
            <div>
              <p className="eyebrow">Capability map</p>
              <h3>A role-adaptive resume engine, end to end</h3>
            </div>
            <div className="insight-tags">
              <span>Input normalization</span>
              <span>Signal ranking</span>
              <span>Context matching</span>
              <span>ATS-safe export</span>
            </div>
            <div className="insight-bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </article>
        </div>
      </section>

      <section className="content-section example-section">
        <div>
          <p className="eyebrow">Example Transformation</p>
          <h2 className="display-section">Example Transformation</h2>
        </div>
        <div className="example-grid">
          <article>
            <span>Before:</span>
            <p>&quot;Built a web app with authentication&quot;</p>
          </article>
          <article>
            <span>After:</span>
            <p>
              &quot;Designed and implemented a multi-tenant application with
              JWT-based authentication and role-based access control across
              modular services&quot;
            </p>
          </article>
        </div>
      </section>

      <section id="audience" className="content-section audience-surface">
        <div>
          <p className="eyebrow">Who This Is For</p>
          <h2 className="display-section">Who This Is For</h2>
        </div>

        <div className="audience-layout">
          {audienceProfiles.map((profile, index) => (
            <article className="audience-card" key={profile.label}>
              <div className="audience-head">
                <span>P{String(index + 1).padStart(2, "0")}</span>
                <em>{profile.status}</em>
              </div>
              <h3>{profile.label}</h3>
              <p>{profile.note}</p>
            </article>
          ))}
        </div>

        <article className="audience-insight">
          <h3>Best for high-signal builders applying across role types</h3>
          <div className="audience-meters" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </article>
      </section>

      <section className="final-cta">
        <div>
          <h2 className="display-section">Make Your Work Speak Clearly</h2>
          <p>Use the right projects for the right role - automatically.</p>
          <a className="primary-button" href="/create">
            Generate My Resume
          </a>
        </div>
      </section>
    </main>
  );
}
