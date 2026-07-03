import type { MouseEvent } from "react";
import { projects, type Project } from "../data";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

function trackGlow(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
  e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
}

const Glow = () => (
  <div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-50 bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,0%),var(--glow),transparent_55%)]" />
);

const Rank = ({ rank }: { rank: string }) => (
  <div className="clip-badge grid h-[54px] w-[54px] shrink-0 place-items-center border border-accent font-mono text-2xl font-bold text-accent">
    {rank}
  </div>
);

const Stack = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((t) => (
      <span key={t} className="border border-border bg-bg-2 px-2 py-1 font-mono text-[0.68rem] text-muted">
        {t}
      </span>
    ))}
  </div>
);

const RepoLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener"
    aria-label={label}
    title={label}
    className="inline-grid h-6 w-6 place-items-center border border-border text-sm text-muted transition-all duration-200 hover:-translate-y-0.5 hover:translate-x-0.5 hover:border-accent hover:text-accent"
  >
    ↗
  </a>
);

const LiveLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener"
    aria-label={label}
    title={label}
    className="inline-flex items-center gap-1 border border-accent bg-bg-2 px-2 py-0.5 font-mono text-[0.62rem] font-bold tracking-widest text-accent transition-all duration-200 hover:-translate-y-0.5 hover:translate-x-0.5"
  >
    LIVE ↗
  </a>
);

function FeatureCard({ p }: { p: Project }) {
  return (
    <article
      onMouseMove={trackGlow}
      className="clip-corner group relative col-span-full flex gap-5 overflow-hidden border border-border bg-surface p-6 transition-all duration-300 ease-tactical hover:-translate-y-1 hover:border-border-hi"
    >
      <Glow />
      <Rank rank={p.rank} />
      <div className="relative z-10">
        <span className="mb-2 block font-mono text-[0.66rem] tracking-widest text-accent">{p.kicker}</span>
        <h3 className="mb-3 flex flex-wrap items-center gap-2 text-[clamp(1.2rem,2.4vw,1.6rem)]">
          {p.title}
          {p.live && <LiveLink href={p.live} label={`Open ${p.title} live`} />}
          {p.repo && <RepoLink href={p.repo} label={`${p.title} repository`} />}
        </h3>
        <p className="mb-4 max-w-[64ch] text-[0.96rem] text-muted">{p.desc}</p>
        {p.metrics && (
          <div className="mb-5 flex gap-7">
            {p.metrics.map((m) => (
              <div key={m.label} className="flex flex-col">
                <span className="font-display text-2xl font-extrabold leading-none text-accent">{m.num}</span>
                <span className="mt-1 font-mono text-[0.62rem] tracking-widest text-muted">{m.label}</span>
              </div>
            ))}
          </div>
        )}
        <Stack items={p.stack} />
      </div>
    </article>
  );
}

function MediaCard({ p }: { p: Project }) {
  return (
    <article
      onMouseMove={trackGlow}
      className="clip-corner group relative col-span-full flex flex-col overflow-hidden border border-border bg-surface transition-all duration-300 ease-tactical hover:-translate-y-1 hover:border-border-hi md:flex-row"
    >
      <div className="relative overflow-hidden border-b border-border md:w-[46%] md:border-b-0 md:border-r">
        <img
          src={p.media}
          alt={`${p.title} — gameplay`}
          loading="lazy"
          width={1200}
          height={703}
          className="h-full max-h-[260px] w-full object-cover transition-transform duration-500 ease-tactical group-hover:scale-105 md:max-h-none"
        />
        {p.mediaTag && (
          <span className="absolute left-3 top-3 border border-accent bg-bg/70 px-2 py-1 font-mono text-[0.6rem] tracking-widest text-accent backdrop-blur-sm">
            {p.mediaTag}
          </span>
        )}
      </div>
      <div className="relative z-10 self-center p-6">
        <span className="mb-2 block font-mono text-[0.66rem] tracking-widest text-accent">{p.kicker}</span>
        <h3 className="mb-3 flex flex-wrap items-center gap-2 text-[clamp(1.2rem,2.4vw,1.6rem)]">
          {p.title}
          {p.live && <LiveLink href={p.live} label={`Open ${p.title} live`} />}
          {p.repo && <RepoLink href={p.repo} label={`${p.title} repository`} />}
        </h3>
        <p className="mb-4 max-w-[64ch] text-[0.96rem] text-muted">{p.desc}</p>
        <Stack items={p.stack} />
      </div>
    </article>
  );
}

function DefaultCard({ p }: { p: Project }) {
  return (
    <article
      onMouseMove={trackGlow}
      className="clip-corner group relative flex gap-5 overflow-hidden border border-border bg-surface p-6 transition-all duration-300 ease-tactical hover:-translate-y-1 hover:border-border-hi"
    >
      <Glow />
      <Rank rank={p.rank} />
      <div className="relative z-10">
        <span className="mb-2 block font-mono text-[0.66rem] tracking-widest text-accent">{p.kicker}</span>
        <h3 className="mb-3 flex flex-wrap items-center gap-2 text-[clamp(1.2rem,2.4vw,1.6rem)]">
          {p.title}
          {p.live && <LiveLink href={p.live} label={`Open ${p.title} live`} />}
          {p.repo && <RepoLink href={p.repo} label={`${p.title} repository`} />}
        </h3>
        <p className="mb-4 max-w-[64ch] text-[0.96rem] text-muted">{p.desc}</p>
        <Stack items={p.stack} />
      </div>
    </article>
  );
}

export function Operations() {
  return (
    <section id="operations" className="mx-auto max-w-page px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeader index="04" title="OPERATIONS" />

      <Reveal>
        <p className="mb-10 max-w-[60ch] text-muted">
          Personal builds, shipped outside the day job. Day-job work lives in the{" "}
          <a href="#experience" className="text-accent">Deployment Log</a>.
        </p>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.title} delay={(i % 2) * 0.08} className={p.variant === "default" ? "" : "col-span-full"}>
            {p.variant === "feature" && <FeatureCard p={p} />}
            {p.variant === "media" && <MediaCard p={p} />}
            {p.variant === "default" && <DefaultCard p={p} />}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
