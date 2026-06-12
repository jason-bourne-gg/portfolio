import { education } from "../data";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

export function Training() {
  return (
    <section id="training" className="mx-auto max-w-page px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeader index="05" title="TRAINING" />

      <Reveal>
        <div className="clip-corner grid items-center gap-6 border border-border bg-surface p-8 md:grid-cols-[1.3fr_1fr] md:gap-8">
          <div className="flex items-center gap-5">
            <div className="clip-hex grid h-[72px] w-[72px] shrink-0 place-items-center bg-accent font-display text-xl font-bold tracking-wide text-accent-ink">
              {education.primary.badge}
            </div>
            <div>
              <h3 className="text-[1.35rem]">{education.primary.degree}</h3>
              <p className="my-0.5 font-semibold text-accent">{education.primary.school}</p>
              <p className="font-mono text-[0.72rem] tracking-wide text-muted">{education.primary.meta}</p>
            </div>
          </div>

          <div className="flex flex-col">
            {education.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 border-b border-dashed border-border py-3 text-[0.95rem] last:border-b-0"
              >
                <span>{row.label}</span>
                <span className="font-mono text-[0.72rem] text-muted">{row.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
