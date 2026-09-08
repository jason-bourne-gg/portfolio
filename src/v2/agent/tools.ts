/* =====================================================================
   TOOL LAYER
   The page is assembled by an agent run. Each section of the finished
   page is the return value of one of these calls, which is what makes
   the provenance badges honest rather than decorative.
   ===================================================================== */

import { aboutParagraphs, contact, education, experience, profile, projects, skills } from "../../data";
import { IMPACT } from "./impact";

export type SectionId = "profile" | "impact" | "deployments" | "builds" | "arsenal";

export interface ToolCall {
  id: SectionId;
  /** Rendered as the call signature in the console. */
  name: string;
  args: Record<string, string | number | boolean>;
  /** Deterministic "latency", so the console reads like a real run. */
  latencyMs: number;
  /** How long the UI waits before marking it done. */
  uiDelayMs: number;
  summary: string;
  result: unknown;
}

export const CALLS: ToolCall[] = [
  {
    id: "profile",
    name: "get_profile",
    args: {},
    latencyMs: 12,
    uiDelayMs: 420,
    summary: "1 operator",
    result: { ...profile, ...contact, about: aboutParagraphs, education },
  },
  {
    id: "impact",
    name: "get_impact_metrics",
    args: { sourced: true },
    latencyMs: 24,
    uiDelayMs: 520,
    summary: `${IMPACT.length} metrics`,
    result: IMPACT,
  },
  {
    id: "deployments",
    name: "get_experience",
    args: { order: "recent" },
    latencyMs: 31,
    uiDelayMs: 560,
    summary: `${experience.length} roles`,
    result: experience,
  },
  {
    id: "builds",
    name: "list_builds",
    args: { limit: projects.length },
    latencyMs: 18,
    uiDelayMs: 500,
    summary: `${projects.length} builds`,
    result: projects,
  },
  {
    id: "arsenal",
    name: "get_skills",
    args: { group: true },
    latencyMs: 7,
    uiDelayMs: 380,
    summary: `${skills.length} groups`,
    result: skills,
  },
];

export const CALL_BY_ID = Object.fromEntries(CALLS.map((c) => [c.id, c])) as Record<SectionId, ToolCall>;

export const TOTAL_LATENCY = CALLS.reduce((sum, c) => sum + c.latencyMs, 0);

export const PLAN: string[] = [
  "identify the operator",
  "pull sourced impact metrics",
  "pull deployment history",
  "pull side builds",
  "group the toolchain",
];
