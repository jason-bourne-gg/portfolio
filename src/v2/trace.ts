/* =====================================================================
   V2 — TRACE MODEL
   Derives a span tree from the same content in src/data.ts. No copy is
   duplicated here: only the structure (parentage, wall-clock, labels)
   that turns a resume into a trace.
   ===================================================================== */

import { contact, education, experience, profile, projects, skills } from "../data";

export type SpanKind = "root" | "edu" | "role" | "work" | "project";

export interface SpanLink {
  label: string;
  href: string;
}

export interface Span {
  id: string;
  name: string;
  kind: SpanKind;
  service: string;
  depth: number;
  parent: string | null;
  children: string[];
  /** Wall-clock. Detached spans carry the parent window purely for layout. */
  start: number;
  end: number;
  /** True when no real wall-clock exists for this span (side projects). */
  detached?: boolean;
  attrs: { k: string; v: string }[];
  body?: string;
  bullets?: string[];
  stack?: string[];
  links?: SpanLink[];
  note?: string;
  status?: string;
}

const MONTH: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

export const NOW = Date.now();

/** "FEB '25" | "PRESENT" | "2017" → epoch ms. */
function parseToken(token: string): number {
  const t = token.trim().toUpperCase();
  if (t === "PRESENT" || t === "NOW") return NOW;

  const monthYear = /^([A-Z]{3})\s*'(\d{2})$/.exec(t);
  if (monthYear) return Date.UTC(2000 + Number(monthYear[2]), MONTH[monthYear[1]] ?? 0, 1);

  const year = /^(\d{4})$/.exec(t);
  if (year) return Date.UTC(Number(year[1]), 0, 1);

  return NOW;
}

/** "JUL '22 — DEC '23" → { start, end }. Em dash is the separator in data.ts. */
function parseRange(range: string): { start: number; end: number } {
  const [from, to] = range.split("—").map((part) => part.trim());
  return { start: parseToken(from), end: parseToken(to ?? from) };
}

/**
 * Short machine-style names for the workstreams inside each role. The prose
 * still comes from data.ts; only these labels are presentation, and they are
 * positional so reordering a role's points reorders its child spans.
 */
const WORK_LABELS: string[][] = [
  ["agent.authoring_loop", "inference.tiered_routing", "platform.enterprise_surface"],
  ["budgeting.digitisation", "budgeting.ml_allocation", "analytics.realtime_kpis"],
  ["adtech.backend", "adtech.ml_recommendations", "pipeline.harmonisation"],
];

const SERVICE_BY_ORG: Record<string, string> = {
  BrowserStack: "browserstack",
  "Sigmoid Analytics": "sigmoid",
};

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function fmtDuration(ms: number): string {
  const months = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24 * 30.44)));
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years && rest) return `${years}y ${rest}mo`;
  if (years) return `${years}y`;
  return `${rest}mo`;
}

export function fmtDate(ms: number): string {
  const d = new Date(ms);
  const month = Object.keys(MONTH)[d.getUTCMonth()];
  return `${month} '${String(d.getUTCFullYear()).slice(2)}`;
}

