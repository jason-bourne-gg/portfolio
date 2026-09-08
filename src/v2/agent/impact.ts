/* =====================================================================
   IMPACT METRICS
   Every number here is lifted from a bullet in src/data.ts and keeps a
   reference back to it, so the UI can show the sentence it came from
   rather than asserting a figure with no source.
   ===================================================================== */

import { experience } from "../../data";

export interface Metric {
  id: string;
  label: string;
  /** Where it started. Null when the bullet only claims a delta. */
  from: string | null;
  to: string;
  /** Direction of the win, for colour and arrow. */
  dir: "down" | "up";
  /** Share of the bar to fill, 0–1. Encodes magnitude, not precision. */
  weight: number;
  /** Index into `experience`, then into that role's `points`. */
  source: [number, number];
}

export const IMPACT: Metric[] = [
  {
    id: "latency",
    label: "median response time",
    from: "baseline",
    to: "−90%",
    dir: "down",
    weight: 0.9,
    source: [0, 1],
  },
  {
    id: "accuracy",
    label: "task-success accuracy",
    from: "20%",
    to: "80%",
    dir: "up",
    weight: 0.8,
    source: [0, 1],
  },
  {
    id: "cost",
    label: "cost per session",
    from: "$5",
    to: "<$1",
    dir: "down",
    weight: 0.8,
    source: [0, 1],
  },
  {
    id: "revenue",
    label: "revenue, Amazon Ads",
    from: "baseline",
    to: "+370%",
    dir: "up",
    weight: 1,
    source: [2, 0],
  },
];

/** The exact sentence a metric was read from. */
export function sourceOf(metric: Metric): { role: string; org: string; text: string } {
  const [roleIndex, pointIndex] = metric.source;
  const role = experience[roleIndex];
  return { role: role.role, org: role.org, text: role.points[pointIndex] };
}
