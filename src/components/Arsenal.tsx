import { skills, type Rarity } from "../data";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const rarityText: Record<Rarity, string> = {
  covert: "text-r-covert",
  classified: "text-r-classified",
  restricted: "text-r-restricted",
  milspec: "text-r-milspec",
  industrial: "text-r-industrial",
};

const rarityBorder: Record<Rarity, string> = {
  covert: "rarity-covert",
  classified: "rarity-classified",
  restricted: "rarity-restricted",
  milspec: "rarity-milspec",
  industrial: "rarity-industrial",
};

export function Arsenal() {
  return (
    <section id="arsenal" className="mx-auto max-w-page px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeader index="02" title="ARSENAL" />

      <Reveal>
        <p className="mb-10 max-w-[60ch] text-muted">
          Loadout tiered by mastery — rarity colors borrowed straight from the weapon case.
        </p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((cat, i) => (
          <Reveal key={cat.name} delay={(i % 3) * 0.08}>
            <article className="clip-corner h-full border border-border bg-surface p-5 transition-all duration-300 ease-tactical hover:-translate-y-1 hover:border-border-hi hover:bg-surface-2">
              <header className="mb-4 flex items-center justify-between">
                <h3 className="text-lg">{cat.name}</h3>
                <span
                  className={`border px-1.5 py-0.5 font-mono text-[0.58rem] tracking-widest ${rarityText[cat.rarity]}`}
                  style={{ borderColor: "currentColor" }}
                >
                  {cat.tier}
                </span>
              </header>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className={`border border-border border-l-[3px] bg-surface-2 px-2.5 py-1.5 font-mono text-[0.74rem] text-text transition-transform duration-200 hover:translate-x-0.5 ${rarityBorder[cat.rarity]}`}
                  >
                    {item}
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
