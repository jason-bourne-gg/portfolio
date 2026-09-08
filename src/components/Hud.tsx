import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { type MouseEvent, useEffect, useState } from "react";
import { nav, profile } from "../data";
import type { Theme } from "../lib/themes";

export function Hud({
  current,
  onCycleTheme,
}: {
  current: Theme;
  onCycleTheme: () => void;
}) {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const { scrollY } = useScroll();

  // Hide HUD when scrolling down past the hero; reveal on scroll up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240 && !menuOpen);
  });

  // Track which section is in view to highlight the nav.
  useEffect(() => {
    const ids = nav.map((n) => n.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Navigate to a section. We can't rely on the browser's native anchor scroll
  // here: closing the mobile menu in the same click re-renders this component,
  // and that re-render cancels the in-flight (async, multi-frame) smooth scroll —
  // so the URL updates but the page never moves. Instead we close the menu first,
  // then scroll on the next paint, once the re-render has settled. behavior is
  // left to the CSS `scroll-behavior` (smooth, or auto under prefers-reduced-motion).
  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = document.getElementById(href.slice(1));
    if (!target) return; // unknown anchor — let the browser handle it natively
    e.preventDefault();
    setMenuOpen(false);
    // Update the address bar without triggering the browser's own (cancellable)
    // scroll-to-fragment; we do the scrolling ourselves below.
    history.pushState(null, "", href);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => target.scrollIntoView())
    );
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      className="fixed inset-x-0 top-0 z-[100] border-b border-border bg-bg/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-page items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <a href="#top" className="flex items-center gap-2 font-display text-base font-extrabold tracking-wide">
          <span className="-translate-y-px text-accent">▰</span>
          <span>
            {profile.first}
            <span className="font-semibold text-accent">.{profile.last}</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {nav.map((n) => {
            const isActive = activeId === n.href.slice(1);
            return (
              <a
                key={n.href}
                href={n.href}
                onClick={(e) => handleNavClick(e, n.href)}
                className={`group relative font-mono text-xs tracking-wider transition-colors ${
                  isActive ? "text-text" : "text-muted hover:text-text"
                }`}
              >
                {n.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-0.5 bg-accent transition-all duration-300 ease-tactical ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* v1 lives at /classic; this is the way back to the trace explorer. */}
          <a
            href="/"
            title="Trace explorer (v2)"
            className="clip-corner-sm hidden items-center gap-2 border border-border-hi bg-surface px-3 py-2 font-mono text-[0.72rem] tracking-widest text-muted transition-colors hover:border-accent hover:text-accent sm:inline-flex"
          >
            V2 ↗
          </a>

          <button
            onClick={onCycleTheme}
            aria-label={`Switch theme (current: ${current.label})`}
            title="Switch theme"
            className="clip-corner-sm group inline-flex items-center gap-2 border border-border-hi bg-surface px-3 py-2 font-mono text-[0.72rem] tracking-widest text-text transition-colors hover:border-accent hover:text-accent"
          >
            <span className="text-accent transition-transform duration-500 ease-tactical group-hover:rotate-180">
              ◈
            </span>
            <span>{current.label}</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="clip-corner-sm flex h-9 w-9 items-center justify-center border border-border-hi bg-surface text-text md:hidden"
          >
            <div className="flex flex-col items-center justify-center gap-[5px]">
              <span className={`block h-0.5 w-4 bg-current transition-transform ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-0.5 w-4 bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-4 bg-current transition-transform ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden border-t border-border bg-bg/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col px-5 py-2">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={(e) => handleNavClick(e, n.href)}
                  className="border-b border-border py-3.5 font-mono text-sm tracking-wider text-muted last:border-b-0 active:text-accent"
                >
                  {n.label}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
