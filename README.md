# Aniket Charjan — Portfolio

A CS2-themed personal portfolio, built as a single-page app with a fully
swappable theme system.

**Live:** https://aniket-charjan.vercel.app

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS · Framer Motion

## Versions

The CS2 site is the site — it owns `/`. Two later experiments live on behind
`/beta` and are not linked from anywhere except the `BETA ↗` button in the
header. Each version is code-split, so visiting `/` never downloads the others.

| Route | What it is |
| ----- | ---------- |
| `/` | **v1**, the CS2-themed site described below. This is production. |
| `/beta` | **v3**, a portfolio you ride through: an isometric 3D road at dusk with a stop for every place I've been. Falls back to a plain page for reduced motion. |
| `/beta/v2` | **v2**, the page that assembles itself as an agent run, every section citing the call that built it. |
| `/trace` | v2's trace explorer, with deep links at `/span/:id`. |

Each version keeps its own stylesheet and loads it only on its own route —
v1's CSS hides the native cursor for the crosshair, which would break the
others. v3's content lives in `src/site/content.ts`, separate from v1's
`src/data.ts`.

## Develop

Requires Node 20+.

```bash
npm install
npm run dev        # dev server → http://localhost:5173
npm run build      # type-check + production bundle → dist/
npm run preview    # serve the production build
npm run typecheck  # tsc, no emit
```

## Theming (the "swappable" part)

Every color is a CSS variable scoped to a `[data-theme]` block in
`src/index.css`. Tailwind tokens (`bg`, `surface`, `accent`, …) read those
variables (see `tailwind.config.ts`), so flipping the `data-theme` attribute on
`<html>` re-skins every component instantly. The choice persists to
`localStorage`. Four themes ship today:

| Theme      | Vibe                       |
| ---------- | -------------------------- |
| `cs2`      | Gunmetal + amber (default) |
| `ember`    | T-side molotov red         |
| `terminal` | Phosphor-green hacker      |
| `arctic`   | Clean light / daytime      |

**Switch:** click the toggle in the top-right (cycles through all themes).

**Add a theme** in two steps:

1. Copy a `[data-theme="..."]` block in `src/index.css` and change the values.
2. Append `{ id: "...", label: "..." }` to `THEMES` in `src/lib/themes.ts`.

The switcher + persistence pick it up automatically.

## Editing content

All copy lives in **`src/data.ts`** — profile, stats, skills (with rarity
tiers), experience, projects, education, and the `contact` object. Components
just render it, so you rarely touch JSX.

- **Contact links** — edit the `contact` object in `src/data.ts`.
- **Project images** — drop files in `public/` and reference them by `/name.png`.

## Contact form

The contact form in `src/components/Contact.tsx` works on any static host with
zero setup: with no endpoint configured it opens the visitor's mail client
pre-filled to your address (`mailto`). To collect submissions silently instead,
set `FORM_ENDPOINT` at the top of that file to a free form endpoint
([Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com)) — the
form will `POST` there automatically.

## Deploy

It's a static SPA — `npm run build` emits `dist/`. Any of these work:

- **Vercel / Netlify** — import the repo; framework preset auto-detects Vite
  (build `npm run build`, output `dist`). Every push to `main` auto-deploys.
- **Firebase Hosting** — `firebase init hosting` with public dir `dist`, then
  `npm run build && firebase deploy`.
- **GitHub Pages / Cloudflare Pages** — same build command + `dist` output.

## Structure

```
.
├── index.html              # Vite entry (#root)
├── src/
│   ├── main.tsx            # routes between the versions, all lazy-loaded
│   ├── App.tsx             # v1 composition
│   ├── index.css           # Tailwind + theme variables + utilities
│   ├── data.ts             # ALL content (edit here)
│   ├── lib/themes.ts       # theme registry + useTheme hook
│   ├── components/         # v1: Hud, Hero, About, Arsenal, Timeline,
│   │                       # Operations, Training, Contact, Crosshair, …
│   ├── v2/                 # the self-assembling page + trace explorer
│   └── site/               # v3: content.ts, the plain page, and world/
│                           # (three.js scene, stations, meshes)
├── public/                 # static assets (images)
├── tailwind.config.ts
└── vite.config.ts
```

---

© Aniket Ravindra Charjan
