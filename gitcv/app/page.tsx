import { GitumeLogo } from "@/components/GitumeLogo";
import { WebGLShader } from "@/components/Hero";
import { AnimatedList } from "@/components/magicui/animated-list";
import { CardStack } from "@/components/magicui/card-stack";
import { AnimatedListDemo } from "@/components/magicui/list";
import { Button } from "@/components/magicui/osbutton";
import { Ripple } from "@/components/magicui/ripple";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { StripedPattern } from "@/components/magicui/stripedline";
import { WobbleCard } from "@/components/magicui/wobble";
import { Navbar } from "@/components/Navbar";

const roleSignals = [
  ["Backend", "APIs", "Postgres", "system design"],
  ["Frontend", "state", "performance", "UI depth"],
  ["Infra", "queues", "reliability", "scale"],
];

const Cards = [
  {
    id: 1,
    role: "Backend Engineer",
    selectedProjects: [
      "Distributed Cache",
      "Realtime Analytics Platform",
      "Event-Driven Order System",
    ],
    focus: ["Scalability", "APIs", "Databases"],
    score: "93%"
  },

  {
    id: 2,
    role: "Frontend Engineer",
    selectedProjects: [
      "Collaborative Whiteboard",
      "Design System",
      "Realtime Chat Platform",
    ],
    focus: ["UI Systems", "Accessibility", "Performance"],
    score: "92%"
  },

  {
    id: 3,
    role: "Founding Engineer",
    selectedProjects: [
      "SaaS Platform",
      "AI Workflow Tool",
      "Analytics Dashboard",
    ],
    focus: ["Ownership", "Product Thinking", "Breadth"],
    score: "88%"
  },
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
  ["1", "Add GitHub", "We scan repositories and extract meaningful engineering signals."],
  ["2", "Add Resume", "We preserve your background, experience, education, and voice."],
  ["3", "Add Role", "The job description guides which projects deserve the spotlight."],
  ["4", "Download PDF", "You get a focused resume built from your actual work."],
];

function MatchGalaxy() {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Role fit</p>
        <p className="mt-3 text-4xl font-semibold text-slate-950">94</p>
      </div>
      {["API Gateway", "Realtime Voice", "Finance Core", "Branch Graph"].map((project, index) => (
        <div key={project} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">{project}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{index === 0 ? "Selected" : "Ranked"}</p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <Navbar />
      </div>

      <div className="absolute z-0 h-full w-full">
        <WebGLShader  />
      </div>

      <section id="features" className="mt-[100vh] w-full h-full bg-neutral-950 text-white grid grid-cols-1 lg:grid-cols-3 sm:grid-rows-1">
        <div className="w-full h-full p-4">
          <div className="w-full h-full border border-dashed border-zinc-800 px-4 py-8 flex flex-col gap-8 items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-5xl font-semibold text-white">Targeted Resume</h2>
              <p className="text-lg text-gray-400">Dynamically tailored to every job you apply for.</p>
            </div>
            <div className="">
              <AnimatedListDemo />
            </div>
          </div>
        </div>
        <div className="w-full h-full border-x border-x-zinc-800">
          <div className="h-full w-full p-4">
            <div className="relative border border-dashed border-zinc-800 flex h-[680px] w-full flex-col items-center justify-center overflow-hidden">
              <p className="z-10 text-center text-3xl font-medium tracking-tighter whitespace-pre-wrap text-white">
                Smart Layer
              </p>
              <Ripple />
            </div>
          </div>
        </div>
        <div className="w-full h-full">
          <div className="w-full px-4 pt-4">
            <div className="border border-dashed border-zinc-800 flex flex-col items-center gap-16 px-4 py-8 h-full">
              <div className="flex flex-col gap-1">
                <h2 className="text-5xl font-semibold text-white">Different Role. Different Resume.</h2>
                <p className="text-lg text-gray-400">One GitHub profile can tell many stories.</p>
              </div>
              <CardStack items={Cards} />
            </div>
          </div>
          <div className="w-full">
            <div className="px-4 h-full">
              <div className="border border-dashed border-zinc-800 px-8 py-12">
                <h2 className="text-xl text-gray-400">We automatically select and prioritize the projects that best match the role you're applying for.</h2>
              </div>
            </div>
          </div>
        </div>
      </section>  

      <section id="workflow" className="bg-neutral-950 w-full h-screen overflow-hidden border-b border-zinc-800">
        <div className="text-white border-y w-full border-zinc-800">
          <h4 className="font-medium py-10 inset-0 flex items-center justify-center text-3xl lg:text-5xl tracking-tight z-30 text-center text-balance">How it Works</h4>
        </div>
        <div className="h-full w-full flex">
          <div className="relative flex h-full w-[56] overflow-hidden border-r border-zinc-800">
            <StripedPattern direction="right" className="text-zinc-800" />
          </div>
          <div className="w-full h-full px-56">
            <div className="w-full h-full border-x border-zinc-800 text-white">
              <div>
                {workflow.map((work:any) => (
                  <div key={work[0]} className="flex flex-col gap-3 px-16 justify-center py-10 border-b border-zinc-800">
                    <div className="text-4xl font-bold">
                      {work[0]}. {work[1]}
                    </div>
                    <div className="text-xl font-medium text-slate-200">
                      {work[2]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
           <div className="relative flex h-full w-[56] overflow-hidden border-l border-zinc-800">
            <StripedPattern direction="right" className="text-zinc-800" />
          </div>
        </div>
      </section>

      <section className="bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:px-8 lg:px-10 text-white">
        <WobbleCard>
          <div className="rounded-2xl border border-zinc-800 bg-neutral-950 p-10 text-center shadow-sm">
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Make Your Work Speak Clearly</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 ">
              Use the right projects for the right role, automatically.
            </p>
            <div className="mt-8 flex justify-center">
              <Button>
                Generate My Resume
              </Button>
            </div>
          </div>
        </WobbleCard>
        </div>
      </section>
    </main>
  );
}
