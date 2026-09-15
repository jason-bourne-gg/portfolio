import { lazy, Suspense, useEffect, useState } from "react";
import { Rail } from "./components/Rail";
import { About, Contact, Intro, Projects, Toolkit, Work } from "./components/sections";
// three.js is the heaviest thing here, so it only loads if you take the ride.
const World = lazy(() => import("./world/World"));
import "./site.css";

type Mode = "world" | "read";

/**
 * Two ways through the same content: the ride, and the plain page. The page
 * is the fallback for anyone who has asked their system to reduce motion, and
 * it's one button away at all times.
 */
/** The beta's typefaces aren't in index.html, which belongs to v1. */
function useBetaFonts() {
  useEffect(() => {
    const href =
      "https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500&f[]=switzer@400,500,600&display=swap";
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, []);
}

export default function App() {
  useBetaFonts();

  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem("mode");
    if (saved === "world" || saved === "read") return saved;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "read" : "world";
  });

  useEffect(() => {
    document.title = "Aniket Charjan — the ride (beta)";
    localStorage.setItem("mode", mode);
    document.body.classList.toggle("site", mode === "read");
    document.body.classList.toggle("world-on", mode === "world");
    window.scrollTo(0, 0);
  }, [mode]);

  if (mode === "world") {
    return (
      <Suspense fallback={<div className="world-loading">Warming up the bike…</div>}>
        <World onRead={() => setMode("read")} />
      </Suspense>
    );
  }

  return (
    <>
      <a className="skip" href="#intro">
        Skip to content
      </a>
      <Rail onRide={() => setMode("world")} />
      <main className="main" id="content">
        <Intro />
        <About />
        <Work />
        <Projects />
        <Toolkit />
        <Contact />
      </main>
    </>
  );
}
