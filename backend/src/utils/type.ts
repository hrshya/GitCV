import { z } from "zod";

export const Signals = z.object({
    core: z.object({
        api: z.boolean(),
        frontend: z.boolean(),
        backend: z.boolean(),
        database: z.boolean(),
        auth: z.boolean(),
    }),
    system: z.object({
        realtime: z.boolean(),
        websocket: z.boolean(),
        cron: z.boolean(),
        eventDriven: z.boolean(),
    }),
    infra: z.object({
        docker: z.boolean(),
        kubernetes: z.boolean(),
        ci: z.boolean(),
        cd: z.boolean(),
        cloud: z.boolean(),
    }),
    ai: z.object({
        ml: z.boolean(),
        notebooks: z.boolean(),
        training: z.boolean(),
        data: z.boolean(),
    }),
    quality: z.object({
        tests: z.boolean(),
        linting: z.boolean(),
        docs: z.boolean(),
    }),
    product: z.object({
        payments: z.boolean(),
        notifications: z.boolean(),
        upload: z.boolean(),
        search: z.boolean(),
        dashboard: z.boolean(),
    }),
});

export const RankedSchema = z.object({
    project_name: z.string(),
    summary: z.string(),
    stack: z.array(z.string()),
    key_features: z.array(z.string()),
    complexity_tags: z.array(z.string()),
    score: z.number(),
    impact_signals: z.object({
        stars: z.number(),
        forks: z.number(),
        last_updated_days_ago: z.number(),
        is_production_ready: z.boolean(),
    }),
    structure: z.object({
        file_count: z.number(),
        dir_count: z.number(),
        depth: z.number(),
    }),
    highlight_hint: z.string(),
});

export type RankedProject = z.infer<typeof RankedSchema>;
