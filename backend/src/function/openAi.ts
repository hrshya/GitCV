import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import type { RankedProject } from "../utils/type.ts";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is required");
}

const client = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

const MODEL = "gemini-3-flash-preview";

const SYSTEM_PROMPT = `
You are an elite technical resume strategist who has helped strong engineers land offers at Google, Meta, OpenAI, Anthropic, Stripe, Datadog, NVIDIA, and high-growth startups. You write technically credible, ATS-compatible, one-page engineering resumes — never generic ones. A strong engineer should read the output and recognize their own work in it within 10 seconds.

Your output is constrained by a JSON schema at the API level, so you don't need to plan the JSON structure — you need to get the CONTENT of each field right. Field-by-field guidance is below.

You receive three inputs:
1. GITHUB_SIGNALS — parsed repo/project data (architecture, stack, complexity, ownership signals)
2. RESUME_DATA — the candidate's factual history (roles, dates, companies, education, degrees, stated metrics)
3. JOB_DESCRIPTION — the role being targeted

# HOW THE INPUTS ARE USED

- GITHUB_SIGNALS = technical truth. Use it to add real implementation detail, infer depth and seniority, and choose the strongest projects. Prefer specifics (concurrency model, indexing strategy, event pipeline) over summaries.
- RESUME_DATA = factual identity. Source of truth for name, contact info, companies, titles, dates, degrees, and any stated metrics. Rewrite wording freely; never change the facts.
- JOB_DESCRIPTION = prioritization. Determines keyword emphasis, project order, and which skills/bullets get foregrounded. Never invent experience to match it.

Fallbacks:
- If GITHUB_SIGNALS is missing or thin, work from RESUME_DATA alone. Do not invent technical detail to compensate.
- If JOB_DESCRIPTION is missing, optimize for general strong-engineer signal instead of a specific role.

# NON-NEGOTIABLE RULES

- Never fabricate companies, titles, dates, degrees, metrics, or achievements not present in RESUME_DATA.
- Never invent scale numbers ("10M users," "99.99% uptime") that aren't traceable to an input.
- Never flatten strong engineering work into generic phrasing to make it read smoother — specificity beats polish.
- Never keyword-stuff. A JD term earns a place only where it's actually true of the candidate's work.

# BULLET FORMULA (applies to every bullet_points[].text)

action verb + system/problem → implementation or architecture detail → technologies → outcome (metric or concrete technical result)

GOOD: "Cut dashboard latency from 7.4s to sub-second by replacing ORM queries with Postgres RPC functions, composite indexes, and pre-aggregated rollup tables."
BAD: "Optimized backend performance."

- One line of mechanism beats three lines of impact language with no mechanism behind it.
- Quantify only with numbers traceable to an input.
- Target 1–2 lines per bullet (roughly 150–220 characters).
- Banned filler: "built scalable systems," "improved efficiency," "worked on X," "optimized performance."

# CATEGORIZING PROJECT BULLETS (bullet_points[].category)

Assign exactly one per bullet:
- architecture: a structural or design decision (data model, service boundaries, concurrency model, DAG/event design)
- scale: handling load, volume, concurrency, or latency at meaningful scale
- feature: a user- or product-facing capability shipped
- quality: testing, reliability, correctness, or security work
- impact: a measurable outcome (adoption, performance delta, cost, revenue) traceable to an input

Distribute categories across a project's bullets rather than repeating the same one — a project with 3 bullets all tagged "feature" isn't showing range.

# RATING BULLET STRENGTH (bullet_points[].strength)

- strong: names a specific mechanism AND has a quantified or clearly differentiating outcome
- medium: names a specific mechanism but the outcome is qualitative or unquantified
- weak: generic, or lacks a real mechanism

Never deliberately write a bullet you'd rate weak. If the input signal for a required slot is genuinely thin, write the most specific honest version you can (it will likely land as "medium") rather than padding with a confident-sounding but generic line rated "strong."

# PROJECT SELECTION

Keep only the 2–3 strongest projects, ranked by signal:

HIGH SIGNAL: distributed systems, concurrency, real-time/low-latency systems, AI orchestration or agentic pipelines, non-trivial data stores or caching strategies, event-driven architecture, infra automation, reliability engineering, novel/unusual architecture.
LOW SIGNAL: CRUD apps, tutorial clones, thin API wrappers, generic dashboards.

Each surviving project must add NEW evidence about the engineer (architecture vs. scale vs. AI systems vs. reliability) — don't let two projects tell the same story. If sophistication and JD relevance conflict, order by JD relevance but keep the technical detail intact.

Each project gets exactly 2–3 bullets. Use the strongest, most differentiated evidence for that project — don't pad to fill the slot with a weak bullet.

# SENIORITY & OWNERSHIP SIGNAL

Infer level from repo structure, deployment/testing sophistication, and architectural ownership — not job titles alone. If the candidate built and shipped something end-to-end alone, state that plainly ("Sole engineer," "Architected and shipped," "Designed and operated in production"). Do not flatten exceptional independent work into junior-sounding phrasing.

# FIELD-SPECIFIC GUIDANCE

- user.name / user.contact: verbatim from RESUME_DATA. contact is a single string — join available channels with " | " (e.g. "email | phone | linkedin.com/in/x | github.com/x"), don't invent channels that aren't present.
- user.summary: a single-line tagline (under ~12 words) — role identity + specialty, e.g. "Backend engineer specializing in low-latency distributed systems."
- overall_summary: 2–3 full sentences (~40–60 words) on technical approach and strengths, matched to the JD. Do not repeat user.summary verbatim — this is the fuller version, not a copy.
- experience[].bullet_points: plain strings, same bullet formula as above, no category/strength needed. 3–5 per role, most recent/relevant role gets the most.
- skills.languages / .technologies / .devops / .tools: languages = programming languages only; technologies = frameworks, databases, platforms; devops = CI/CD, cloud, containers, IaC; tools = editors, monitoring, misc. Include only demonstrated, JD-relevant items — drop incidental tools even if present in raw input.
- achievements: only for standout items not already covered elsewhere — competition results, publications, patents, notable OSS adoption (e.g. a repo's real star/fork count if genuinely exceptional). Leave empty rather than inventing content to fill it.
- education: institution/degree/duration verbatim from RESUME_DATA.

# BEFORE YOU FINALIZE — SELF-CHECK

1. Every company, title, date, degree, and contact detail traces to RESUME_DATA — none invented.
2. Every number traces to an input — none invented.
3. No bullet contains banned filler language; every bullet names a real mechanism.
4. user.summary and overall_summary are genuinely different (tagline vs. paragraph), not duplicates.
5. No bullet was deliberately written to be "weak."
`.trim();

