---
title: How to Check If a Website Is Secure, and What You Can't Tell
description: What HTTPS and the padlock really mean, how to read security headers in plain English, signs of outdated software, and the limits of any outside check.
date: 2026-11-23
product: webinspect
---
"Is this website secure?" sounds like a yes or no question. It is not. From the outside you can check how a site is set up, the same way you can check whether a shop has a lock on its door. You cannot see whether the back room is tidy, whether staff reuse passwords, or whether the software behind it was patched last week.

This guide covers what you can check, what it tells you, and where the honest answer is "we cannot know from here".

## HTTPS and the padlock

The first thing to look at is the address. It should start with `https`, and Chrome shows a settings icon instead of a "Not secure" warning.

HTTPS means the connection between your browser and the site is encrypted. Someone on the same Wi-Fi cannot read what you send or quietly change the page on its way to you. Today there is little excuse for any page not to use it.

What HTTPS does **not** mean:

- That the site is honest. Scam sites get certificates too, often free.
- That the company protects your data once it arrives.
- That the site is free of malware or bugs.

So treat HTTPS as a minimum. Missing it is a clear problem. Having it is expected, not reassuring.

## Mixed content and insecure forms

A page can load over HTTPS but still pull in images, scripts or styles over plain `http`. This is called mixed content. Chrome blocks much of it, which can break parts of the page, and what it allows still weakens the protection.

Worse is a form on an HTTPS page that sends its data to an `http` address. The page looks secure, but what you type travels unprotected. Both are signs of a site that is not being looked after carefully.

## Security headers in plain English

When a server sends a page, it includes hidden instructions called headers. Some of them tell the browser to be more careful. To see them, press `F12`, open the **Network** tab, reload, click the first request and read the **Response Headers**.

| Header | What it asks the browser to do |
|---|---|
| `Strict-Transport-Security` | Always use HTTPS for this site, even if someone types `http` |
| `Content-Security-Policy` | Only run scripts and load files from approved places |
| `X-Content-Type-Options: nosniff` | Do not guess what a file is, treat it as labelled |
| `X-Frame-Options` or `frame-ancestors` | Do not let other sites show this page inside a frame |
| `Referrer-Policy` | Limit what the next site learns about where you came from |

Missing headers do not mean a site has been hacked. They mean it has skipped some extra layers of protection. On a small brochure site that matters less than on a site with logins and payments.

## Signs of outdated software

Old software is one of the most common ways sites get broken into. You cannot see the server, but there are clues:

- A `generator` tag in the page source naming an old version of WordPress or another platform.
- Script files with old version numbers in their names, such as an old jQuery release.
- A footer copyright year several years out of date, and a blog that stopped long ago. Not proof, but a hint nobody is maintaining it.
- Odd pages, spam links or redirects you did not expect, which can mean the site has already been compromised.

Our guide on [how to check what a website is built with](/blog/how-to-check-what-a-website-is-built-with/) shows how to find these clues.

## What no outside check can tell you

Be wary of any tool, including ours, that gives a site a clean bill of health. From the outside nobody can see:

- How passwords and customer data are stored.
- Whether admin accounts use strong passwords and two step login.
- Whether there are backups.
- Whether the server software is patched.
- Whether the business follows data protection law.

An outside check can find visible weaknesses. It cannot prove security.

## Checking the visible parts with WebInspect

[WebInspect](/webinspect/) is a free Chrome extension we built that reports on the page in front of you. Press `Ctrl+Shift+U` and open the **Security configuration** section. It checks HTTPS, mixed content, Subresource Integrity (whether scripts from other servers are locked to a known version), form submission targets, iframe sandboxing and insecure links. The **Technology** section lists the frameworks, CMS and libraries it finds, each rated detected, likely or possible.

Every finding shows the evidence behind it. If a check could not run, it is marked as such and left out of the score rather than counted as a failure. It runs in your browser with no servers, so nothing you inspect is uploaded.

Like any outside tool, it cannot see the server, so read its results as a list of things to fix, not a security certificate.

## If it is your own site

Ask whoever runs it four questions: Is everything on HTTPS? Is the platform and every plugin kept updated? Do admin logins use two step login? Are there backups, and has anyone tested restoring one? Clear answers to those matter more than any score. Keeping software updated is part of normal upkeep, as covered in [what counts as a website update](/blog/what-counts-as-a-website-update/).

If you are a visitor rather than the owner, the advice is simpler: use HTTPS sites for anything personal, and check the address before logging in. See [how to spot a fake login page](/blog/how-to-spot-a-fake-login-page/).
