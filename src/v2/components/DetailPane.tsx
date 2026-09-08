import { useState, type ReactNode } from "react";
import { SPAN_BY_ID, fmtDate, fmtDuration, type Span } from "../trace";

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[104px_1fr] gap-3 py-[3px] text-[0.7rem]">
      <span className="truncate text-muted">{k}</span>
      <span className="break-words text-text">{v}</span>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="border-t border-border px-4 py-3">
      <h3 className="mb-2 text-[0.58rem] uppercase tracking-[0.2em] text-accent">{label}</h3>
      {children}
    </section>
  );
}

/** The span as it would appear in a real trace payload. */
function toJson(span: Span) {
  return {
    spanId: span.id,
    name: span.name,
    kind: span.kind,
    service: span.service,
    parentSpanId: span.parent,
    startTime: span.detached || span.kind === "work" ? null : new Date(span.start).toISOString(),
    endTime: span.detached || span.kind === "work" ? null : new Date(span.end).toISOString(),
    durationMs: span.detached || span.kind === "work" ? null : span.end - span.start,
    attributes: Object.fromEntries(span.attrs.map((a) => [a.k, a.v])),
    ...(span.stack ? { "resource.stack": span.stack } : {}),
    ...(span.links ? { links: span.links } : {}),
  };
}

export function DetailPane({ span }: { span: Span }) {
  const [raw, setRaw] = useState(false);
  const parent = span.parent ? SPAN_BY_ID[span.parent] : null;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <span className="block text-[0.58rem] uppercase tracking-[0.2em] text-muted">
            {span.kind} span
          </span>
          <h2 className="truncate font-mono text-[0.95rem] text-text">{span.name}</h2>
        </div>
        <button
          onClick={() => setRaw((r) => !r)}
          className={`shrink-0 border px-2 py-1 text-[0.58rem] uppercase tracking-widest transition-colors ${
            raw ? "border-accent text-accent" : "border-border text-muted hover:border-border-hi hover:text-text"
          }`}
        >
          json
        </button>
      </header>

      {raw ? (
        <pre className="flex-1 overflow-auto px-4 py-3 text-[0.66rem] leading-relaxed text-muted">
          {JSON.stringify(toJson(span), null, 2)}
        </pre>
      ) : (
        <div className="flex-1 overflow-auto">
          <Section label="timing">
            {span.detached && (
              <p className="text-[0.7rem] leading-relaxed text-muted">
                Detached — built outside a tracked window, so no start or duration is recorded.
              </p>
            )}

            {/* Workstreams tile their role's window for layout. They carry no
                recorded dates of their own, so none are shown as if they were. */}
            {span.kind === "work" && (
              <p className="text-[0.7rem] leading-relaxed text-muted">
                Inherits its window from{" "}
                <span className="text-text">{parent?.name}</span>. Workstreams are not
                individually timestamped — bar position shows order within the role, not a
                recorded date.
              </p>
            )}

            {!span.detached && span.kind !== "work" && (
              <>
                <Field k="start" v={fmtDate(span.start)} />
                <Field k="end" v={span.end >= Date.now() - 86_400_000 ? "now" : fmtDate(span.end)} />
                <Field k="duration" v={fmtDuration(span.end - span.start)} />
              </>
            )}

            {parent && <Field k="parent" v={parent.name} />}
          </Section>

          {span.attrs.length > 0 && (
            <Section label="attributes">
              {span.attrs.map((a) => (
                <Field key={a.k} k={a.k} v={a.v} />
              ))}
            </Section>
          )}

          {span.body && (
            <Section label="body">
              <p className="text-[0.74rem] leading-relaxed text-muted">{span.body}</p>
            </Section>
          )}

          {span.note && (
            <Section label="note">
              <p className="border-l-2 border-accent/60 bg-bg-2/60 py-1.5 pl-3 text-[0.7rem] leading-relaxed text-muted">
                {span.note}
              </p>
            </Section>
          )}

          {span.bullets && (
            <Section label="events">
              <ul className="space-y-2">
                {span.bullets.map((point, i) => (
                  <li key={i} className="flex gap-2 text-[0.72rem] leading-relaxed text-muted">
                    <span className="shrink-0 text-accent">·</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {span.stack && span.stack.length > 0 && (
            <Section label={span.kind === "root" ? "resource.skills" : "resource.stack"}>
              <div className="flex flex-wrap gap-1">
                {span.stack.map((item) => (
                  <span key={item} className="border border-border bg-bg-2 px-1.5 py-0.5 text-[0.62rem] text-muted">
                    {item}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {span.links && span.links.length > 0 && (
            <Section label="links">
              <div className="flex flex-wrap gap-2">
                {span.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener"
                    className="border border-accent px-2 py-1 text-[0.62rem] uppercase tracking-widest text-accent transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
