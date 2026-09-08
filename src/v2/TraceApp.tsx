/* =====================================================================
   V2 — TRACE EXPLORER
   The same content as v1, presented as a distributed trace: nested spans
   on a real wall-clock axis, a detail pane, and keyboard navigation.
   ===================================================================== */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "../lib/router";
import { useTheme } from "../lib/themes";
import { contact } from "../data";
import {
  DETACHED_SPANS,
  EMPLOYED_MS,
  ROOT,
  SPANS,
  SPAN_BY_ID,
  T0,
  T1,
  fmtDuration,
  flatten,
  type Span,
} from "./trace";
import { Axis, Waterfall } from "./components/Waterfall";
import { DetailPane } from "./components/DetailPane";

const SPAN_ROUTE = "/span/";

function idFromPath(path: string): string {
  if (!path.startsWith(SPAN_ROUTE)) return ROOT.id;
  const id = decodeURIComponent(path.slice(SPAN_ROUTE.length));
  return SPAN_BY_ID[id] ? id : ROOT.id;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[0.55rem] uppercase tracking-[0.2em] text-muted">{label}</span>
      <span className="text-[0.78rem] tabular-nums text-text">{value}</span>
    </div>
  );
}

export default function TraceApp() {
  const { path, navigate } = useRouter();
  const { current, cycleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const [query, setQuery] = useState("");
  const filterRef = useRef<HTMLInputElement>(null);

  const selected = idFromPath(path);
  const span = SPAN_BY_ID[selected] ?? ROOT;

  const select = useCallback(
    (id: string) => navigate(id === ROOT.id ? "/trace" : `${SPAN_ROUTE}${encodeURIComponent(id)}`),
    [navigate]
  );

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const timedRows = useMemo(() => flatten(collapsed), [collapsed]);
  const navRows = useMemo(() => [...timedRows, ...DETACHED_SPANS], [timedRows]);

  const matches = useCallback(
    (candidate: Span) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const haystack = [
        candidate.name,
        candidate.body ?? "",
        candidate.bullets?.join(" ") ?? "",
        candidate.stack?.join(" ") ?? "",
        candidate.attrs.map((a) => `${a.k} ${a.v}`).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    },
    [query]
  );

  const hits = useMemo(
    () => (query.trim() ? SPANS.filter(matches).length : SPANS.length),
    [query, matches]
  );

  // Keyboard navigation — the whole trace is reachable without a mouse.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const typing = document.activeElement === filterRef.current;

      if (e.key === "/" && !typing) {
        e.preventDefault();
        filterRef.current?.focus();
        return;
      }
      if (e.key === "Escape") {
        if (typing) filterRef.current?.blur();
        setQuery("");
        return;
      }
      if (typing) return;

      const index = navRows.findIndex((row) => row.id === selected);

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        select(navRows[Math.min(index + 1, navRows.length - 1)]?.id ?? selected);
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        select(navRows[Math.max(index - 1, 0)]?.id ?? selected);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (span.children.length && collapsed.has(span.id)) toggle(span.id);
        else if (span.children.length) select(span.children[0]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (span.children.length && !collapsed.has(span.id)) toggle(span.id);
        else if (span.parent) select(span.parent);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navRows, selected, span, collapsed, select, toggle]);

  // Keep the selected row in view when navigating by keyboard.
  useEffect(() => {
    document
      .querySelector(`[data-span-row="${CSS.escape(selected)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg font-mono text-text">
      <header className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-status-pulse bg-accent" aria-hidden />
          <span className="text-[0.8rem] tracking-tight text-text">trace-explorer</span>
          <span className="text-[0.62rem] text-muted">/ {ROOT.name}</span>
        </div>

        <div className="flex items-center gap-6">
          <Stat label="window" value={fmtDuration(T1 - T0)} />
          <Stat label="employed" value={fmtDuration(EMPLOYED_MS)} />
          <Stat label="spans" value={String(SPANS.length)} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 border border-border bg-bg-2 px-2 py-1 focus-within:border-accent">
            <span className="text-[0.6rem] text-muted">filter</span>
            <input
              ref={filterRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="press /"
              aria-label="Filter spans"
              className="w-36 bg-transparent text-[0.7rem] text-text outline-none placeholder:text-muted"
            />
            {query && <span className="text-[0.6rem] tabular-nums text-accent">{hits}</span>}
          </div>

          <button
            onClick={cycleTheme}
            className="border border-border px-2 py-1 text-[0.6rem] uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {current.label}
          </button>

          <a
            href="/"
            className="border border-border px-2 py-1 text-[0.6rem] uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent"
          >
            main ↗
          </a>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-auto">
          <Axis />
          <Waterfall
            rows={timedRows}
            selected={selected}
            collapsed={collapsed}
            query={query}
            matches={matches}
            onSelect={select}
            onToggle={toggle}
          />
        </main>

        <aside className="hidden w-[400px] shrink-0 overflow-hidden border-l border-border lg:block">
          <DetailPane span={span} />
        </aside>
      </div>

      {/* Below lg the detail pane has nowhere to sit, so a selected span
          opens as a sheet instead of silently doing nothing. */}
      {selected !== ROOT.id && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex max-h-[70dvh] flex-col border-t-2 border-accent bg-bg lg:hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
            <span className="text-[0.58rem] uppercase tracking-[0.2em] text-accent">span detail</span>
            <button
              onClick={() => select(ROOT.id)}
              className="border border-border px-2 py-0.5 text-[0.6rem] uppercase tracking-widest text-muted"
            >
              close ✕
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <DetailPane span={span} />
          </div>
        </div>
      )}

      <footer className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 border-t border-border px-4 py-1.5 text-[0.58rem] text-muted">
        <span>
          <span className="text-accent">j/k</span> move
        </span>
        <span>
          <span className="text-accent">←/→</span> collapse · drill
        </span>
        <span>
          <span className="text-accent">/</span> filter
        </span>
        <span className="ml-auto flex items-center gap-4">
          <a href={`mailto:${contact.email}`} className="hover:text-accent">
            {contact.email}
          </a>
          <a href={contact.github.url} target="_blank" rel="noopener" className="hover:text-accent">
            {contact.github.label}
          </a>
          <a href={contact.linkedin.url} target="_blank" rel="noopener" className="hover:text-accent">
            {contact.linkedin.label}
          </a>
        </span>
      </footer>
    </div>
  );
}
