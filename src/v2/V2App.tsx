/* =====================================================================
   V2 — the page assembles itself.

   An agent run plans, calls its tools, and each section below mounts as
   its call returns. When the run finishes, every section keeps the badge
   that opens the exact call and payload it was built from.
   ===================================================================== */

import { MotionConfig } from "framer-motion";
import { useTheme } from "../lib/themes";
import { profile } from "../data";
import { useAgentRun } from "./agent/useAgentRun";
import type { SectionId } from "./agent/tools";
import { BootConsole, RunBar } from "./components/Console";
import { InspectorProvider } from "./components/Inspector";
import {
  ArsenalSection,
  BuildsSection,
  ContactSection,
  DeploymentsSection,
  ImpactSection,
  ProfileSection,
} from "./sections";

export default function V2App() {
  const { current, cycleTheme } = useTheme();
  const { done, phase, replay, finish, runs } = useAgentRun();

  const has = (id: SectionId) => done.includes(id);

  return (
    <MotionConfig reducedMotion="user">
      <InspectorProvider>
        <BootConsole done={done} phase={phase} onSkip={finish} />

        <div className="min-h-dvh bg-bg text-text">
          <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm">
            <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-5 gap-y-2 px-5 py-2.5 sm:px-8">
              <a href="/" className="font-display text-[0.92rem] font-extrabold tracking-wide">
                {profile.first}
                <span className="text-accent">.{profile.last}</span>
              </a>

              <div className="hidden sm:block">
                <RunBar onReplay={replay} runs={runs} />
              </div>

              <div className="ml-auto flex items-center gap-2 font-mono text-[0.6rem]">
                <button
                  onClick={cycleTheme}
                  aria-label={`Switch theme (current: ${current.label})`}
                  className="border border-border px-2 py-1 uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {current.label}
                </button>
                <a
                  href="/trace"
                  title="The same content as a distributed trace"
                  className="border border-border px-2 py-1 uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  trace ↗
                </a>
                <a
                  href="/classic"
                  className="border border-border px-2 py-1 uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  v1 ↗
                </a>
              </div>
            </div>
          </header>

          <main>
            {has("profile") && <ProfileSection />}
            {has("impact") && <ImpactSection />}
            {has("deployments") && <DeploymentsSection />}
            {has("builds") && <BuildsSection />}
            {has("arsenal") && <ArsenalSection />}
            {phase === "done" && <ContactSection />}
          </main>
        </div>
      </InspectorProvider>
    </MotionConfig>
  );
}
