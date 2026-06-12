import { MotionConfig } from "framer-motion";
import { useTheme } from "./lib/themes";
import { Crosshair } from "./components/Crosshair";
import { Hud } from "./components/Hud";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Arsenal } from "./components/Arsenal";
import { Timeline } from "./components/Timeline";
import { Operations } from "./components/Operations";
import { Training } from "./components/Training";
import { Contact } from "./components/Contact";

export default function App() {
  const { current, cycleTheme } = useTheme();

  return (
    <MotionConfig reducedMotion="user">
      <div id="top">
        <Crosshair />
        {/* Subtle scanline grain — atmosphere, never blocks interaction */}
        <div className="scanlines pointer-events-none fixed inset-0 z-[9990] opacity-50 mix-blend-multiply" />

        <Hud current={current} onCycleTheme={cycleTheme} />

        <main>
          <Hero />
          <About />
          <Arsenal />
          <Timeline />
          <Operations />
          <Training />
          <Contact />
        </main>
      </div>
    </MotionConfig>
  );
}
