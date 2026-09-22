# Aniket Charjan — Portfolio

A CS2-themed personal portfolio, built as a single-page app with a fully
swappable theme system.

**Live:** https://aniket-charjan.vercel.app

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS · Framer Motion

---

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

---

## Develop

Requires Node 20+.

```bash
npm install
npm run dev        # dev server → http://localhost:5173
npm run build      # type-check + production bundle → dist/
npm run preview    # serve the production build
npm run typecheck  # tsc, no emit
```

---

## Deploy

It's a static SPA — `npm run build` emits `dist/`. Any of these work:

- **Vercel / Netlify** — import the repo; framework preset auto-detects Vite
  (build `npm run build`, output `dist`). Every push to `main` auto-deploys.
- **Firebase Hosting** — `firebase init hosting` with public dir `dist`, then
  `npm run build && firebase deploy`.
- **GitHub Pages / Cloudflare Pages** — same build command + `dist` output.

---

**[Working on it](docs/CONTRIBUTING.md)** — theming, editing content, the contact
form and the file layout.
