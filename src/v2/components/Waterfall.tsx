import { DETACHED_SPANS, YEAR_TICKS, fmtDuration, pct, type Span } from "../trace";

const SERVICE_BAR: Record<string, string> = {
  root: "bg-border-hi",
  education: "bg-muted",
  browserstack: "bg-accent",
  sigmoid: "bg-accent-2",
  personal: "bg-accent",
};

const KIND_TAG: Record<Span["kind"], string> = {
  root: "root",
  edu: "edu",
  role: "role",
  work: "work",
  project: "proj",
};

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block w-3 shrink-0 text-center text-[0.6rem] text-muted transition-transform duration-150 ${
        open ? "rotate-90" : ""
      }`}
    >
      ▶
    </span>
  );
}

interface RowProps {
  span: Span;
  selected: boolean;
  dimmed: boolean;
  collapsed: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

function Row({ span, selected, dimmed, collapsed, onSelect, onToggle }: RowProps) {
  const startPct = pct(span.start);
  const endPct = pct(span.end);
  const width = Math.max(0.6, endPct - startPct);
  // Place the duration label wherever there is room: right of the bar by
  // default, left of it for spans running up to "now", and inside the bar
  // when it spans the full window and there is no outside room at all.
  const labelPlacement = endPct <= 88 ? "right" : startPct >= 10 ? "left" : "inside";

  return (
    <div
      role="row"
      data-span-row={span.id}
      onClick={() => onSelect(span.id)}
      className={`group grid cursor-pointer items-center border-l-2 transition-colors duration-100 ${
        selected ? "border-accent bg-surface" : "border-transparent hover:bg-surface/60"
      } ${dimmed ? "opacity-25" : ""}`}
      style={{ gridTemplateColumns: "var(--name-col) 1fr" }}
    >
      <div
        className="flex min-w-0 items-center gap-1.5 py-[5px] pr-3 text-[0.66rem] sm:text-[0.72rem]"
        style={{ paddingLeft: 10 + span.depth * 14 }}
      >
        {span.children.length > 0 ? (
          <button
            aria-label={collapsed ? `Expand ${span.name}` : `Collapse ${span.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(span.id);
            }}
            className="grid h-3 w-3 shrink-0 place-items-center"
          >
            <Chevron open={!collapsed} />
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className={`truncate ${selected ? "text-text" : "text-muted group-hover:text-text"}`}>
          {span.name}
        </span>
        <span className="ml-auto hidden shrink-0 border border-border px-1 text-[0.55rem] uppercase tracking-widest text-muted sm:inline-block">
          {KIND_TAG[span.kind]}
        </span>
      </div>

      <div className="relative h-full py-[5px] pr-4">
        <div
          className={`absolute top-1/2 h-[11px] -translate-y-1/2 ${SERVICE_BAR[span.service] ?? "bg-muted"} ${
            selected ? "opacity-100" : "opacity-70 group-hover:opacity-90"
          }`}
          style={{ left: `${pct(span.start)}%`, width: `${width}%` }}
        >
          <span className="absolute inset-x-0 top-0 h-px bg-text/30" />
        </div>
        <span
          className={`absolute top-1/2 hidden -translate-y-1/2 whitespace-nowrap text-[0.6rem] tabular-nums sm:block ${
            labelPlacement === "inside" ? "pr-2 text-text" : "text-muted"
          } ${labelPlacement === "left" ? "pr-2" : ""} ${labelPlacement === "right" ? "pl-2" : ""}`}
          style={
            labelPlacement === "right"
              ? { left: `${endPct}%` }
              : { right: `calc(${100 - (labelPlacement === "left" ? startPct : endPct)}% + 16px)` }
          }
        >
          {fmtDuration(span.end - span.start)}
        </span>
      </div>
    </div>
  );
}

export function Axis() {
  return (
    <div
      className="sticky top-0 z-20 grid border-b border-border bg-bg"
      style={{ gridTemplateColumns: "var(--name-col) 1fr" }}
    >
      <div className="flex items-center gap-2 border-r border-border px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-muted">
        span
      </div>
      <div className="relative h-[26px] pr-4">
        {YEAR_TICKS.map((tick) => (
          <span
            key={tick.year}
            className={`absolute top-1.5 -translate-x-1/2 text-[0.58rem] tabular-nums text-muted ${
              tick.year % 3 === 0 ? "" : "hidden md:inline"
            }`}
            style={{ left: `${pct(tick.at)}%` }}
          >
            {tick.year}
          </span>
        ))}
        <span className="absolute right-4 top-1.5 hidden text-[0.58rem] uppercase tracking-widest text-accent md:inline">
          now
        </span>
      </div>
    </div>
  );
}

interface WaterfallProps {
  rows: Span[];
  selected: string;
  collapsed: ReadonlySet<string>;
  query: string;
  matches: (span: Span) => boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

export function Waterfall({
  rows,
  selected,
  collapsed,
  query,
  matches,
  onSelect,
  onToggle,
}: WaterfallProps) {
  return (
    <div className="relative">
      {/* Year gridlines run behind every row so the bars read against a real axis. */}
      <div
        className="pointer-events-none absolute inset-y-0 z-0"
        style={{ left: "var(--name-col)", right: 16 }}
        aria-hidden
      >
        {YEAR_TICKS.map((tick) => (
          <span
            key={tick.year}
            className="absolute inset-y-0 w-px bg-border/60"
            style={{ left: `${pct(tick.at)}%` }}
          />
        ))}
        <span className="absolute inset-y-0 right-0 w-px bg-accent/50" />
      </div>

      <div className="relative z-10">
        {rows.map((span) => (
          <Row
            key={span.id}
            span={span}
            selected={span.id === selected}
            dimmed={query.length > 0 && !matches(span)}
            collapsed={collapsed.has(span.id)}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        ))}
      </div>

      <div className="relative z-10 mt-6 border-t border-border">
        <div className="flex items-baseline gap-3 px-3 py-2">
          <span className="text-[0.58rem] uppercase tracking-[0.2em] text-accent">detached spans</span>
          <span className="text-[0.58rem] text-muted">no wall-clock recorded · side builds</span>
        </div>
        {DETACHED_SPANS.map((span) => (
          <div
            key={span.id}
            role="row"
            data-span-row={span.id}
            onClick={() => onSelect(span.id)}
            className={`group grid cursor-pointer items-center border-l-2 transition-colors duration-100 ${
              span.id === selected ? "border-accent bg-surface" : "border-transparent hover:bg-surface/60"
            } ${query.length > 0 && !matches(span) ? "opacity-25" : ""}`}
            style={{ gridTemplateColumns: "var(--name-col) 1fr" }}
          >
            <div className="flex min-w-0 items-center gap-1.5 py-[5px] pl-6 pr-3 text-[0.66rem] sm:text-[0.72rem]">
              <span className="w-3 shrink-0" />
              <span
                className={`truncate ${
                  span.id === selected ? "text-text" : "text-muted group-hover:text-text"
                }`}
              >
                {span.name}
              </span>
              <span className="ml-auto hidden shrink-0 border border-border px-1 text-[0.55rem] uppercase tracking-widest text-muted sm:inline-block">
                proj
              </span>
            </div>
            <div className="relative h-full py-[5px] pr-4">
              <div className="absolute top-1/2 h-[11px] w-[90px] -translate-y-1/2 border border-dashed border-accent/60" />
              <span className="absolute left-[100px] top-1/2 -translate-y-1/2 text-[0.6rem] text-muted">
                {span.status} · {span.stack?.[0]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
