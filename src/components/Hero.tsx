import { motion } from "framer-motion";
import { profile, stats } from "../data";
import { CountUp } from "./CountUp";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function Hero() {
  return (
    <section
      id="hero"
      className="relative mx-auto flex min-h-svh max-w-page items-center overflow-hidden px-5 pb-14 pt-24 sm:px-8"
    >
      <div className="grid-bg pointer-events-none absolute -inset-0.5 -z-10" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-[900px]"
      >
        <motion.div
          variants={item}
          className="mb-7 inline-flex items-center gap-2.5 border border-border bg-surface px-3 py-1.5 text-[0.72rem] tracking-widest text-muted"
        >
          <span className="h-2 w-2 animate-status-pulse rounded-full bg-accent" />
          <span className="font-mono">STATUS: {profile.status}</span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mb-5 font-display text-[clamp(3rem,12vw,7.5rem)] font-extrabold uppercase leading-[1.05] tracking-tight"
        >
          <span className="block">{profile.first}</span>
          <span className="text-stroke-accent block">{profile.last}</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mb-8 max-w-[52ch] text-[clamp(1.05rem,2.4vw,1.35rem)] leading-relaxed text-muted"
        >
          <span className="mr-1.5 font-mono text-[0.8em] tracking-wide text-accent">
            [ {profile.role} ]
          </span>
          Backend engineer building{" "}
          <strong className="font-semibold text-text">autonomous agents</strong>, LLM/SLM
          systems, and scalable infrastructure.
        </motion.p>

        <motion.div variants={item} className="mb-11 flex flex-wrap gap-4">
          <a
            href="#operations"
            className="clip-corner glow-shadow group inline-flex items-center gap-2.5 bg-accent px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-accent-ink transition-transform duration-200 ease-tactical hover:-translate-y-0.5"
          >
            <span>View Operations</span>
            <span className="transition-transform duration-200 ease-tactical group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#contact"
            className="clip-corner inline-flex items-center border border-border-hi px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-text transition-all duration-200 ease-tactical hover:-translate-y-0.5 hover:border-accent hover:text-accent"
          >
            Establish Contact
          </a>
        </motion.div>

        {/* Scoreboard */}
        <motion.div
          variants={item}
          className="flex max-w-[720px] flex-wrap items-center gap-x-6 gap-y-4 border-y border-border py-5 sm:gap-x-10"
        >
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-6 sm:gap-10">
              {i > 0 && <span className="hidden h-9 w-px bg-border-hi sm:block" />}
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold leading-none text-text">
                  <CountUp value={s.value} suffix={s.suffix} />
                </span>
                <span className="font-mono text-[0.65rem] tracking-widest text-muted">
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 right-5 hidden flex-col items-center gap-2.5 font-mono text-[0.62rem] tracking-[0.2em] text-muted [writing-mode:vertical-rl] sm:right-8 lg:flex">
        <span>SCROLL</span>
        <span className="h-12 w-px bg-gradient-to-b from-accent to-transparent" />
      </div>
    </section>
  );
}
