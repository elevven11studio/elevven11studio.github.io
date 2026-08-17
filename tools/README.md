# Asset generators

Scripts that rebuild the site's generated images. Nothing here is deployed — it
only writes files into `assets/` and `branding/`.

## Setup

```bash
cd tools
npm install
```

Only dependency is `sharp`. `generate-previews.js` also needs Chrome or Edge
installed; it finds them at the usual paths and falls over with a clear message
if it can't.

## Commands

| Command | Rebuilds | When to run it |
|---|---|---|
| `npm run previews` | `assets/previews/` | After changing any template under `examples/` |
| `npm run og-cards` | `branding/og/` | After changing page copy or prices |
| `npm run covers` | `branding/cover-*.png` | After changing the tagline or headline stats |
| `npm run all` | everything | Before a big release |

## What each one does

### `previews` — demo preview images

Screenshots every folder under `examples/` with headless Chrome and writes two
files per demo:

- `<slug>.webp` (800×420) — the card thumbnail on the examples page
- `<slug>-og.jpg` (1200×630) — that demo's `og:image`

It starts its own throwaway static server, so no dev server is required.

**Run this after editing a template.** Otherwise the preview keeps advertising a
design that no longer exists — this is the one that goes stale silently.

JPEG for the `og:image` is deliberate: Facebook's crawler handles WebP, LinkedIn
only commits to JPG/PNG/GIF.

### `og-cards` — per-page social cards

Builds the nine 1200×630 cards in `branding/og/`, one per main page, from the
brand tokens in `assets/style.css`. Page copy lives in the `PAGES` map at the
bottom of the script — edit it there, not in the SVG.

Prices are baked into the card pills, so **re-run this whenever prices change**
or the cards will quote the old figures.

The `<meta>` tags already point at these filenames, so re-running is enough. Only
edit HTML if you add a new page.

### `covers` — Facebook and LinkedIn covers

Builds `cover-facebook.png` (1640×624) and `cover-linkedin.png` (1128×376), both
rendering the site inside a browser mockup.

Two layout constraints are baked in and worth preserving if you edit them:

- **Facebook centre-crops on mobile.** Text sits inside the band that survives
  the crop.
- **LinkedIn overlays the company logo bottom-left.** That corner is empty on
  purpose.

Each also writes a matching `.svg` next to the PNG if you want to hand-edit.

## After running

Check the diff before committing — these overwrite files in place. The demo
count on the covers (`42 live demos`, `14 industries`) is hardcoded in
`generate-covers.js`; update it there if you add templates.
