import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const SIZE = 22;
const INTERACTIVE = "a, button, input, textarea, [data-interactive]";

/** A CS2-style crosshair that replaces the cursor on fine-pointer devices. */
export function Crosshair() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.3 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX - SIZE / 2);
      y.set(e.clientY - SIZE / 2);
    };
    const over = (e: Event) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE)) setActive(true);
    };
    const out = (e: Event) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE)) setActive(false);
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy, width: SIZE, height: SIZE }}
      className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
    >
      <motion.div
        className="relative h-full w-full"
        animate={{ scale: active ? 1.5 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <span className="absolute left-1/2 top-0 h-[7px] w-[2px] -translate-x-1/2 bg-accent" />
        <span className="absolute bottom-0 left-1/2 h-[7px] w-[2px] -translate-x-1/2 bg-accent" />
        <span className="absolute left-0 top-1/2 h-[2px] w-[7px] -translate-y-1/2 bg-accent" />
        <span className="absolute right-0 top-1/2 h-[2px] w-[7px] -translate-y-1/2 bg-accent" />
        <span className="absolute left-1/2 top-1/2 h-[2px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-accent" />
      </motion.div>
    </motion.div>
  );
}
