/* =====================================================================
   V2 SECTIONS
   Each one is the rendered return value of a tool call and carries the
   badge that opens it.
   ===================================================================== */

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  aboutParagraphs,
  contact,
  education,
  experience,
  profile,
  projects,
  skills,
  stats,
  type Project,
} from "../data";
import { IMPACT, sourceOf } from "./agent/impact";
import { Provenance } from "./components/Inspector";
import type { SectionId } from "./agent/tools";

const RARITY_TEXT: Record<string, string> = {
  covert: "text-r-covert",
  classified: "text-r-classified",
  restricted: "text-r-restricted",
  milspec: "text-r-milspec",
  industrial: "text-r-industrial",
};

export function Section({
  id,
  index,
  title,
  children,
}: {
  id: SectionId;
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      className="mx-auto w-full max-w-page px-5 py-12 sm:px-8"
    >
      <div className="mb-7 flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="border border-border px-1.5 py-0.5 font-mono text-[0.6rem] text-accent">
          {index}
        </span>
        <h2 className="font-display text-[clamp(1.1rem,2.4vw,1.5rem)] font-extrabold tracking-wide">
          {title}
        </h2>
        <span className="hidden h-px flex-1 bg-border sm:block" />
        <Provenance id={id} />
      </div>
      {children}
    </motion.section>
  );
}

/* --------------------------------------------------------------- profile */

export function ProfileSection() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      className="mx-auto w-full max-w-page px-5 pb-4 pt-14 sm:px-8 sm:pt-20"
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 border border-border bg-surface px-2.5 py-1 font-mono text-[0.62rem] tracking-widest text-muted">
          <span className="h-1.5 w-1.5 animate-status-pulse bg-accent" aria-hidden />
          {profile.status}
        </span>
        <Provenance id="profile" />
      </div>

      <h1 className="font-display text-[clamp(2.6rem,9vw,5.5rem)] font-extrabold leading-[0.92] tracking-tight">
        {profile.first}
        <br />
        <span className="text-stroke-accent">{profile.last}</span>
      </h1>

      <p className="mt-5 max-w-[58ch] text-[1.02rem] leading-relaxed text-muted">
        <span className="font-mono text-[0.72rem] tracking-widest text-accent">
          [ {profile.role} ]
        </span>{" "}
        {aboutParagraphs[0]}
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dd className="font-display text-[clamp(1.5rem,4vw,2.2rem)] font-extrabold leading-none text-accent">
              {stat.value}
              {stat.suffix}
            </dd>
            <dt className="mt-1.5 font-mono text-[0.58rem] tracking-widest text-muted">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>
    </motion.header>
  );
}

/* ---------------------------------------------------------------- impact */

function MetricRow({ metric }: { metric: (typeof IMPACT)[number] }) {
  const [open, setOpen] = useState(false);
  const source = sourceOf(metric);

  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[0.72rem] text-muted">{metric.label}</span>
        <span className="ml-auto flex items-baseline gap-2 font-mono text-[0.72rem]">
          {metric.from && <span className="text-muted line-through opacity-60">{metric.from}</span>}
          <span aria-hidden className="text-muted">
            →
          </span>
          <span className="font-display text-[1.35rem] font-extrabold leading-none text-accent">
            {metric.to}
          </span>
        </span>
      </div>

      <div className="mt-2.5 h-[6px] w-full bg-bg-2">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: metric.weight }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
          style={{ transformOrigin: "left" }}
          className="h-full bg-accent"
        />
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-2 font-mono text-[0.6rem] text-muted transition-colors hover:text-accent"
      >
        {open ? "▾" : "▸"} sourced from {source.org}
      </button>

      {open && (
        <blockquote className="mt-2 border-l-2 border-accent/60 bg-bg-2/60 py-2 pl-3 text-[0.72rem] leading-relaxed text-muted">
          {source.text}
        </blockquote>
      )}
    </div>
  );
}

