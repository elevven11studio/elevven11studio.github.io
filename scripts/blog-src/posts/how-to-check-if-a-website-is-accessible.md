---
title: How to Check If a Website Is Accessible
description: Simple checks for alt text, colour contrast, headings, form labels and keyboard use, and why an accessible website works better for every visitor.
date: 2026-11-23
product: webinspect
---
An accessible website is one that people can use whatever their eyesight, hearing, movement or device. That includes blind people using screen readers, older customers who enlarge text, someone with a broken wrist using only a keyboard, and anyone reading a phone in bright sunlight.

Accessibility is often treated as a specialist topic. The basics are not. Most problems come from a few common mistakes, and you can check for them yourself.

## Why it is worth the effort

- **More customers can use your site.** If someone cannot read your prices or fill in your form, they go elsewhere.
- **Everyone benefits.** Clear contrast, readable text and labelled forms help all visitors, not only those with a disability.
- **It overlaps with search.** Alt text and a sensible heading structure also help search engines understand a page.
- **Some organisations are required to do it.** Rules differ by country and sector, so if you run a school, clinic or public body, ask what applies to you.

## 1. Images have alt text

Alt text is a short description of an image, read aloud by screen readers and shown if the image fails to load. Press `Ctrl+U` to view the source and search for `<img`. Each one should have an `alt` attribute.

Good alt text says what matters about the image in context: "Plate of jollof rice with grilled chicken" rather than "IMG_2041". Purely decorative images can have an empty `alt=""`, which tells screen readers to skip them.

## 2. Text has enough contrast

Light grey text on a white background looks stylish and is hard to read. The common standard, WCAG AA, asks for a contrast ratio of at least 4.5 to 1 for normal text and 3 to 1 for large text.

You do not have to calculate this. In Chrome, right-click some text, choose **Inspect**, and click the colour swatch next to the `color` value in the Styles panel. DevTools shows the contrast ratio and whether it passes.

## 3. Headings form an outline

Screen reader users often jump from heading to heading to find what they need, the same way sighted people skim. The page should have one main heading and then section headings in order, without skipping from a top level heading straight to a much smaller one for looks.

If text is made bold and large but is not marked as a heading, it is invisible to that kind of navigation.

## 4. Form fields have labels

Every input needs a label that is linked to it, not just placeholder text inside the box. Placeholder text disappears as soon as you start typing, and some screen readers do not announce it.

A quick test: click the word "Email" next to a field. If the cursor jumps into the field, the label is connected.

Also check buttons and links have clear names. A button that is only an icon, or a link that says "click here", tells a screen reader user nothing.

## 5. Everything works with a keyboard

Put your mouse aside and press `Tab` repeatedly from the top of the page. You should be able to reach every link, button and form field in a sensible order, and see clearly which one is selected. Press `Enter` to follow links and `Space` to tick boxes.

Common failures are menus that only open on hover, pop ups you cannot close without a mouse, and focus outlines removed by the designer so you cannot tell where you are.

## 6. A few more quick checks

- **Zoom to 200%.** Text should grow and the layout should still work.
- **Pinch to zoom on your phone.** Some sites block it, which makes small text impossible for many people.
- **Videos have captions.** They help deaf viewers and anyone watching with the sound off.
- **The page declares its language.** Look for `lang="en"` on the `<html>` tag so screen readers use the right pronunciation.

## Running automated checks with WebInspect

[WebInspect](/webinspect/) is a free Chrome extension we built that reports on any page you open. Press `Ctrl+Shift+U` and look at the **Accessibility** section. It checks alt text, form labels, link and button names, page language, landmarks, duplicate ids, ARIA references, roles, tabindex, iframe titles, video captions, focus indicators and colour contrast against WCAG AA. The **Mobile** section also flags zoom locks, small text and touch target sizes.

Every finding carries the markup behind it, and you can highlight it on the page to see exactly which image or field is the problem. You can export the report as JSON or CSV to send to whoever maintains the site.

WebInspect is honest about the limits. Results are described as what automated checks found, never as compliance. Automated testing catches missing alt text, unlabelled fields and poor contrast reliably, but it cannot tell you whether a page actually works well with a screen reader. The keyboard test above, and ideally feedback from real users, fill that gap.

## Fixing what you find

Most fixes are small: write alt text, darken a colour, connect a label, put back the focus outline. If someone else built your site, these are reasonable requests. Our guide on [what counts as a website update](/blog/what-counts-as-a-website-update/) explains how to raise them, and if you are planning a new site, ask for accessibility from the start. It costs far less than fixing it later.
