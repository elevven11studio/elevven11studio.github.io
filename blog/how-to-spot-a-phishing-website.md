---
title: "How to Spot a Phishing Website Before You Type Anything"
description: "Practical signs that a login or payment page is fake, how to read a web address properly, and what to do if you already typed your password."
date: 2026-11-23
url: https://elevven11studio.github.io/blog/how-to-spot-a-phishing-website/
publisher: Elevven11 Studio
---

# How to Spot a Phishing Website Before You Type Anything

Practical signs that a login or payment page is fake, how to read a web address properly, and what to do if you already typed your password.

A phishing website is a fake page built to collect your password, card details or one-time codes. It usually arrives as a link in an SMS, email or WhatsApp message that says your account is about to be blocked, a parcel is waiting, or you have won something. The page then looks exactly like the real one.

The good news is that most fakes give themselves away if you know where to look. Almost all of the clues are in the address bar, not the design.

## Read the address, not the logo

Anyone can copy a logo and a layout in minutes. What they cannot copy is the real domain. So the first habit is simple: before you type anything, read the address.

The part that matters is the **registered domain**, the name just before `.com`, `.ng`, `.com.ng` and so on, at the end of the host name. Everything before it is a subdomain, and the owner of the domain can put any words there.

| Address | Who really owns it |
|---|---|
| `mybank.com/login` | mybank.com |
| `login.mybank.com` | mybank.com |
| `mybank.com.secure-verify.top` | secure-verify.top |
| `mybank-support.com` | mybank-support.com, not mybank.com |

The third one is the classic trick. The real brand name is there, but it is only a subdomain of someone else's site.

## Signs a page is fake

### The spelling is almost right

Watch for swapped or doubled letters, like `paypa1`, `arnazon` (r and n together look like m) or an extra word such as `-secure` or `-verify`. Some fakes use letters from other alphabets that look identical to Latin ones. In Chrome these sometimes show up as an address starting with `xn--`, which is how the browser writes such characters.

### The address is just numbers

A login page on an address like `http://185.23.41.9/` is not your bank. Real services use names.

### The padlock is there

This one catches people out. The padlock and `https` mean the connection is encrypted, not that the site is honest. Fake sites get certificates too, often for free. A missing padlock on a login page is a red flag, but a padlock proves nothing on its own.

### The title and the address disagree

If the browser tab says your bank's name but the domain has nothing to do with your bank, stop.

### The form sends your details somewhere else

A real login form submits to the same company's domain. Fake pages often post your details to a different server entirely. You cannot see this without tools, which is one reason a checker helps.

### The message pushes you to hurry

"Verify within 24 hours or your account will be suspended" is pressure, and pressure is the point. Your bank will not ask for your PIN, full card number or OTP through a link.

## Safer habits

1. **Type the address yourself** or use a bookmark for banking and email. Do not log in from a link in a message.
2. **Check the registered domain** every time a page asks for a password or card.
3. **Use a different password** for each important account, so one leak does not open everything.
4. **Turn on two-step login** wherever it is offered.
5. **Never share an OTP.** No genuine support agent needs it.

## If you already typed your password

Act quickly. Change the password on the real site, typed in yourself, and change it anywhere else you used the same one. If you entered card or bank details, call your bank using the number on your card and ask them to block it. Then check recent activity on the account.

## Where WebGuard fits

We built [WebGuard](https://elevven11studio.github.io/webguard/), a free Chrome extension, to do the address checking for you as pages load. It looks for many of the signs above: impersonation of 34 commonly imitated services, typosquatting, lookalike characters, brand names hidden in subdomains, a title that disagrees with the domain, raw IP addresses, and login or payment forms that post to a different domain or send passwords over plain `http`.

It gives one of four verdicts: Low Risk, Suspicious, High Risk or Unknown. There is deliberately no "safe" verdict, because a page that passed the checks has not been proven honest. Only High Risk interrupts you. You can open the full breakdown from the toolbar icon or with `Ctrl+Shift+W`, and every signal shows what it saw.

Checks run on your device, and online checks are off by default. Known phishing lists are downloaded and matched locally, so the addresses you visit are not sent anywhere. It is not an antivirus or a password manager, and it cannot promise a site is safe. It gives you better information at the moment you are about to type.

## The short version

Ignore the logo and read the registered domain. Treat urgency as a warning, treat the padlock as neutral, and never log in from a link someone sent you. Most phishing fails against those habits alone.

---

Published 23 Nov 2026 by Elevven11 Studio. Read online: https://elevven11studio.github.io/blog/how-to-spot-a-phishing-website/
