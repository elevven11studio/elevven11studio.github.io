---
title: "Learn Web Design by Studying Real Pages You Admire"
description: "How to study the layout, spacing, type, colour and structure of good websites, practise by rebuilding them, and stay on the right side of copyright."
date: 2026-11-23
url: https://elevven11studio.github.io/blog/learn-web-design-by-studying-real-pages/
publisher: Elevven11 Studio
---

# Learn Web Design by Studying Real Pages You Admire

How to study the layout, spacing, type, colour and structure of good websites, practise by rebuilding them, and stay on the right side of copyright.

Designers have always learned by looking closely at good work. On the web you have an advantage: every page you admire is open in front of you, and your browser can show you how it was put together.

The trick is to study with purpose. Scrolling through beautiful sites feels like learning, but you only learn when you ask why something works and then try it yourself.

## Pick a few pages, not fifty

Choose three to five pages you genuinely like. Mix them: one plain business site, one shop, one landing page, maybe one from a business like yours. Save the links in a list.

For each page, write one sentence about what you like. "It feels calm." "I can find the price instantly." That sentence is what you are trying to understand.

## Study the layout

Squint at the page or zoom out until you cannot read the words. What is left is the layout.

- **How wide is the content?** Most readable pages keep text in a narrow column rather than stretching it across the screen.
- **What lines up?** Notice how headings, text and images share the same left edge. Alignment is a large part of why a page looks tidy.
- **How many columns?** Count them in each section. Many good pages use only one or two.

Sketch the page as boxes on paper. This wireframe shows you the structure without the distraction of photos.

## Study the spacing

Spacing is the thing beginners most often get wrong, and the thing good pages get right.

Right-click an element, choose **Inspect**, and look at the box model in DevTools. You will see its margin and padding in pixels. Check a few elements and you will often find the same values repeating, such as 8, 16, 24, 32 and 64. That repetition is a spacing scale, and it is why the page feels consistent.

Notice also that space between sections is usually much larger than space inside them. Generous gaps group related things together.

## Study the type

In the DevTools **Computed** tab, look at `font-family`, `font-size`, `line-height` and `font-weight` for the main heading, a subheading and body text.

You will usually find:

- One or two typefaces, not five.
- A clear jump in size between levels, so headings stand out.
- Body text around 16 to 18 pixels with comfortable line height.
- Lines of body text that stay a readable length.

Write the sizes down. Your own type scale can start from those numbers.

## Study the colour

Count the colours. Most strong designs use a few neutrals for text and backgrounds and one or two accent colours, used sparingly for buttons and links. Note where the accent appears. Often it marks only the things you can click.

## Study the structure

Scroll the page and list its sections in order: header, headline, proof, features, prices, questions, contact. Good pages follow a story. They answer the visitor's questions in the order the visitor has them.

Then resize the window to phone width and watch what moves. Which columns stack? What gets hidden? This teaches you more about responsive design than any tutorial.

If you are deciding how much to put on one page, see [one page vs multi page website](https://elevven11studio.github.io/blog/one-page-vs-multi-page-website/).

## Practise by rebuilding

Now build a version yourself, from scratch, using your own words and pictures. Aim to match the feel, not every pixel. Then compare and fix the differences. When you get stuck, go back to DevTools and inspect the original.

## Respect the work you study

Learning from a design is normal. Copying it is not. Layout ideas, spacing habits and the general approach of a page are fair to learn from. These are not yours to reuse:

- **Text.** Write your own.
- **Photos and illustrations.** Use your own or ones you have a licence for.
- **Logos and brand names.** Never put another business's brand on your site.
- **Fonts.** Many fonts need a licence. Use free ones such as those on Google Fonts if you are not sure.
- **A distinctive overall look.** Making your site look like a copy of a known brand can confuse customers and cause legal trouble.

The test is simple: once you have replaced the content, would anyone mistake your page for theirs? If yes, change more.

## Studying faster with SiteExtract

Inspecting element by element is slow. [SiteExtract](https://elevven11studio.github.io/siteextract/), a free Chrome extension we built, saves the page you are viewing as one ZIP of HTML, CSS, images, fonts and design tokens. Press `Ctrl+Shift+E`, choose what to include and press Extract. Unzip it and open `index.html`, and it works offline.

The most useful file for studying is `tokens.css`. It lists the colours, type scale, spacing, radii and shadows the page actually uses, ranked by how often they appear. Treat it as a starting point, since it comes from what the page renders, not the site's real design system.

The default Snapshot mode removes scripts, leaving a static page you can change freely: shrink the spacing, swap the colours and see what breaks. SiteExtract's own page says the project is for learning, prototyping and sites you have the right to copy, and that text, images and fonts belong to their owners. For a step by step guide to the files, see [turn a web page into a starter project](https://elevven11studio.github.io/blog/turn-a-web-page-into-a-starter-project/).

## Keep a notebook

For each page you study, write down the content width, spacing scale, type sizes, colours and section order. After ten pages, patterns appear, and those patterns become your own taste.

---

Published 23 Nov 2026 by Elevven11 Studio. Read online: https://elevven11studio.github.io/blog/learn-web-design-by-studying-real-pages/