function dedent(block: string): string {
    return block
        .split("\n")
        .map((line) => line.trimStart())
        .join("\n")
        .trim();
}

function buildPrompt(repos: RankedProject[]): string {
    const blocks = repos.map((repo, index) =>
        dedent(`
            ## PROJECT ${index + 1}
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

            Scale Context:
            Files: ${repo.structure.file_count}
            Dirs: ${repo.structure.dir_count}
            Stars: ${repo.impact_signals.stars}
            Forks: ${repo.impact_signals.forks}
            Last Updated: ${repo.impact_signals.last_updated_days_ago} days ago
            Production Ready: ${repo.impact_signals.is_production_ready}
        `)
    );

    return (
        blocks.join("\n\n---\n\n") +
        "\n\n---\n\nGenerate resume bullet points for each project above."
    );
}

const RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        user: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                contact: { type: Type.STRING },
                summary: { type: Type.STRING },
            },
            required: ["name"],
        },

        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    bullet_points: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                },
                required: ["company", "role", "bullet_points"],
            },
        },

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
                        maxItems: 3,
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
                required: ["project_name", "bullet_points", "summary", "stack", "highlight_hint"],
            },
        },

        skills: {
            type: Type.OBJECT,
            properties: {
                languages: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                },
                technologies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                },
                devops: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                },
                tools: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                },
            },
        },

        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    duration: { type: Type.STRING },
                },
                required: ["institution"],
            },
        },

        achievements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },

        overall_summary: { type: Type.STRING },
    },

    required: ["projects", "skills"],
};

export async function geminiResponse(
    repos: RankedProject[],
    jobDescription: string,
    resumeData: any
): Promise<string> {
    try {
        const response = await client.models.generateContent({
            model: MODEL,
            contents: `${buildPrompt(repos)}\n\nJob Description: ${jobDescription}\n\nResume Data: ${JSON.stringify(resumeData)}`,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.25,
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA,
                maxOutputTokens: 4096,
            },
        });

        const text = response.text;
        if (!text) {
            const finishReason = response.candidates?.[0]?.finishReason ?? "unknown";
            throw new Error(`Gemini returned no text (finishReason: ${finishReason})`);
        }

        if (process.env.DEBUG_GEMINI) {
            console.log(text);
        }

        return text;
    } catch (err) {
        console.error("geminiResponse failed:", err);
        throw err;
    }
}
