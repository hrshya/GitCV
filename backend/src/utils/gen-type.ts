import { z } from "zod";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

export const GitHubOwnerSchema = z.object({
  login: z.string(),
  id: z.number(),
  node_id: z.string(),
  avatar_url: z.string().url(),
  gravatar_id: z.string(),
  url: z.string().url(),
  html_url: z.string().url(),
  followers_url: z.string().url(),
  following_url: z.string(),
  gists_url: z.string(),
  starred_url: z.string(),
  subscriptions_url: z.string().url(),
  organizations_url: z.string().url(),
  repos_url: z.string().url(),
  events_url: z.string(),
  received_events_url: z.string().url(),
  type: z.enum(["User", "Organization", "Bot"]),
  user_view_type: z.string().optional(),
  site_admin: z.boolean(),
});

export const GitHubPermissionsSchema = z.object({
  admin: z.boolean(),
  maintain: z.boolean(),
  push: z.boolean(),
  triage: z.boolean(),
  pull: z.boolean(),
});

export const GitHubRepoSchema = z.object({
  // Identity
  id: z.number(),
  node_id: z.string(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),

  // Owner
  owner: GitHubOwnerSchema,

  // URLs
  html_url: z.string().url(),
  description: z.string().nullable(),
  fork: z.boolean(),
  url: z.string().url(),
  homepage: z.string().url().nullable().or(z.literal("")),

  // Activity signals (key ranking fields)
  stargazers_count: z.number().int().nonnegative(),
  watchers_count: z.number().int().nonnegative(),
  forks_count: z.number().int().nonnegative(),
  open_issues_count: z.number().int().nonnegative(),
  size: z.number().int().nonnegative(), // in KB

  // Timestamps (ISO 8601)
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  pushed_at: z.string().datetime(),

  // Tech metadata
  language: z.string().nullable(),
  topics: z.array(z.string()),
  default_branch: z.string(),

  // Feature flags
  has_issues: z.boolean(),
  has_projects: z.boolean(),
  has_downloads: z.boolean(),
  has_wiki: z.boolean(),
  has_pages: z.boolean(),
  has_discussions: z.boolean(),
  has_pull_requests: z.boolean().optional(),

  // Visibility / health
  archived: z.boolean(),
  disabled: z.boolean(),
  visibility: z.enum(["public", "private", "internal"]),
  is_template: z.boolean(),
  license: z
    .object({
      key: z.string(),
      name: z.string(),
      spdx_id: z.string(),
      url: z.string().url().nullable(),
    })
    .nullable(),

  // Computed aliases
  forks: z.number().int().nonnegative(),
  open_issues: z.number().int().nonnegative(),
  watchers: z.number().int().nonnegative(),

  // Optional
  permissions: GitHubPermissionsSchema.optional(),
  mirror_url: z.string().url().nullable(),
  allow_forking: z.boolean(),
  web_commit_signoff_required: z.boolean().optional(),
  pull_request_creation_policy: z.string().optional(),
});

// ─── Derived Types ────────────────────────────────────────────────────────────

export type GitHubOwner = z.infer<typeof GitHubOwnerSchema>;
export type GitHubPermissions = z.infer<typeof GitHubPermissionsSchema>;
export type GitHubRepo = z.infer<typeof GitHubRepoSchema>;

// ─── Ranking ──────────────────────────────────────────────────────────────────

/**
 * Weights used to compute a composite rank score.
 * Adjust per your ranking philosophy.
 */
export const DEFAULT_WEIGHTS: RankWeights = {
  stars: 0.35,       // Most reliable popularity signal
  forks: 0.20,       // Community interest / usefulness
  recency: 0.25,     // Days since last push (decayed)
  issues: 0.10,      // Open issues as an inverse signal
  size: 0.05,        // Larger = more substantial project
  hasHomepage: 0.05, // Polished enough to have a live demo
};

export interface RankWeights {
  stars: number;
  forks: number;
  recency: number;  // higher = pushed more recently
  issues: number;   // penalises high open issues
  size: number;
  hasHomepage: number;
}

export interface RankedRepo {
  repo: GitHubRepo;
  score: number;
  breakdown: Record<keyof RankWeights, number>;
}

