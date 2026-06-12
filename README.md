# Aniket Charjan — Portfolio

A CS2-themed personal portfolio. Zero build step — just `index.html`, `styles.css`,
and `script.js`. Vanilla HTML/CSS/JS so it deploys anywhere (Firebase, Vercel,
Netlify, GitHub Pages, Cloudflare Pages) by dropping the folder onto a static host.

![CS2 theme](assets/road-clash.png)

## Run locally

No tooling required. Either open `index.html` directly, or serve it (recommended,
so relative paths and fonts behave like production):

```bash
# Python
python3 -m http.server 8754
# → http://localhost:8754

# or Node
npx serve .
```

## Theming (the "swappable" part)

Every color lives in CSS custom properties scoped to a `[data-theme]` block in
`styles.css`. The theme is set by the `data-theme` attribute on `<html>` and
persisted to `localStorage`. Four themes ship today:

| Theme      | Vibe                          |
| ---------- | ----------------------------- |
| `cs2`      | Gunmetal + amber (default)    |
| `ember`    | T-side molotov red            |
| `terminal` | Phosphor-green hacker         |
| `arctic`   | Clean light / daytime         |

**Switch:** click the toggle in the top-right (cycles through all themes).

**Add a new theme** in two steps:

1. Copy a `[data-theme="..."]` block in `styles.css` and change the values.
2. Add `{ id: "...", label: "..." }` to the `THEMES` array in `script.js`.

That's it — the switcher and persistence pick it up automatically.

## Editing content

- **Text / projects / experience** — all in `index.html`, written as plain
  semantic markup (no templating).
- **Contact links** — edit the single `CONTACT` object at the top of `script.js`.
  Changing a value there updates the displayed text *and* the `href` everywhere.
- **Project images** — drop files in `assets/` and reference them from `index.html`.

## Deploy

The repo is a static site, so any of these work with no config:

- **Firebase Hosting** — `firebase init hosting` (public dir = repo root), then `firebase deploy`.
- **Vercel / Netlify** — import the repo; framework preset "Other", output = root.
- **GitHub Pages** — Settings → Pages → deploy from branch (`/root`).

## Structure

```
.
├── index.html      # all content + markup
├── styles.css      # theme variables + all styling
├── script.js       # theme switch, scroll reveal, count-up, crosshair
└── assets/         # images
```

---

© Aniket Ravindra Charjan
