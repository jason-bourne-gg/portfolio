import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CALL_BY_ID, type SectionId } from "../agent/tools";

interface InspectorValue {
  open: (id: SectionId) => void;
}

const InspectorContext = createContext<InspectorValue | null>(null);

function useInspector(): InspectorValue {
  const context = useContext(InspectorContext);
  if (!context) throw new Error("useInspector must be used within an InspectorProvider");
  return context;
}

/**
 * The badge every section carries. Nothing on the page asserts a fact
 * without a way to see the call that produced it.
 */
export function Provenance({ id }: { id: SectionId }) {
  const { open } = useInspector();
  const call = CALL_BY_ID[id];

  return (
    <button
      onClick={() => open(id)}
      title={`Inspect ${call.name}()`}
      className="group inline-flex items-center gap-1.5 border border-border px-2 py-1 font-mono text-[0.6rem] text-muted transition-colors hover:border-accent hover:text-accent"
    >
      <span className="text-accent">▸</span>
      <span>{call.name}()</span>
      <span className="tabular-nums opacity-60">{call.latencyMs}ms</span>
    </button>
  );
}

export function InspectorProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<SectionId | null>(null);
  const open = useCallback((id: SectionId) => setOpenId(id), []);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  const call = openId ? CALL_BY_ID[openId] : null;
  const signature = call
    ? `${call.name}(${Object.entries(call.args)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join(", ")})`
    : "";

  return (
    <InspectorContext.Provider value={{ open }}>
      {children}

      {call && (
        <>
          <div
            onClick={() => setOpenId(null)}
            className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm"
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label={`${call.name} result`}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col border-l border-accent bg-bg font-mono"
          >
            <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <span className="block text-[0.58rem] uppercase tracking-[0.2em] text-accent">
                  tool call
                </span>
                <h2 className="break-all text-[0.85rem] text-text">{signature}</h2>
                <p className="mt-1 text-[0.62rem] text-muted">
                  returned {call.summary} in <span className="tabular-nums">{call.latencyMs}ms</span>
                </p>
              </div>
              <button
                onClick={() => setOpenId(null)}
                className="shrink-0 border border-border px-2 py-1 text-[0.6rem] uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent"
              >
                esc ✕
              </button>
            </header>

            <pre className="flex-1 overflow-auto px-4 py-3 text-[0.65rem] leading-relaxed text-muted">
              {JSON.stringify(call.result, null, 2)}
            </pre>
          </aside>
        </>
      )}
    </InspectorContext.Provider>
  );
}
