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
| `npm run promos` | `promo/*.png` + `promo/demos/` | After changing templates, prices, or the offer |
| `npm run all` | everything | Before a big release |
| `npm run slides` | `assets/slides/` | After editing how-it-works, faq or contact copy |
| `npm run stories` | `promo/stories/` | Same triggers as `promos` |
| `npm run qr` | `assets/qr/` | Rarely — only if a target URL changes |
| `npm run verify-qr` | nothing (read-only check) | After any promo or QR change |

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

### `promos` — square social graphics

Builds 45 promo images at 1080x1080, matching the existing hand-drawn
`promo/*.svg` set:

- `main.png` — the general offer
- `agents.png` — referral programme, gold accent
- `examples.png` — template library, with a real 6-up grid of demo screenshots
- `demos/<slug>.png` — one per demo, each showing that template in a browser
  mockup with its business name, industry and style variant

Business names and industries are read from each demo page's `<title>` and
`<meta name="description">`, so they stay correct automatically. Long names
shrink to fit rather than overflowing.

The demo screenshots come from `assets/previews/`, so **run `npm run previews`
first** if any template changed. The studio ribbon is cropped off the top of each
screenshot (`RIBBON` in the script) so the mockup shows only the template.

Prices are baked in — re-run when they change.

**QR codes.** `main.png` and `agents.png` carry a QR bottom-right, pointing at
the homepage and the agents page respectively. Both are tagged
`utm_medium=qr`, so scans show up separately in GA4 under Acquisition →
Traffic acquisition instead of blending into direct traffic.

They are drawn dark-on-white with a wide quiet zone — an inverted code on the
dark brand background scans far less reliably. They decode down to a 360px
render; below that the UTM string makes the code too dense. That is well past
any realistic use, but if you ever need them scannable smaller, drop the UTM
parameters and the code gets much sparser.

Run `npm run verify-qr` after moving anything on those promos — it decodes the
QR back out of the finished PNG and fails loudly if it broke.

### `slides` — picture sliders

Builds the 28 slider images used on the agents, how-it-works, faq and contact
pages, at 1200x675.

**Three of the four sets are parsed straight out of the live pages** — the
how-it-works steps, the FAQ questions and answers, and the contact channels.
Edit the page copy, re-run this, and the slides follow. They cannot drift from
the text they illustrate. The agents set is authored inside the script, because
the signup journey is a narrative that is not written out step-by-step anywhere
on the page.

Each set also writes a `manifest.json` holding the alt text, which is what the
page markup was generated from. If you add or remove a step, re-run this and
then re-inject the markup, or the slide count and the markup will disagree.

The sliders complement the text sections rather than replacing them — the
original copy stays on the page, so nothing crawlable is lost.

Each set also gets a **combined sheet** at `assets/slides/<set>-all.png` — every
slide in that set laid out in one image, for sharing the whole sequence on
WhatsApp or printing it, rather than sending N separate files. One column for
short sets, two once that would get absurdly tall, capped at 1600px wide.

### `stories` — vertical promos for social

45 story-format promos at 1080x1920 in `promo/stories/` — the vertical
counterpart to the 1080x1080 squares, for WhatsApp Status and Instagram or
Facebook Stories.

Content is kept inside the middle band. Platforms overlay their own UI over
roughly the top and bottom 250px, and WhatsApp Status puts the caption and
reply box down there, so anything placed in those strips gets covered.

`main`, `agents` and `examples` carry a QR tagged `utm_campaign=story-*`, so
story scans are separable from square-promo scans in GA4.

### `qr` — QR codes used on the site

Three standalone 512x512 codes in `assets/qr/`: `site.png`, `agents.png` and
`get-started.png`. The contact page shows the site code; the agents page shows
the agents one. Both offer the PNG as a download.

These are separate from the codes baked into the promo graphics. Because they
are standalone rather than a small element inside a larger image, they stay
scannable far smaller — down to a 120px render, against 360px for the promos.

All are tagged `utm_source=site&utm_medium=qr`, so site QR scans are separable
from promo QR scans (`utm_source=promo`) in GA4.

Note the agents code carries **no referral code**, so it does not attribute a
signup to any agent. That is called out in the page copy — agents sending
customers should use their own `?ref=CODE` link instead.

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
