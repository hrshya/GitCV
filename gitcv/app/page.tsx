import Link from "next/link";
import { GitumeLogo } from "@/components/GitumeLogo";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

const roles = [
  ["Backend", "APIs, databases, system design"],
  ["Frontend", "UI architecture, state, performance"],
  ["Infra", "Scale, reliability, distributed systems"],
];

const projects = [
  ["AtlasFlow", "Ingestion engine", "96"],
  ["LumenQueue", "Worker orchestration", "91"],
  ["HarborKit", "Access layer", "88"],
];

const workflow = [
  ["Add GitHub Username", "We analyze and rank your projects."],
  ["Upload Resume", "We extract your education, experience, and background."],
  ["Paste Job Description", "We match your projects to what the role actually needs."],
  ["Generate & Download", "Get a clean, ready-to-use PDF."],
];

const features = [
  ["Dynamic Project Selection", "Picks different projects for different roles automatically"],
  ["Project Ranking", "Identifies your strongest and most relevant work"],
  ["Structured Bullet Generation", "Clear, specific, grounded in real engineering work"],
  ["Job Description Alignment", "Resume adapts per role"],
  ["ATS-Friendly Output", "Clean formatting that works"],
  ["Markdown to PDF Export", "Fast, flexible resume generation"],
];

function SignalComposition() {
  return (
    <div className="signal-composition" aria-label="Role matching signal composition">
      <div className="composition-label">
        <span>Signal Composition</span>
        <span>3 projects selected</span>
      </div>

      <div className="composition-field">
        <div className="field-axis horizontal" aria-hidden="true" />
        <div className="field-axis vertical" aria-hidden="true" />

        <article className="composition-core">
          <span>94</span>
          <small>Backend AI Engineer</small>
        </article>

        {projects.map(([name, detail, score], index) => (
          <article className={`composition-node node-${index + 1}`} key={name}>
            <em>{score}</em>
            <strong>{name}</strong>
            <small>{detail}</small>
          </article>
        ))}

        <div className="signal-column">
          {["APIs", "Postgres", "Realtime", "Auth"].map((signal) => (
            <span key={signal}>{signal}</span>
          ))}
        </div>

        <article className="composition-output">
          <span>Generated emphasis</span>
          <p>Systems depth, backend ownership, reliable data paths.</p>
        </article>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mono-site">
      <header className="mono-nav mono-shell">
        <Link className="mono-brand" href="/" aria-label="Gitume home">
          <GitumeLogo />
        </Link>
        <nav aria-label="Primary navigation">
          <a href="#selection">Selection</a>
          <a href="#workflow">Workflow</a>
          <a href="#features">Features</a>
        </nav>
        <ShimmerButton className="mono-nav-button" href="/create" size="sm">
          Generate
        </ShimmerButton>
      </header>

      <section className="mono-hero mono-shell">
        <div className="mono-hero-copy">
          <p className="mono-kicker">Dynamic AI Resume Generation</p>
          <h1>Turn Your GitHub Into a Resume That Gets Interviews</h1>
          <p>
            Upload your resume, paste a job description, and generate a tailored, ATS-friendly
            resume using your most relevant projects.
          </p>
          <div className="mono-actions">
            <ShimmerButton className="mono-solid-button" href="/create">Generate My Resume</ShimmerButton>
            <Button asChild className="mono-outline-button" size="lg" variant="outline">
              <a href="#selection">See the system</a>
            </Button>
          </div>
        </div>

        <SignalComposition />
      </section>

      <section className="mono-section mono-shell mismatch-editorial">
        <div className="mismatch-editorial-copy">
          <p className="mono-kicker">The mismatch</p>
          <h2>The work is strong. The resume is pointing at the wrong proof.</h2>
        </div>

        <div className="proof-shift" aria-label="Resume evidence shift">
          <article>
            <span>Resume says</span>
            <p>Built a web app with authentication.</p>
          </article>
          <article>
            <span>GitHub shows</span>
            <p>Architecture choices, scalability patterns, and stack depth.</p>
          </article>
          <article>
            <span>Gitume selects</span>
            <p>The projects that match the role, then turns them into specific bullets.</p>
          </article>
        </div>
      </section>

      <section className="mono-section mono-shell" id="selection">
        <div className="mono-section-head">
          <p className="mono-kicker">Project selection</p>
          <h2>Not Every Project Belongs on Every Resume</h2>
          <p>
            Different roles look for different signals. Gitume selects the projects that best match
            the role, then turns that evidence into specific resume language.
          </p>
        </div>

        <div className="mono-role-board">
          {roles.map(([role, signal]) => (
            <article key={role}>
              <span>{role}</span>
              <p>{signal}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mono-section mono-shell" id="workflow">
        <div className="mono-section-head compact">
          <p className="mono-kicker">How it works</p>
          <h2>Four steps. One role-specific PDF.</h2>
        </div>

        <div className="mono-workflow">
          {workflow.map(([title, body], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mono-section mono-shell" id="features">
        <div className="feature-index">
          <div className="feature-index-head">
            <p className="mono-kicker">Key features</p>
            <h2>Everything serves project-to-role alignment.</h2>
          </div>

          <div className="feature-index-grid">
            {features.map(([title, body]) => (
              <article key={title}>
                <span>{title.split(" ").slice(0, 2).join(" ")}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>

          <div className="feature-index-footer">
            <span>Same GitHub</span>
            <i />
            <span>Different job</span>
            <i />
            <span>Different resume</span>
          </div>
        </div>
      </section>

      <section className="mono-cta mono-shell">
        <p className="mono-kicker">Final draft</p>
        <h2>Make Your Work Speak Clearly</h2>
        <p>Use the right projects for the right role, automatically.</p>
        <ShimmerButton className="mono-solid-button" href="/create">Generate My Resume</ShimmerButton>
      </section>
    </main>
  );
}
