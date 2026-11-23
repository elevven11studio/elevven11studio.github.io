---
title: How to Check If a Link Is Safe Before You Click
description: How to read a link in WhatsApp, SMS or email before you open it, spot shortened and lookalike addresses, and what to do if you already clicked.
date: 2026-11-23
product: webguard
---
Most scams start with a link. A message says your parcel is held, your account needs updating, or a friend has shared a video. The link is the whole plan: once you tap it, the rest of the trick happens on a page the scammer controls.

You cannot always tell from a link alone that it is dangerous. But you can usually tell when it is worth stopping, and that is enough.

## Look before you tap

On a phone, press and hold a link instead of tapping it. Most apps, including WhatsApp, SMS and Gmail, will show you the full address and let you copy it without opening it. On a computer, hover your mouse over the link and the address appears at the bottom corner of the browser or email program.

A link that reads "mybank.com/secure" can point anywhere. Only the address you see on hold or hover is real.

## Find who owns the address

Every web address has one part that tells you who owns it: the registered domain, just before the `/` that starts the path. In `https://parcels.example-post.com/track`, the owner is `example-post.com`. Everything in front of it can say anything the owner likes.

Our guide on [how to spot a phishing website](/blog/how-to-spot-a-phishing-website/) has a table of examples. The short rule is to read the address from the first `/` backwards to the start, and stop at the name before `.com`, `.ng` or similar. That name is who you are dealing with.

## Warning signs in the link itself

### It is shortened

Links like `bit.ly/3xQ9a`, `tinyurl.com/...` or `t.co/...` hide the real address. Businesses use them honestly all the time, so a short link is not proof of anything. It just means you cannot read the destination yet.

Before opening one from a stranger, check where it leads. Some shortening services show a preview page, and a free online link expander will show the final address without you visiting it. If a short link arrives in a message asking you to log in or pay, treat it as unknown until you have seen the real address.

### The spelling is nearly right

Read slowly. Scammers register names one letter away from the real thing: `jumla` for Jumia, `faceb00k`, `gtbank-ng-verify`, or a real name with an extra word bolted on. On a small phone screen these slide past easily.

### There is an `@` in the address

In `https://mybank.com@203.0.113.5/login`, everything before the `@` is ignored by the browser. The page actually comes from the numbers after it. Real companies never send links like this.

### It points to a file

A link ending in `.apk`, `.exe`, `.scr` or `.zip` downloads something rather than opening a page. A fake "app update" sent as an `.apk` in WhatsApp is a common way to get malware onto Android phones. Install apps only from the Play Store or App Store.

### It contains another link

Addresses like `site.com/redirect?url=https://...` pass you on to a second site. Scammers use trusted sites with open redirects to make a link look respectable. Look at where the second address leads, not the first.

## Check the message around it

The link is only half the picture. Ask:

1. **Did I expect this?** A delivery notice when you ordered nothing is a warning.
2. **Is it pushing me to hurry?** Deadlines and threats exist to stop you thinking.
3. **Does the sender match?** A message from a friend's number can still come from someone who has taken over their WhatsApp. If the message is out of character, call them.
4. **Can I get there another way?** For banks, delivery companies and online stores, open the official app or type the address yourself instead of using the link.

## If you already clicked

The damage usually comes from what you do after opening the page.

- **If you only opened it,** close the tab. Do not type anything, and do not allow notifications or downloads it asks for.
- **If something downloaded,** delete it without opening it. If you installed an app, uninstall it and run your phone's built in security scan.
- **If you entered a password,** change it on the real site straight away, typed in yourself, and anywhere else you used the same one. Turn on two step login.
- **If you entered card or bank details or an OTP,** call your bank on the number on your card and ask them to block the card and watch the account.

Then warn whoever sent it, in case their account has been taken over, and report the message in the app.

## A second pair of eyes with WebGuard

When you open links on your computer, [WebGuard](/webguard/) can check the page as it loads. It is a free Chrome extension we built, and many of the signs above are on its list: URL structure, redirect parameters, embedded credentials like the `@` trick, unusual ports, encoded addresses, risky file types and raw IP addresses. It also checks addresses against known phishing and malicious lists, which are downloaded and matched on your device, so the addresses you visit are not sent anywhere.

Each page gets Low Risk, Suspicious, High Risk or Unknown. Only High Risk interrupts you, and you can press `Ctrl+Shift+W` for the full breakdown. It never calls a page "safe", because passing the checks is not proof of honesty. It is not an antivirus, so the habits above still matter.

## The habit that matters

Press and hold, read the owner, and when in doubt go the long way round through the official app or a typed address. That one pause stops most link scams.
