import { useCallback, useEffect, useRef, useState } from "react";
import { CALLS, type SectionId } from "./tools";

const SEEN_KEY = "v2-run-seen";

function shouldSkip(): boolean {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export type RunPhase = "running" | "done";

/**
 * Drives the assembly run. Sections mount as their call completes, so the
 * console is not a loading screen played over finished content — it is the
 * thing actually putting the page together.
 *
 * Skipped entirely for repeat visits in a session and for reduced-motion
 * users, who get the whole page immediately.
 */
export function useAgentRun() {
  const skipped = useRef(shouldSkip());
  const [done, setDone] = useState<SectionId[]>(() => (skipped.current ? CALLS.map((c) => c.id) : []));
  const [phase, setPhase] = useState<RunPhase>(() => (skipped.current ? "done" : "running"));
  const [runs, setRuns] = useState(1);

  useEffect(() => {
    if (phase !== "running") return;

    const timers: number[] = [];
    let index = 0;

    const step = () => {
      if (index >= CALLS.length) {
        setPhase("done");
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {
          /* private mode — the run just plays again next time */
        }
        return;
      }
      const call = CALLS[index++];
      timers.push(
        window.setTimeout(() => {
          setDone((prev) => [...prev, call.id]);
          step();
        }, call.uiDelayMs)
      );
    };

    step();
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [phase, runs]);

  const finish = useCallback(() => {
    setDone(CALLS.map((c) => c.id));
    setPhase("done");
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode */
    }
  }, []);

  const replay = useCallback(() => {
    setDone([]);
    setPhase("running");
    setRuns((r) => r + 1);
  }, []);

  return { done, phase, replay, finish, runs };
}
