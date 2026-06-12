import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Counts from 0 → value when scrolled into view, then appends suffix. */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const isFloat = !Number.isInteger(value);
  const [display, setDisplay] = useState(isFloat ? "0.0" : "0");

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(isFloat ? value.toFixed(1) : String(value));
      return;
    }
    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(isFloat ? v.toFixed(1) : String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, value, isFloat]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
