import { Reveal } from "./Reveal";

export function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <Reveal className="mb-11 flex items-center gap-4">
      <span className="border border-border-hi px-2 py-1 font-mono text-xs tracking-widest text-accent">
        {index}
      </span>
      <h2 className="text-[clamp(1.6rem,4.5vw,2.6rem)] uppercase tracking-wide">{title}</h2>
      <span className="h-px flex-1 bg-gradient-to-r from-border-hi to-transparent" />
    </Reveal>
  );
}
