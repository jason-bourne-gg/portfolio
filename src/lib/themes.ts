import { useCallback, useEffect, useState } from "react";

export type ThemeId = "cs2" | "ember" | "terminal" | "arctic";

export interface Theme {
  id: ThemeId;
  label: string;
}

/**
 * Registered themes. To add one: define a [data-theme="x"] block in
 * src/index.css, then append an entry here. The switcher + persistence
 * pick it up automatically.
 */
export const THEMES: Theme[] = [
  { id: "cs2", label: "CS2" },
  { id: "ember", label: "EMBER" },
  { id: "terminal", label: "TERMINAL" },
  { id: "arctic", label: "ARCTIC" },
];

const STORAGE_KEY = "portfolio-theme";

function readStored(): ThemeId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved && THEMES.some((t) => t.id === saved)) return saved;
  } catch {
    /* ignore */
  }
  return "cs2";
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(readStored);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((current) => {
      const idx = THEMES.findIndex((t) => t.id === current);
      return THEMES[(idx + 1) % THEMES.length].id;
    });
  }, []);

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return { theme, current, setTheme, cycleTheme };
}
