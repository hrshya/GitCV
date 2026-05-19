import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-body-md text-ink">
      <Navbar />

      <section className="relative overflow-hidden bg-canvas-soft py-24 xl:py-32">
        <div className="absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
          <div className="absolute left-0 top-16 h-80 w-80 orb orb-mint" />
          <div className="absolute right-0 top-20 h-96 w-96 orb orb-peach" />
          <div className="absolute left-24 top-64 h-56 w-56 orb orb-lavender" />
          <div className="absolute right-24 top-0 h-44 w-44 orb orb-sky" />
        </div>

        <div className="container mx-auto px-6">
          <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="max-w-2xl">
              <div className="text-caption-uppercase text-muted mb-4">Premium AI resume builder</div>
              <h1 className="text-display-hero max-w-[14ch] leading-[0.98]">Turn your GitHub into a resume that gets interviews.</h1>
              <p className="mt-8 max-w-2xl text-body-md leading-8 text-body">Upload your resume, paste a job description, and generate a tailored, ATS-friendly resume using your most relevant projects.</p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/create" className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-active">Generate My Resume</Link>
                <Link href="#problem" className="rounded-full border border-hairline bg-transparent px-7 py-3 text-sm font-semibold text-ink transition hover:bg-surface">See how it works</Link>
              </div>
            </div>

            <div className="relative rounded-[24px] border border-[rgba(31,26,20,0.08)] bg-surface p-8 shadow-[0_20px_60px_rgba(31,26,20,0.05)]">
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-[#a7e5d3]/25 to-transparent blur-3xl" />
              <div className="absolute left-8 top-8 h-16 w-16 rounded-full bg-gradient-to-br from-[#f4c5a8]/25 to-transparent blur-3xl" />
              <div className="space-y-6">
                <div className="text-caption-uppercase text-muted">Resume preview</div>
                <div className="rounded-[20px] border border-hairline bg-canvas-soft p-6">
                  <div className="mb-6 h-5 w-2/3 rounded-full bg-[#f0ece4]" />
                  <div className="space-y-4">
                    <div className="h-4 w-full rounded-full bg-[#ece8e0]" />
                    <div className="h-4 w-[92%] rounded-full bg-[#ece8e0]" />
                    <div className="h-4 w-[80%] rounded-full bg-[#ece8e0]" />
                    <div className="h-4 w-[70%] rounded-full bg-[#ece8e0]" />
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[16px] bg-white p-4 border border-[rgba(31,26,20,0.08)]">
                      <div className="h-3 w-3/4 rounded-full bg-[#f5f0e8]" />
                      <div className="mt-4 h-3 w-5/6 rounded-full bg-[#f0ebe4]" />
                    </div>
                    <div className="rounded-[16px] bg-white p-4 border border-[rgba(31,26,20,0.08)]">
                      <div className="h-3 w-2/3 rounded-full bg-[#f5f0e8]" />
                      <div className="mt-4 h-3 w-1/2 rounded-full bg-[#f0ebe4]" />
                    </div>
                  </div>
                </div>
                  <div className="rounded-[20px] border border-[rgba(31,26,20,0.08)] bg-white p-6">
                  <div className="text-caption-uppercase text-muted">Why it matters</div>
                  <p className="mt-3 text-body text-[#4a463e] leading-7">Different roles need different signal. This tool finds the right projects and surfaces the right work automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="container mx-auto px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start">
          <div className="space-y-6">
            <div className="text-caption-uppercase text-muted">Problem</div>
            <h2 className="text-display-lg max-w-3xl">Your resume doesn’t reflect your actual work.</h2>
            <p className="text-body-md text-[#4a463e] leading-8">Most developers:</p>
            <ul className="mt-6 space-y-4 text-body text-[#4a463e]">
              <li>Undersell their projects</li>
              <li>Write vague, generic bullet points</li>
              <li>Reuse the same projects for every application</li>
            </ul>
          </div>
          <div className="space-y-6 rounded-[24px] border border-[rgba(31,26,20,0.08)] bg-surface p-8 shadow-[0_20px_60px_rgba(31,26,20,0.04)]">
            <div className="text-caption-uppercase text-muted">What’s missing</div>
            <div className="space-y-4 text-body text-[#4a463e] leading-8">
              <p>Meanwhile, your GitHub already shows:</p>
              <ul className="space-y-3 list-disc pl-5">
                <li>Real systems you’ve built</li>
                <li>Technical decisions you’ve made</li>
                <li>The complexity you’ve handled</li>
              </ul>
              <p>But none of that makes it into your resume properly—or worse, the wrong projects get highlighted.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-6">
            <div className="text-caption-uppercase text-muted">Solution</div>
            <h2 className="text-display-lg max-w-3xl">We turn your work into the right resume for each role.</h2>
            <p className="text-body-md text-body leading-8">We analyze your repositories and extract meaningful signals like system architecture, scalability patterns, engineering complexity, and tech stack depth.</p>
            <div className="mt-8 grid gap-4">
              {[
                "Match your projects against the job description",
                "Select the most relevant ones",
                "Generate clear, structured bullet points",
              ].map((item) => (
                <div key={item} className="rounded-[18px] border border-[rgba(31,26,20,0.08)] bg-surface p-5 text-body text-body">{item}</div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-[rgba(31,26,20,0.08)] bg-surface p-8 shadow-[0_20px_60px_rgba(31,26,20,0.04)]">
            <div className="text-caption-uppercase text-muted">Result</div>
            <div className="mt-4 space-y-4 text-body text-body leading-8">
              <p>So every resume is:</p>
              <ul className="space-y-3 list-disc pl-5">
                <li>Focused</li>
                <li>Role-specific</li>
                <li>Built from your actual work</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <div className="text-center">
          <div className="text-caption-uppercase text-muted">Differentiation</div>
          <h2 className="text-display-lg max-w-3xl mx-auto">Not every project belongs on every resume.</h2>
              <p className="mt-6 max-w-2xl mx-auto text-body-md text-body leading-8">The biggest mistake isn’t writing weak bullets—it’s choosing the wrong projects.</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Backend roles",
              description: "APIs, databases, and system design are the signal that matters.",
            },
            {
              title: "Frontend roles",
              description: "UI, state management, and performance show your product craftsmanship.",
            },
            {
              title: "Infra roles",
              description: "Scalability, reliability, and distributed systems prove operational expertise.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[24px] border border-[rgba(31,26,20,0.08)] bg-surface p-8 shadow-[0_20px_60px_rgba(31,26,20,0.04)]">
              <div className="text-caption-uppercase text-muted">{item.title}</div>
              <p className="mt-4 text-body text-body leading-7">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 max-w-3xl mx-auto text-center text-body leading-8">
          <p>Same GitHub. Different job. Different resume.</p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto grid gap-8 sm:grid-cols-2">
          {[
            {
              title: "Upload resume",
              description: "We extract your education, experience, and background.",
            },
            {
              title: "Add GitHub username",
              description: "We analyze and rank your projects.",
            },
            {
              title: "Paste job description",
              description: "We match your projects to what the role actually needs.",
            },
            {
              title: "Generate & download",
              description: "Get a clean, ready-to-use PDF.",
            },
          ].map((step, index) => (
            <div key={step.title} className="rounded-[24px] border border-hairline bg-surface p-8 shadow-[0_20px_60px_rgba(31,26,20,0.04)]">
              <div className="text-caption-uppercase text-muted">Step {index + 1}</div>
              <h3 className="mt-4 text-title-md font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 text-body leading-7">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <div className="text-center">
          <div className="text-caption-uppercase text-muted">Key features</div>
          <h2 className="mt-4 text-display-lg max-w-3xl mx-auto">Everything a modern resume workflow needs.</h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Dynamic Project Selection",
              description: "Picks different projects for different roles automatically.",
            },
            {
              title: "Project Ranking",
              description: "Identifies your strongest and most relevant work.",
            },
            {
              title: "Structured Bullet Generation",
              description: "Clear, specific, grounded in real engineering work.",
            },
            {
              title: "Job Description Alignment",
              description: "Resume adapts per role.",
            },
            {
              title: "ATS-Friendly Output",
              description: "Clean formatting that works.",
            },
            {
              title: "Markdown → PDF Export",
              description: "Fast, flexible resume generation.",
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-[24px] border border-hairline bg-surface p-8 shadow-[0_20px_60px_rgba(31,26,20,0.04)]">
              <h3 className="text-title-md font-semibold text-ink">{feature.title}</h3>
              <p className="mt-4 text-body leading-7">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="space-y-6">
            <div className="text-caption-uppercase text-muted">Example transformation</div>
            <h2 className="text-display-lg max-w-3xl">From generic to specific, without losing your actual work.</h2>
            <p className="text-body-md leading-8">A resume should describe what you built, how you built it, and why it mattered. This is the difference that gets attention.</p>
          </div>
          <div className="rounded-[24px] border border-[rgba(31,26,20,0.08)] bg-surface p-8 shadow-[0_20px_60px_rgba(31,26,20,0.04)]">
            <div className="text-caption-uppercase text-muted">Before</div>
            <p className="mt-4 text-body leading-8">“Built a web app with authentication”</p>
            <div className="mt-8 border-t border-hairline pt-6">
              <div className="text-caption-uppercase text-muted">After</div>
              <p className="mt-4 text-body text-body leading-8">“Designed and implemented a multi-tenant application with JWT-based authentication and role-based access control across modular services.”</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <div className="text-center">
          <div className="text-caption-uppercase text-muted">Who this is for</div>
          <h2 className="mt-4 text-display-lg max-w-3xl mx-auto">Built for developers who want resumes that reflect the work they actually ship.</h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {[
            "Developers applying to multiple roles",
            "Engineers with strong projects but generic resumes",
            "Anyone tired of manually tweaking resumes",
          ].map((item) => (
            <div key={item} className="rounded-[24px] border border-[rgba(31,26,20,0.08)] bg-surface p-8 shadow-[0_20px_60px_rgba(31,26,20,0.04)]">
              <p className="text-body text-body leading-7">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface border-t border-hairline px-6 py-24">
        <div className="container mx-auto flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-caption-uppercase text-muted">Final CTA</div>
            <h2 className="mt-4 text-display-lg max-w-3xl">Make your work speak clearly.</h2>
            <p className="mt-6 text-body-md leading-8">Use the right projects for the right role—automatically.</p>
          </div>
          <Link href="/create" className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-active">Generate My Resume</Link>
        </div>
      </section>
    </div>
  );
}
