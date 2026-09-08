import { AnimatePresence, motion } from "framer-motion";
import { CALLS, PLAN, TOTAL_LATENCY, type SectionId } from "../agent/tools";
import type { RunPhase } from "../agent/useAgentRun";

interface ConsoleProps {
  done: SectionId[];
  phase: RunPhase;
  onSkip: () => void;
}

/**
 * The boot run. This is not a loading screen played over a finished page —
 * each section below mounts as its call lands here.
 */
export function BootConsole({ done, phase, onSkip }: ConsoleProps) {
  const inFlight = done.length;

  return (
    <AnimatePresence>
      {phase === "running" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-bg px-5"
        >
          <div className="w-full max-w-[560px] border border-border bg-surface font-mono">
            <header className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-[0.62rem]">
              <span className="h-1.5 w-1.5 animate-status-pulse bg-accent" aria-hidden />
              <span className="text-text">run 01</span>
              <span className="text-muted">claude-opus-5</span>
              <span className="ml-auto tabular-nums text-muted">{CALLS.length} tools</span>
            </header>

            <div className="px-4 py-3">
              <p className="mb-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-accent">plan</p>
              <ol className="mb-4 space-y-0.5">
                {PLAN.map((step, i) => (
                  <li key={step} className="flex gap-2 text-[0.68rem] text-muted">
                    <span className="tabular-nums opacity-50">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <div className="space-y-0.5">
                {CALLS.slice(0, inFlight + 1).map((call, i) => {
                  const complete = i < inFlight;
                  return (
                    <motion.div
                      key={call.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-baseline gap-2 text-[0.68rem]"
                    >
                      <span className="text-accent">▸</span>
                      <span className={complete ? "text-text" : "text-muted"}>{call.name}()</span>
                      <span className="ml-auto tabular-nums text-muted">
                        {complete ? `${call.latencyMs}ms` : "…"}
                      </span>
                      <span className={`w-3 text-right ${complete ? "text-accent" : "text-muted"}`}>
                        {complete ? "✓" : "▌"}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <footer className="flex items-center justify-between border-t border-border px-4 py-2 text-[0.6rem] text-muted">
              <span>assembling page…</span>
              <button onClick={onSkip} className="transition-colors hover:text-accent">
                skip →
              </button>
            </footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Persistent summary of the run, once it has finished. */
export function RunBar({ onReplay, runs }: { onReplay: () => void; runs: number }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[0.6rem] text-muted">
      <span className="h-1.5 w-1.5 bg-accent" aria-hidden />
      <span className="text-text">run {String(runs).padStart(2, "0")}</span>
      <span className="hidden sm:inline">{CALLS.length} tools</span>
      <span className="hidden tabular-nums sm:inline">{TOTAL_LATENCY}ms</span>
      <button
        onClick={onReplay}
        className="border border-border px-2 py-1 uppercase tracking-widest transition-colors hover:border-accent hover:text-accent"
      >
        replay
      </button>
    </div>
  );
}