function buildSpans(): Span[] {
  const spans: Span[] = [];
  const rootChildren: string[] = [];

  // --- education (earliest real span) -------------------------------------
  const eduRange = parseRange(education.primary.meta.split("·")[0]);
  const eduId = "edu.iitbbs";
  spans.push({
    id: eduId,
    name: eduId,
    kind: "edu",
    service: "education",
    depth: 1,
    parent: "career",
    children: [],
    start: eduRange.start,
    end: eduRange.end,
    attrs: [
      { k: "degree", v: education.primary.degree },
      { k: "school", v: education.primary.school },
      { k: "record", v: education.primary.meta },
      ...education.rows.map((r) => ({ k: slug(r.label), v: r.meta })),
    ],
  });
  rootChildren.push(eduId);

  // --- roles, oldest first, each with its workstreams ---------------------
  const roles = experience
    .map((exp, i) => ({ exp, labels: WORK_LABELS[i] ?? [], ...parseRange(exp.date) }))
    .sort((a, b) => a.start - b.start);

  for (const { exp, labels, start, end } of roles) {
    const service = SERVICE_BY_ORG[exp.org] ?? slug(exp.org);
    const roleId = `${service}.${slug(exp.role).replace(/-+/g, "_")}`;
    const childIds: string[] = [];

    // Workstreams have no individually recorded dates, so they tile the
    // parent window evenly. The detail pane never claims a date for them.
    const slice = (end - start) / Math.max(1, exp.points.length);
    exp.points.forEach((point, i) => {
      const id = `${roleId}/${labels[i] ?? `work_${i + 1}`}`;
      spans.push({
        id,
        name: labels[i] ?? `work_${i + 1}`,
        kind: "work",
        service,
        depth: 2,
        parent: roleId,
        children: [],
        start: start + slice * i,
        end: start + slice * (i + 1),
        attrs: [{ k: "role", v: exp.role }, { k: "org", v: exp.org }],
        body: point,
      });
      childIds.push(id);
    });

    spans.push({
      id: roleId,
      name: roleId,
      kind: "role",
      service,
      depth: 1,
      parent: "career",
      children: childIds,
      start,
      end,
      attrs: [
        { k: "role", v: exp.role },
        { k: "org", v: exp.org },
        { k: "window", v: exp.date },
      ],
      bullets: exp.points,
      stack: exp.stack,
    });
    rootChildren.push(roleId);
  }

  // --- side projects: real spans, no wall-clock ---------------------------
  for (const project of projects) {
    const id = `personal.${slug(project.title)}`;
    const links: SpanLink[] = [];
    if (project.live) links.push({ label: "live", href: project.live });
    if (project.repo) links.push({ label: "repo", href: project.repo });

    spans.push({
      id,
      name: id,
      kind: "project",
      service: "personal",
      depth: 1,
      parent: null,
      children: [],
      detached: true,
      start: NOW,
      end: NOW,
      status: project.rank,
      attrs: [
        { k: "rank", v: project.rank },
        { k: "class", v: project.kicker.replace(/^\/\/\s*/, "") },
        ...(project.metrics ?? []).map((m) => ({ k: m.label, v: m.num })),
      ],
      body: project.desc,
      stack: project.stack,
      links,
      note: project.note,
    });
  }

  // --- root ---------------------------------------------------------------
  const timed = spans.filter((s) => !s.detached);
  const start = Math.min(...timed.map((s) => s.start));

  spans.push({
    id: "career",
    name: "aniket.charjan",
    kind: "root",
    service: "root",
    depth: 0,
    parent: null,
    children: rootChildren,
    start,
    end: NOW,
    attrs: [
      { k: "name", v: profile.fullName },
      { k: "role", v: profile.role },
      { k: "status", v: profile.status },
      { k: "location", v: profile.location },
      { k: "email", v: contact.email },
      { k: "github", v: contact.github.label },
      { k: "linkedin", v: contact.linkedin.label },
    ],
    stack: skills.flatMap((category) => category.items),
  });

  return spans;
}

export const SPANS: Span[] = buildSpans();
export const SPAN_BY_ID: Record<string, Span> = Object.fromEntries(SPANS.map((s) => [s.id, s]));

export const ROOT = SPAN_BY_ID["career"];
export const TIMED_SPANS = SPANS.filter((s) => !s.detached);
export const DETACHED_SPANS = SPANS.filter((s) => s.detached);

export const T0 = ROOT.start;
export const T1 = ROOT.end;

/** Employed time only — the roles, excluding the education span. */
export const EMPLOYED_MS = SPANS.filter((s) => s.kind === "role").reduce(
  (total, s) => total + (s.end - s.start),
  0
);

/** Year boundaries inside the trace window, for axis ticks and gridlines. */
export const YEAR_TICKS: { year: number; at: number }[] = (() => {
  const ticks: { year: number; at: number }[] = [];
  for (let y = new Date(T0).getUTCFullYear(); y <= new Date(T1).getUTCFullYear(); y++) {
    ticks.push({ year: y, at: Date.UTC(y, 0, 1) });
  }
  return ticks;
})();

/** Fraction of the trace window, 0–1. */
export function pct(ms: number): number {
  return ((ms - T0) / (T1 - T0)) * 100;
}

/** Depth-first order of the timed tree, honouring collapsed nodes. */
export function flatten(collapsed: ReadonlySet<string>): Span[] {
  const out: Span[] = [];
  const walk = (id: string) => {
    const span = SPAN_BY_ID[id];
    if (!span) return;
    out.push(span);
    if (collapsed.has(id)) return;
    for (const child of span.children) walk(child);
  };
  walk("career");
  return out;
}
