import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import type { RankedProject } from "../utils/type.ts";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const client = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `
You are a senior technical resume writer who has helped engineers get offers at Google, Meta, Apple, Amazon, and Microsoft.

Your job is to generate FAANG-level resume content for MULTIPLE GitHub projects given their signals and README excerpts.

---

## THE FAANG BULLET FORMULA
Every bullet must follow:
Strong verb + what you built/did + how (specific tech) + measurable impact or scale

---

## GLOBAL RULES — NEVER BREAK THESE

1. NEVER write vague bullets
❌ "Built a web app with authentication"
✅ "Engineered a multi-tenant SaaS platform with JWT-based auth and RBAC, supporting 3 permission levels across 500+ users"

2. ALWAYS name specific technologies
❌ "Used a message queue"
✅ "Decoupled order processing using BullMQ, reducing API latency by ~60%"

3. QUANTIFY wherever signals allow
- Stars/forks → adoption ("open-sourced with 200+ GitHub stars")
- File count → scale ("across 80+ modules")
- Realtime → concurrency ("handling concurrent WebSocket connections")
- Multi-system → architecture complexity

4. DO NOT hallucinate metrics
If no numbers exist → use qualitative scale:
"production-grade", "low-latency", "high-throughput", "distributed"

5. MATCH verb strength to project strength
Weak → Built, Developed  
Medium → Engineered, Designed  
Strong → Architected, Orchestrated, Spearheaded  

---

## MULTI-PROJECT INTELLIGENCE (CRITICAL)

When multiple projects are provided:

- DO NOT repeat the same ideas across projects
- Each project must highlight DIFFERENT strengths

Examples:
- Project A → system design / architecture
- Project B → scalability / performance
- Project C → product features / UX

Avoid repetition like:
❌ "real-time system" in all projects  
❌ "WebSockets" in every project  

Instead distribute signals intelligently.

---

## PER-PROJECT REQUIREMENTS

For EACH project:

- Generate EXACTLY 2–3 bullet points
- First bullet MUST be the strongest
- Include at least:
  → 1 architecture bullet (if signals exist)
  → 1 quality OR scale bullet (if signals exist)

---

## BULLET CATEGORIES

- architecture : system design, patterns, component structure
- scale        : performance, throughput, latency
- feature      : product capabilities, integrations
- quality      : testing, CI/CD, maintainability
- impact       : adoption, usage, stars

---

## STRENGTH RUBRIC

- strong  → specific tech + measurable impact + non-trivial engineering
- medium  → specific tech but no clear impact
- weak    → generic, avoid unless absolutely necessary

---

## OUTPUT REQUIREMENTS

You must return structured JSON.

Additionally:

### overall_summary
- Describe the ENGINEER, not individual projects
- Combine signals into a strong profile (e.g., "full-stack engineer with experience in real-time systems and scalable backend architecture")

### consolidated_stack
- Include only the MOST IMPORTANT technologies across all projects
- Avoid duplicates and low-signal tools

---

## HIGHLIGHT HINT

For EACH project:
- One sharp sentence capturing the MOST impressive aspect
- Should trigger interviewer curiosity

Think:
"What would make a Google L5 interviewer say — tell me more?"

---

Focus on depth, clarity, and signal strength.
Avoid fluff. Prioritise engineering credibility over verbosity.
`.trim();

function buildPrompt(repos: RankedProject[]): string {
    let i = 1;
    let prompt = "";

    for(const repo of repos) {
        prompt += `
                ## PROJECT ${i++}
                Name: ${repo.project_name}

                Summary:
                ${repo.summary}

                Stack:
                ${repo.stack.join(", ")}

                Key Features:
                ${repo.key_features.join("\n")}

                Complexity:
                ${repo.complexity_tags.join(", ")}

                Highlight Hint:
                ${repo.highlight_hint}

                ---

                ## ARCHITECTURE
                Client: ${repo.architecture.client}
                Server: ${repo.architecture.server}
                Data Flow: ${repo.architecture.data_sync}

                ---

                ## SIGNALS
                Realtime: ${repo.signals.system.realtime}
                Event Driven: ${repo.signals.system.eventDriven}
                API: ${repo.signals.core.api}
                Database: ${repo.signals.core.database}
                Auth: ${repo.signals.core.auth}
                ML: ${repo.signals.ai.ml}
                Docker: ${repo.signals.infra.docker}
                CI/CD: ${repo.signals.infra.ci}

                ---

                ## SCALE CONTEXT
                Files: ${repo.structure.file_count}
                Dirs: ${repo.structure.dir_count}
                Stars: ${repo.impact_signals.stars}
                Forks: ${repo.impact_signals.forks}
                Last Updated: ${repo.impact_signals.last_updated_days_ago} days ago
                Production Ready: ${repo.impact_signals.is_production_ready}

                ---

                Generate resume bullet points.
                `.trim();
    }

    return prompt;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,

  properties: {
    projects: {
      type: Type.ARRAY,
      minItems: 2,
      maxItems: 3,

      items: {
        type: Type.OBJECT,

        properties: {
          project_name: { type: Type.STRING },

          bullet_points: {
            type: Type.ARRAY,
            minItems: 2,
            maxItems: 3, // tighter per project
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                category: {
                  type: Type.STRING,
                  enum: ["architecture", "scale", "feature", "quality", "impact"],
                },
                strength: {
                  type: Type.STRING,
                  enum: ["strong", "medium", "weak"],
                },
              },
              required: ["text", "category", "strength"],
            },
          },

          summary: { type: Type.STRING },

          stack: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },

          highlight_hint: { type: Type.STRING },
        },

        required: [
          "project_name",
          "bullet_points",
          "summary",
          "stack",
          "highlight_hint",
        ],
      },
    },

    overall_summary: { type: Type.STRING },

    consolidated_stack: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },

  required: [
    "projects",
    "overall_summary",
    "consolidated_stack",
  ],
};

export async function geminiResponse(repos: RankedProject[]) {
    const response = await client.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: buildPrompt(repos),
        config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.25,          // low enough for consistency, high enough to avoid robotic phrasing
            // topP: 0.9,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
            // maxOutputTokens: 300
        },
    });
    console.log(response.text)
    return response;
}
