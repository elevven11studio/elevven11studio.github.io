---
title: "How to Check What a Website Is Built With"
description: "Simple ways to tell whether a site runs on WordPress, Shopify, Wix or a framework, using only your browser, plus what the clues really mean."
date: 2026-11-23
url: https://elevven11studio.github.io/blog/how-to-check-what-a-website-is-built-with/
publisher: Elevven11 Studio
---

# How to Check What a Website Is Built With

Simple ways to tell whether a site runs on WordPress, Shopify, Wix or a framework, using only your browser, plus what the clues really mean.

You see a website you like and want to know how it was made. Maybe you are about to hire a developer and want to compare their work, or a competitor's shop runs smoothly and you wonder what platform they use. Or you paid for a site and want to confirm it is what you were promised.

You do not need special access to find out. Most of the answer is sitting in the page your browser already downloaded.

## Start with the page source

In Chrome, press `Ctrl+U` on any page to open its source code in a new tab. Then press `Ctrl+F` and search for these clues:

| Search for | It usually means |
|---|---|
| `wp-content` or `wp-includes` | WordPress |
| `cdn.shopify.com` | Shopify |
| `woocommerce` | WooCommerce, a store on WordPress |
| `wixstatic` or `wix.com` | Wix |
| `squarespace` | Squarespace |
| `_next/` | Next.js, a React framework |
| `__nuxt` | Nuxt, a Vue framework |
| `bootstrap` | The Bootstrap CSS framework |

Also look near the top for a line like `<meta name="generator" content="...">`. Many site builders add it, and it often names the platform and version.

## Look at the footer and the address

Some clues need no code at all:

- A "Powered by" line in the footer.
- An address ending in `.wixsite.com`, `.myshopify.com` or `.github.io`.
- A login page at `/wp-admin/`, which is WordPress.

## Use DevTools for more

Press `F12` to open Chrome DevTools and go to the **Network** tab, then reload the page. You will see every file the page loads. File names and the servers they come from tell you about analytics tools, payment providers, fonts and hosting. Clicking the main page request and reading its response headers can show the server or hosting company.

This is more detail than most people need, but it is free and it is all there.

## Why the answer is often "probably"

Detection is guesswork based on evidence. A developer can remove the generator tag, rename folders or put a site behind a service that hides its server. Some clues are shared by several tools. So treat each finding as likely rather than certain, and trust it more when several clues agree.

Also remember that the technology is only part of the story. A plain static site can be faster and cheaper to run than a heavy platform. If you are comparing quotes, see [what a website really costs](https://elevven11studio.github.io/blog/how-much-does-a-website-cost-in-nigeria/).

## Doing it in one click with WebInspect

Checking source code by hand works, but it is slow if you want the full picture. That is why we made [WebInspect](https://elevven11studio.github.io/webinspect/), a free Chrome extension. Open a site and press `Ctrl+Shift+U`, click the toolbar button, or right-click the page, and you get a report in eight sections.

The **Technology** section covers frameworks, CMS, ecommerce platforms, CSS frameworks, JavaScript libraries, analytics, payment providers, infrastructure and fonts. Each one is rated detected, likely or possible, rather than stated as fact, for the reason given above.

The rest of the report goes beyond technology:

- **SEO:** title, meta description, heading outline, canonical, Open Graph tags and structured data.
- **Accessibility:** alt text, form labels, colour contrast and more. Results are described as what automated checks found, never as compliance.
- **Performance and mobile:** resource sizes, render-blocking scripts, viewport, small text and touch targets.
- **Security configuration:** HTTPS, mixed content and form targets.

Every finding shows the evidence behind it, and you can highlight it on the page or export the report as JSON or CSV. If a check could not run, WebInspect says so and leaves it out of the score instead of counting it against the site.

It runs in your browser with no account and no servers, so nothing you inspect is uploaded. It also skips pages that routinely hold personal information, such as webmail and banking, unless you ask it to inspect one once.

## What to do with the answer

Knowing the platform helps you ask better questions. If a developer quotes you for a "custom build", you can check whether their past work is custom or a template. If your own site loads slowly, the report shows where the weight is. And if you are planning a new site, looking at what similar businesses use is a sensible place to start.

---

Published 23 Nov 2026 by Elevven11 Studio. Read online: https://elevven11studio.github.io/blog/how-to-check-what-a-website-is-built-with/
