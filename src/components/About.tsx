import { aboutParagraphs, operatorProfile } from "../data";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-page px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeader index="01" title="ABOUT" />

      <div className="grid items-start gap-8 md:grid-cols-[1.6fr_1fr] md:gap-12">
        <Reveal>
          <p className="mb-5 font-display text-[clamp(1.2rem,2.6vw,1.6rem)] font-semibold leading-snug text-text">
            Experienced AI backend developer with <span className="text-accent">3.5+ years</span>{" "}
            designing, building, and maintaining robust, scalable server-side systems.
          </p>
          {aboutParagraphs.map((p) => (
            <p key={p.slice(0, 24)} className="mt-4 max-w-[60ch] text-muted">
              {p}
            </p>
          ))}
        </Reveal>

        <Reveal delay={0.1}>
          <aside className="clip-corner relative border border-border bg-surface">
            <span className="absolute left-0 top-0 h-full w-[3px] bg-accent" />
            <div className="border-b border-border px-5 py-3.5 font-mono text-[0.68rem] tracking-widest text-muted">
              // OPERATOR PROFILE
            </div>
            <ul className="px-5 pb-5 pt-2">
              {operatorProfile.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-4 border-b border-dashed border-border py-2.5 text-sm last:border-b-0"
                >
                  <span className="font-mono text-[0.64rem] tracking-widest text-muted">
                    {row.label}
                  </span>
                  <span className={row.accent ? "text-accent" : ""}>{row.value}</span>
                </li>
              ))}
            </ul>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
