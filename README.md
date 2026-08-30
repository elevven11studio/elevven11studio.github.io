# Elevven11 Studio

Marketing site for Elevven11 Studio — simple, affordable websites for
everyday people, freelancers, creators, and small businesses, with no
monthly hosting fee for eligible sites.

Live at [elevven11studio.github.io](https://elevven11studio.github.io/).

## Tech stack

Plain HTML, CSS, and vanilla JavaScript. The site itself has no build step, no
framework and no runtime dependencies — every page is a static file served
directly by GitHub Pages.

`tools/` is the exception: a set of Node scripts that generate the site's
images (previews, social cards, sliders, promos). They run on demand, never at
deploy time, and their output is committed like any other asset. See
[tools/README.md](tools/README.md).

## Structure

```
index.html           Home page
pricing/             Pricing & packages
how-it-works/        Process breakdown
examples/            Template demo gallery (42 standalone demo pages)
agents/              Referral agent program
faq/                 Frequently asked questions
contact/             Contact form + every way to reach the studio
get-started/         Get Started form
thank-you/           Post-submission confirmation (noindex, redirect target)
terms/               Terms of service
privacy/             Privacy policy
404.html             Not-found page
assets/              Stylesheet, favicon, JS, and all site imagery
branding/            Logo, social cards (branding/og/), Facebook/LinkedIn covers
promo/               Social media graphics — NOT deployed, see Deployment
tools/               Image generators — NOT deployed, see tools/README.md
```

All internal links are root-relative (`/pricing/`, `/assets/style.css`, etc.),
since the site is served from the domain root.

The demo pages under `examples/` are deliberately standalone: they don't load
`assets/style.css` or `assets/main.js`, so nothing on the studio's own site
(the floating contact button, the cookie banner) leaks into a client mockup.
They also carry `noindex` — they exist to be shown by direct link, not found in
search — which is why they're absent from `sitemap.xml`.

## Forms and lead capture

Both forms use a split send button. The main half posts straight to
[Web3Forms](https://web3forms.com/), which emails the submission to the studio;
the caret beside it opens WhatsApp and email as alternatives.

| | Default | Behind the caret |
|---|---|---|
| `get-started/` | Send request | WhatsApp, Email |
| `contact/` | Send message | WhatsApp, Email |

A successful direct send redirects to `/thank-you/`. The two handoff routes stay
on the page and show an inline message instead, because those aren't finished —
`wa.me` and `mailto:` only open a composer, and the visitor still has to press
send there. Those routes post to Web3Forms too, so an enquiry is recorded even
if they never follow through.

Details worth knowing before editing `initGetStartedForm` / `initContactForm` in
[assets/main.js](assets/main.js):

- **The forms use two different Web3Forms access keys**, so website requests and
  general enquiries arrive as separate streams. The keys are publishable and
  submit-only; they belong in client-side code.
- **The WhatsApp/email routes must never `await` the post.** `window.open()` has
  to run synchronously inside the click handler or the popup blocker eats the
  tab. Only the direct route awaits it, because there it *is* the delivery.
- **The visitor's name reaches `/thank-you/` via `sessionStorage`, not a query
  string.** A `?name=` would land in GA4 page reports, browser history and
  referrer headers.

## Analytics and consent

Google Analytics (`G-5H0KC31NYJ`) is hardcoded into every page and runs
regardless of the cookie banner — the banner governs only the site's own
form-memory and referral cookies. Google Signals is enabled on the property, so
an ads audience pixel fires too. The banner copy and
[privacy policy](privacy/index.html) both say this explicitly.

If you want Decline to actually cover Google's cookies, the change is Consent
Mode v2 — there's a note recording exactly what that takes above
`initCookieConsent` in [assets/main.js](assets/main.js).

## Local development

No build step is required. Serve the folder with any static file server
and open it in a browser, for example:

```bash
npx serve .
```

Serve from the repo root, not a subfolder — every link and asset path is
root-relative and will 404 otherwise.

## Deployment

Pushing to `main` publishes the site, via
[.github/workflows/static.yml](.github/workflows/static.yml).

The workflow does **not** upload the whole repo. It stages a `_site/` folder
first and excludes what the site never serves:

| Excluded | Why |
|---|---|
| `promo/` | Instagram/WhatsApp graphics, ~30 MB, referenced by no page |
| `assets/slides/singles/` | Individual slide exports for sharing, not used on site |
| `assets/slides/*-all.png` | Combined contact sheets, same |
| `tools/` | Generator scripts, never served |
| `.github/` | The workflow itself |

That takes the published tree from ~45 MB to ~11 MB. Nothing is deleted — the
files stay in the repo, they're just not uploaded.

**Two traps if you add an exclusion.** `assets/slides/` as a whole is *not*
excludable: its numbered subfolders (`agents/`, `contact/`, `faq/`,
`how-it-works/`) are live slider images on those pages. And `branding/` looks
unreferenced to a naive grep because the OG tags point at it by absolute URL
(`https://elevven11studio.github.io/branding/og/home.png`), not by rooted path.
Grep for both forms before excluding anything.

## Contact

elevven11studio@gmail.com

## License

See [LICENSE](LICENSE). All rights reserved.