export function ImpactSection() {
  return (
    <Section id="impact" index="01" title="IMPACT">
      <p className="mb-5 max-w-[60ch] text-[0.92rem] text-muted">
        Every figure below is read from a line in the deployment log, and says which one.
      </p>
      <div className="border border-border bg-surface px-5">
        {IMPACT.map((metric) => (
          <MetricRow key={metric.id} metric={metric} />
        ))}
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------- deployments */

export function DeploymentsSection() {
  return (
    <Section id="deployments" index="02" title="DEPLOYMENTS">
      <div className="space-y-4">
        {experience.map((role) => (
          <article
            key={`${role.org}-${role.date}`}
            className="clip-corner border border-border bg-surface p-6 transition-colors duration-300 hover:border-border-hi"
          >
            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-display text-[1.05rem] font-bold">{role.role}</h3>
              <span className="text-accent">·</span>
              <span className="text-[0.92rem] text-muted">{role.org}</span>
              <span className="ml-auto font-mono text-[0.62rem] tracking-widest text-muted">
                {role.date}
              </span>
            </div>

            <ul className="mb-5 space-y-2.5">
              {role.points.map((point, i) => (
                <li key={i} className="flex gap-2.5 text-[0.9rem] leading-relaxed text-muted">
                  <span className="shrink-0 text-accent">·</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-1.5">
              {role.stack.map((tech) => (
                <span
                  key={tech}
                  className="border border-border bg-bg-2 px-2 py-1 font-mono text-[0.64rem] text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
          </article>
        ))}

        <article className="clip-corner border border-border bg-surface p-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-display text-[1.05rem] font-bold">{education.primary.degree}</h3>
            <span className="text-accent">·</span>
            <span className="text-[0.92rem] text-muted">{education.primary.school}</span>
            <span className="ml-auto font-mono text-[0.62rem] tracking-widest text-muted">
              {education.primary.meta}
            </span>
          </div>
        </article>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- builds */

function BuildCard({ project, featured }: { project: Project; featured: boolean }) {
  return (
    <article
      className={`clip-corner group flex flex-col overflow-hidden border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-border-hi ${
        featured ? "sm:col-span-2" : ""
      }`}
    >
      {project.media && (
        <div className="relative overflow-hidden border-b border-border bg-bg-2">
          <img
            src={project.media}
            alt={`${project.title} — preview`}
            loading="lazy"
            width={1400}
            height={719}
            className={`block w-full ${
              project.mediaFit === "contain" ? "object-contain" : "max-h-[220px] object-cover"
            }`}
          />
          {project.mediaTag && (
            <span className="absolute bottom-3 left-3 border border-accent bg-bg/70 px-2 py-1 font-mono text-[0.58rem] tracking-widest text-accent backdrop-blur-sm">
              {project.mediaTag}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 font-mono text-[0.6rem] tracking-widest text-accent">
          {project.kicker}
        </span>
        <h3 className="mb-3 flex flex-wrap items-center gap-2 font-display text-[1.05rem] font-bold">
          {project.title}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener"
              className="border border-accent px-1.5 py-0.5 font-mono text-[0.56rem] tracking-widest text-accent"
            >
              LIVE ↗
            </a>
          )}
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener"
              aria-label={`${project.title} repository`}
              className="border border-border px-1.5 py-0.5 font-mono text-[0.56rem] text-muted transition-colors hover:border-accent hover:text-accent"
            >
              ↗
            </a>
          )}
        </h3>

        <p className="mb-4 text-[0.88rem] leading-relaxed text-muted">{project.desc}</p>

        {project.note && (
          <p className="mb-4 border-l-2 border-accent/60 bg-bg-2/60 py-1.5 pl-3 font-mono text-[0.66rem] leading-relaxed text-muted">
            <span className="mr-1.5 font-bold tracking-widest text-accent">NOTE</span>
            {project.note}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="border border-border bg-bg-2 px-1.5 py-0.5 font-mono text-[0.6rem] text-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function BuildsSection() {
  return (
    <Section id="builds" index="03" title="BUILDS">
      <p className="mb-5 max-w-[60ch] text-[0.92rem] text-muted">
        Shipped outside the day job.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project, i) => (
          <BuildCard key={project.title} project={project} featured={i === 0} />
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- arsenal */

export function ArsenalSection() {
  return (
    <Section id="arsenal" index="04" title="TOOLCHAIN">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((group) => (
          <div key={group.name} className="border border-border bg-surface p-5">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="font-display text-[0.95rem] font-bold">{group.name}</h3>
              <span
                className={`font-mono text-[0.55rem] tracking-widest ${
                  RARITY_TEXT[group.rarity] ?? "text-muted"
                }`}
              >
                {group.tier}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="border border-border bg-bg-2 px-2 py-1 font-mono text-[0.64rem] text-muted"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- contact */

export function ContactSection() {
  const links = [
    { label: "email", value: contact.email, href: `mailto:${contact.email}` },
    { label: "github", value: contact.github.label, href: contact.github.url },
    { label: "linkedin", value: contact.linkedin.label, href: contact.linkedin.url },
    { label: "phone", value: contact.phone.display, href: `tel:${contact.phone.e164}` },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-page px-5 pb-20 pt-8 sm:px-8"
    >
      <div className="border border-border bg-surface p-6 sm:p-8">
        <h2 className="mb-1 font-display text-[clamp(1.3rem,3vw,1.9rem)] font-extrabold">
          Open to interesting problems.
        </h2>
        <p className="mb-6 text-[0.92rem] text-muted">{profile.location}</p>

        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener"
              className="group flex items-baseline gap-3 border-b border-border py-2 font-mono text-[0.8rem] transition-colors hover:border-accent"
            >
              <span className="w-16 shrink-0 text-[0.6rem] uppercase tracking-widest text-muted">
                {link.label}
              </span>
              <span className="truncate text-text transition-colors group-hover:text-accent">
                {link.value}
              </span>
              <span className="ml-auto text-muted transition-colors group-hover:text-accent">↗</span>
            </a>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
