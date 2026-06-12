import { experience } from "../data";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

export function Timeline() {
  return (
    <section id="experience" className="mx-auto max-w-page px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeader index="03" title="DEPLOYMENT LOG" />

      <div className="relative pl-9">
        <span className="absolute bottom-2 left-1.5 top-2 w-0.5 bg-gradient-to-b from-accent via-border to-border" />

        {experience.map((job, i) => (
          <Reveal key={job.role + job.date} delay={(i % 3) * 0.08} className="group relative mb-6">
            <span className="absolute -left-[2.05rem] top-1.5 grid h-3.5 w-3.5 place-items-center">
              <span className="h-3.5 w-3.5 rotate-45 border-2 border-accent bg-bg transition-colors duration-300 group-hover:bg-accent" />
            </span>

            <article className="clip-corner border border-border bg-surface p-6 transition-all duration-300 ease-tactical group-hover:translate-x-1 group-hover:border-border-hi">
              <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                <h3 className="text-xl sm:text-[1.3rem]">{job.role}</h3>
                <span className="font-mono text-[0.72rem] tracking-wider text-muted">{job.date}</span>
              </div>
              <p className="my-1 mb-4 font-semibold tracking-wide text-accent">{job.org}</p>

              <ul className="mb-5 flex flex-col gap-2.5">
                {job.points.map((pt) => (
                  <li key={pt.slice(0, 28)} className="relative pl-5 text-[0.96rem] leading-relaxed text-muted">
                    <span className="absolute left-0 top-0 text-accent">▸</span>
                    {pt}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5">
                {job.stack.map((tech) => (
                  <span
                    key={tech}
                    className="border border-border bg-bg-2 px-2 py-1 font-mono text-[0.68rem] text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
