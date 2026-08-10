# Elevven11 Studio

Marketing site for Elevven11 Studio — simple, affordable websites for
everyday people, freelancers, creators, and small businesses, with no
monthly hosting fee for eligible sites.

Live at [elevven11studio.github.io](https://elevven11studio.github.io/).

## Tech stack

Plain HTML, CSS, and vanilla JavaScript. No build step, no framework, no
dependencies. Every page is a static file served directly by GitHub Pages.

## Structure

```
index.html          Home page
pricing/             Pricing & packages
how-it-works/        Process breakdown
examples/            Template demo gallery (48 standalone demo pages)
agents/              Referral agent program
faq/                 Frequently asked questions
contact/             Contact page
get-started/         Get Started form (hands off to WhatsApp)
privacy/             Privacy policy
assets/              Shared stylesheet, favicon, and JS (nav, currency, forms)
branding/            Logo and cover assets
promo/               Promotional graphics
```

All internal links are root-relative (`/pricing/`, `/assets/style.css`, etc.),
since the site is served from the domain root.

## Local development

No build step is required. Serve the folder with any static file server
and open it in a browser, for example:

```bash
npx serve .
```

## Deployment

The site is deployed via GitHub Pages directly from this repository's
default branch — pushing to `main` publishes the change.

## Contact

yimaphilemon56@gmail.com

## License

See [LICENSE](LICENSE). All rights reserved.
