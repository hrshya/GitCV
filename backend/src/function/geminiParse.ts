import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is required");
}

const client = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

const MODEL = "gemini-3-flash-preview";

const EXTRACTION_SYSTEM_PROMPT = `
You are a resume PARSER, not a resume writer. Your only job is faithful extraction: convert raw resume text into structured JSON, preserving the original content and wording exactly.
 
# WHAT THIS MEANS
 
- Do NOT rewrite, rephrase, summarize, correct grammar, or "improve" anything.
- Do NOT reorder bullets or sections.
- Do NOT infer, guess, or fill in information that isn't explicitly present in the source text.
- Do NOT invent metrics, technologies, dates, or achievements.
- Preserve bullet/description text as close to verbatim as the input formatting allows — you may strip leading bullet characters (•, -, *) and collapse redundant whitespace, but do not paraphrase or shorten.
- Preserve dates exactly as written (e.g. "Jan 2022 – Present" stays "Jan 2022 – Present"). Do not normalize date formats or infer missing end dates.
- If a field or section isn't present in the source, leave it out (for optional string fields) or use an empty array (for list fields) — never write placeholders like "N/A" or "Not specified," and never invent content to fill a gap.
 
# FIELD MAPPING
 
- personal: name, email, phone, location, linkedin, github — only what's literally present. Fill "email" only if it looks like a genuine email address. Fill "linkedin"/"github" only from actual URLs or handles in the text, never inferred from a name.
- summary: the resume's own summary/objective section, verbatim, if one exists. If there's no explicit summary section, leave this field out entirely — do not generate one.
- skills: extract from an explicit skills/technologies section, split into individual items. Do not pull skills out of job descriptions or infer skills implied by a job title.
- experience: one entry per job. "description" is an array — one item per bullet, in original order and wording. "technologies" is only what's explicitly named for that role, not the candidate's general stack.
- education: one entry per degree/program.
- projects: one entry per project. "links" holds URLs exactly as written in the source.
 
Always include "experience", "education", and "projects" as arrays in the output — use [] if the resume has no entries for that section. Never omit these three keys.
 
# WHEN SOURCE TEXT IS MESSY
 
Resume text extracted from PDF/DOCX often has broken line wraps, stray whitespace, or merged columns from multi-column layouts. Use judgment to reassemble a bullet or field that's obviously just split across lines — but messy formatting is a reason to clean up whitespace, never a reason to guess at content that isn't there.
`.trim();
 
const RESUME_EXTRACTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        personal: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                github: { type: Type.STRING },
            },
        },
        summary: { type: Type.STRING },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    location: { type: Type.STRING },
                    description: { type: Type.ARRAY, items: { type: Type.STRING } },
                    technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
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
                    field: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                },
            },
        },
        projects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    links: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
            },
        },
    },
    required: ["personal", "skills", "experience", "education", "projects"],
};
 
export async function extractResumeJson(resumeText: string) {
    if (!resumeText?.trim()) {
        throw new Error("extractResumeJson: resumeText is empty");
    }
 
    const response = await client.models.generateContent({
        model: MODEL,
        contents: `Resume text:\n\n${resumeText}`,
        config: {
            systemInstruction: EXTRACTION_SYSTEM_PROMPT,
            temperature: 0, // pure extraction — fidelity matters more than fluency here
            responseMimeType: "application/json",
            responseSchema: RESUME_EXTRACTION_SCHEMA,
            maxOutputTokens: 4096,
        },
    });
 
    const text = response.text;
    if (!text) {
        const finishReason = response.candidates?.[0]?.finishReason ?? "unknown";
        throw new Error(`Gemini returned no text (finishReason: ${finishReason})`);
    }
 
    let raw: unknown;
    try {
        raw = JSON.parse(text);
    } catch (err) {
        throw new Error(`Gemini returned invalid JSON: ${(err as Error).message}`);
    }
 
    return raw;
}
