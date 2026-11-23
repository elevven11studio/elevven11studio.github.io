---
title: How to Check a Website's SEO Basics in Plain Language
description: Check the title, meta description, headings, canonical, mobile setup, sitemap and robots.txt on any website, with no jargon and no paid tools.
date: 2026-11-23
product: webinspect
---
SEO, search engine optimisation, sounds technical, but the basics are simple. They are a handful of labels and settings that help Google understand what a page is about and show it properly in results. If any of them are missing or wrong, good content can sit unseen.

You can check all of them yourself in a few minutes. This is worth doing on a new website before you pay the final invoice, and on an old one once a year.

## The page title

The title is the blue clickable line in Google results and the text on the browser tab. Every page should have its own.

To see it, press `Ctrl+U` to open the page source and search for `<title>`. Check that:

- It describes the page, not just the business name. "Barber in Wuse 2, Abuja | Sharp Cuts" beats "Home".
- Each page has a different title. Ten pages all called "Welcome" compete with each other.
- The important words come first. Google shortens long titles, so the end may be cut off.

## The meta description

This is the short summary that often appears under the title in results. Search the source for `name="description"`.

It does not directly lift your ranking, but it decides whether people click. Write one or two plain sentences that say what the page offers and who it is for. If it is missing, Google picks text from the page, which may be a cookie notice or a menu.

## Headings

Headings give a page its outline. There should be one main heading, the `h1`, that says what the page is about, followed by `h2` and `h3` headings for sections.

Common problems are no `h1` at all, several `h1` headings, or headings used just to make text big. Search the source for `<h1` to count them. A clear outline helps search engines and also helps people who skim, which is most people.

## The canonical tag

Sometimes the same page can be reached at several addresses, such as with and without `www`, or with tracking codes added. The canonical tag tells search engines which address is the main one. Search the source for `rel="canonical"`.

It should point to the page's own preferred address. A canonical that points to the home page from every page, which happens with some templates, tells Google to ignore the rest of the site.

## Mobile readiness

Most people will find you on a phone, and Google mainly looks at the mobile version of a page. Search the source for `name="viewport"`. Without it, phones show a shrunken desktop page.

Then open the site on your phone and check that text is readable without zooming, buttons are easy to tap, and nothing spills off the side of the screen.

## Sitemap and robots.txt

Type your domain followed by `/robots.txt`, for example `yourbusiness.com/robots.txt`. This file tells search engines which parts of the site they may visit. Look for a line saying `Disallow: /` on its own under `User-agent: *`. That blocks the whole site, and it is sometimes left behind from when the site was being built.

Also try `/sitemap.xml`. A sitemap lists your pages so search engines can find them. Not every site needs one, but on larger sites it helps. You can submit it in Google Search Console, which is free and shows how Google sees your site.

Also check for a robots meta tag on the page itself. A line containing `noindex` tells Google not to list that page at all.

## Smaller things worth a look

- **Image alt text.** Short descriptions of images help search and help people who cannot see them.
- **Sharing previews.** Open Graph tags control the title, text and image shown when a link is shared on WhatsApp or Facebook.
- **Clean addresses.** `/services/haircuts/` reads better than `/page?id=482`.

Local businesses should also set up a Google Business Profile, which often matters more than anything on the website. See our [Google Business Profile setup guide](/blog/google-business-profile-setup-guide/).

## Checking it all at once with WebInspect

Viewing source works, but it is slow across many pages. [WebInspect](/webinspect/) is a free Chrome extension we built that reads the page in front of you and reports on it. Press `Ctrl+Shift+U`, click the toolbar button, or right-click the page.

The **SEO** section covers the title, meta description, heading outline, canonical, robots, Open Graph and Twitter tags with a card preview, structured data types and URL shape. The **Mobile** section checks the viewport declaration, zoom locks, horizontal overflow, fixed pixel widths, touch target sizes and small text. Each finding shows the markup behind it, and you can highlight it on the page or export the report as JSON or CSV.

It runs in your browser with no account, and nothing you inspect is uploaded. It is not a replacement for Google Search Console, which shows what Google has actually indexed. They answer different questions.

## What good basics do and do not do

Getting these right will not put you at the top of Google on its own. Useful content, real reviews and a good reputation do that over time. What the basics do is remove the obstacles, so the work you put into your site can be found. If you are planning a new site, our list of [what to prepare before getting a website](/blog/what-to-prepare-before-getting-a-website/) is a good next read.
