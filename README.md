# Aniket Charjan — Portfolio

A CS2-themed personal portfolio, built as a single-page app with a fully
swappable theme system.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS · Framer Motion

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
│   ├── main.tsx            # React bootstrap
│   ├── App.tsx             # composition
│   ├── index.css           # Tailwind + theme variables + utilities
│   ├── data.ts             # ALL content (edit here)
│   ├── lib/themes.ts       # theme registry + useTheme hook
│   └── components/         # Hud, Hero, About, Arsenal, Timeline,
│                           # Operations, Training, Contact, Crosshair, …
├── public/                 # static assets (images)
├── tailwind.config.ts
└── vite.config.ts
```

---

© Aniket Ravindra Charjan
