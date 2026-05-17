import { z } from "zod";


// {
//   "project_name": "Realtime Whiteboard",

//   "summary": "A real-time collaborative whiteboard that enables multiple users to draw simultaneously with low-latency synchronization using CRDTs and WebSockets.",

//   "stack": [
//     "Next.js",
//     "TypeScript",
//     "WebSockets",
//     "CRDT"
//   ],

//   "key_features": [
//     "real-time collaboration",
//     "multiplayer synchronization",
//     "infinite canvas rendering",
//     "low-latency updates"
//   ],

//   "complexity_tags": [
//     "real-time",
//     "distributed-systems",
//     "collaborative-editing"
//   ],

//   "engineering_signals": {
//     "has_realtime": true,
//     "has_multiplayer": true,
//     "has_canvas_rendering": true,
//     "has_backend": true,
//     "has_tests": false,
//     "has_ci": true,
//     "has_auth": false
//   },

//   "architecture": {
//     "client": "Next.js frontend with canvas rendering",
//     "server": "WebSocket server for real-time sync",
//     "data_sync": "CRDT-based state management for conflict resolution"
//   },

//   "impact_signals": {
//     "stars": 120,
//     "forks": 30,
//     "last_updated_days_ago": 12,
//     "is_production_ready": true
//   },

//   "structure": {
//     "file_count": 120,
//     "dir_count": 15,
//     "depth": 4
//   },

//   "highlight_hint": "Focus on real-time collaboration, low-latency systems, and distributed state synchronization.",

// }

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
    signals: Signals,
    architecture: z.object({
        client: z.string(),
        server: z.string(),
        data_sync: z.string(),
    }),
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
