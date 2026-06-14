"use client"

import { cn } from "@/lib/utils"
import { AnimatedList } from "@/components/magicui/animated-list"

interface Item {
  name: string
  description: string
  icon: string
  color: string
  time: string
}

let notifications = [

  {
    name: "Software Engineer",
    description: "Builds software systems",
    time: "Core engineering role",
    icon: "💻",
    color: "#6366F1",
  },
  {
    name: "Frontend Developer",
    description: "Builds user interfaces",
    time: "Web UI & UX",
    icon: "🎨",
    color: "#4F46E5",
  },
  {
    name: "Backend Developer",
    description: "Handles server logic",
    time: "APIs & databases",
    icon: "⚙️",
    color: "#0EA5E9",
  },
  {
    name: "Full Stack Developer",
    description: "Frontend + Backend",
    time: "End-to-end development",
    icon: "🧩",
    color: "#8B5CF6",
  },
  {
    name: "DevOps Engineer",
    description: "Deployment & infrastructure",
    time: "CI/CD & cloud systems",
    icon: "☁️",
    color: "#10B981",
  },
  {
    name: "Data Scientist",
    description: "Data analysis & insights",
    time: "ML & statistics",
    icon: "📊",
    color: "#F59E0B",
  },
  {
    name: "Machine Learning Engineer",
    description: "Builds AI models",
    time: "AI & deep learning",
    icon: "🤖",
    color: "#EF4444",
  },
  {
    name: "Mobile Developer",
    description: "iOS & Android apps",
    time: "App development",
    icon: "📱",
    color: "#3B82F6",
  },
  {
    name: "UI/UX Designer",
    description: "Designs user experiences",
    time: "Product design",
    icon: "✏️",
    color: "#EC4899",
  },
  {
    name: "QA Engineer",
    description: "Testing & quality assurance",
    time: "Bug testing",
    icon: "🧪",
    color: "#F97316",
  },
  {
    name: "Cybersecurity Engineer",
    description: "Security & protection",
    time: "Threat prevention",
    icon: "🛡️",
    color: "#EF4444",
  }

]

notifications = Array.from({ length: 10 }, () => notifications).flat()

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center text-lg font-medium whitespace-pre dark:text-white">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
            {description}
          </p>
        </div>
      </div>
    </figure>
  )
}

export function AnimatedListDemo({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full flex-col overflow-hidden p-2",
        className
      )}
    >
      <AnimatedList>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>

      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t"></div>
    </div>
  )
}
