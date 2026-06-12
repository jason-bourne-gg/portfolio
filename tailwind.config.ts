import type { Config } from "tailwindcss";

/**
 * Theme colors are wired to CSS custom properties (see src/index.css).
 * Swapping [data-theme] on <html> re-skins every utility class instantly.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        "border-hi": "var(--border-hi)",
        text: "var(--text)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-2": "var(--accent-2)",
        "accent-ink": "var(--accent-ink)",
        danger: "var(--danger)",
        // Weapon rarity tiers (static across themes)
        "r-industrial": "#5e98d9",
        "r-milspec": "#4b69ff",
        "r-restricted": "#8847ff",
        "r-classified": "#d32ce6",
        "r-covert": "#eb4b4b",
        "r-gold": "#ffd700",
      },
      fontFamily: {
        display: ['"Oxanium"', "sans-serif"],
        sans: ['"Saira"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      maxWidth: {
        page: "1180px",
      },
      transitionTimingFunction: {
        tactical: "cubic-bezier(.2, .7, .2, 1)",
      },
      keyframes: {
        pulse: {
          "0%": { boxShadow: "0 0 0 0 var(--glow)" },
          "70%": { boxShadow: "0 0 0 8px transparent" },
          "100%": { boxShadow: "0 0 0 0 transparent" },
        },
      },
      animation: {
        "status-pulse": "pulse 2s infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
