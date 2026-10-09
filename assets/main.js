/**
 * Elevven11 Studio - page logic. The site shell (nav, theme, cookie consent) is in shell.js, which
 * loads first. Vanilla JS, no dependencies: referral code capture and the
 * Get Started / Contact forms, which hand off to WhatsApp or email while
 * recording the lead server-side (see recordLead).
 */

document.addEventListener('DOMContentLoaded', () => {
  initReferralCapture();
  initFormPrefill();
  initSendSplit();
  initThankYou();
  initAgentCodePage();
  initAgentLinkGenerator();
  initGetStartedForm();
  initGeoLocalization();
  initLeadChannelTracking();
  initSliders();
  initContactForm();
  initSupportForm();
  initSupportThanks();
  initAgentForm();
});

/**
 * Printable/shareable summary images for the three forms below - a receipt-
 * style PNG of what was submitted, built on <canvas> rather than a PDF
 * library so there's no new dependency. Three things use it:
 *   - A "Download a summary" link added to the success message after a
 *     WhatsApp/email handoff, and to the thank-you page after a direct send
 *     (see goToThankYou's optional third argument).
 *   - The WhatsApp channel, which tries handing the image + a caption to the
 *     device's native share sheet (where WhatsApp shows up if installed)
 *     before falling back to the existing text-only wa.me link.
 * Everything here is synchronous (toDataURL, not the async toBlob) so the
 * WhatsApp fallback's window.open() stays inside the same click-handler tick
 * that started it - breaking that chain is what gets a window.open() eaten
 * by the popup blocker.
 */
function renderSummaryImage(subtitle, rows) {
  const width = 720;
  const padding = 40;
  const lineHeight = 26;
  const labelFont = '600 14px Arial, sans-serif';
  const valueFont = '400 15px Arial, sans-serif';
  const maxTextWidth = width - padding * 2;

  const measure = document.createElement('canvas').getContext('2d');

  function wrap(text) {
    const words = String(text).split(' ');
    const out = [];
    let line = '';
    words.forEach((w) => {
      const test = line ? line + ' ' + w : w;
      if (measure.measureText(test).width > maxTextWidth && line) {
        out.push(line);
        line = w;
      } else {
        line = test;
      }
    });
    if (line) out.push(line);
    return out;
  }

  const drawRows = [];
  rows.forEach(({ label, value }) => {
    if (!value) return;
    measure.font = labelFont;
    drawRows.push({ font: labelFont, color: '#8a8175', text: label });
    measure.font = valueFont;
    wrap(value).forEach((line) => drawRows.push({ font: valueFont, color: '#1f1b16', text: line }));
    drawRows.push({ gap: true });
  });

  const headerHeight = 118;
  const footerHeight = 40;
  const height = headerHeight + drawRows.length * lineHeight + footerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(0, 0, width, 6);

  ctx.fillStyle = '#0b0a10';
  ctx.font = '700 24px Arial, sans-serif';
  ctx.fillText('Elevven11 Studio', padding, 52);
  ctx.fillStyle = '#5d564b';
  ctx.font = '400 15px Arial, sans-serif';
  ctx.fillText(subtitle, padding, 78);
  ctx.strokeStyle = '#e5e0d5';
  ctx.beginPath();
  ctx.moveTo(padding, 98);
  ctx.lineTo(width - padding, 98);
  ctx.stroke();

  let y = headerHeight;
  drawRows.forEach((row) => {
    if (row.gap) { y += lineHeight * 0.4; return; }
    ctx.fillStyle = row.color;
    ctx.font = row.font;
    ctx.fillText(row.text, padding, y);
    y += lineHeight;
  });

  ctx.fillStyle = '#8a8175';
  ctx.font = '400 12px Arial, sans-serif';
  ctx.fillText('elevven11studio.github.io  ·  ' + new Date().toLocaleString(), padding, height - 16);

  return canvas;
}

/** Synchronous: a data: URL needs no Blob or object-URL cleanup, and keeps
 * the whole call chain synchronous with whatever click triggered it. */
function downloadCanvas(canvas, filename) {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function dataUrlToBlob(dataUrl) {
  const [meta, b64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)[1];
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function canvasToFile(canvas, filename) {
  return new File([dataUrlToBlob(canvas.toDataURL('image/png'))], filename, { type: 'image/png' });
}

/**
 * Tries the WhatsApp channel via the device's native share sheet (image +
 * caption together) and returns true if that sheet opened. Callers fall back
 * to the plain wa.me text link when this returns false - desktop browsers
 * and anything lacking file-sharing support all take that path, so nothing
 * regresses for them.
 */
function tryShareToWhatsApp(canvas, filename, text) {
  if (!navigator.canShare) return false;
  const file = canvasToFile(canvas, filename);
  if (!navigator.canShare({ files: [file] })) return false;
  navigator.share({ files: [file], text }).catch(() => { /* cancelled - nothing to recover */ });
  return true;
}

/** Adds a "Download a summary" link to a success message box, once - safe to
 * call every time a success message is shown without piling up duplicates. */
function addSummaryDownload(container, subtitle, rows, filename) {
  if (!container || container.querySelector('[data-summary-download]')) return;
  const link = document.createElement('button');
  link.type = 'button';
  link.setAttribute('data-summary-download', '');
  link.textContent = 'Download a summary of this';
  link.style.cssText = 'display:inline-block; margin-top:0.75rem; background:none; border:none; padding:0; '
    + 'font:inherit; text-decoration:underline; color:inherit; cursor:pointer; opacity:0.85;';
  link.addEventListener('click', () => downloadCanvas(renderSummaryImage(subtitle, rows), filename));
  container.appendChild(link);
}

/**
 * Lead capture, via Web3Forms.
 *
 * This is now the DEFAULT route on both forms: the main half of the split
 * send button posts here and the visitor never leaves the page. WhatsApp and
 * email still exist behind the caret, for anyone who would rather start a
 * conversation in a channel they can see and keep - and when one of those is
 * chosen, the submission is recorded here too, because both of them only open
 * a composer. If the person never presses send in WhatsApp, the enquiry would
 * otherwise be gone with no trace that it happened.
 *
 * That difference is why callers treat the returned promise two ways:
 *
 *  - Direct send AWAITS it, because it is the whole delivery. Success and
 *    failure both have to be shown honestly.
 *  - The WhatsApp/email routes must NOT await it. window.open() has to run
 *    synchronously inside the click handler or the popup blocker eats the
 *    tab, so there it is fired off and the handoff proceeds regardless.
 *
 * keepalive lets the request outlive the page either way, in case the visitor
 * is navigated off (mobile WhatsApp deep links do this) before it lands.
 *
 * The access keys are publishable, submit-only identifiers - they are meant to
 * live in client-side code and can only post to the studio's own inboxes. Each
 * form uses its own key so enquiries, website requests and agent applications
 * arrive as distinguishable streams rather than one mixed inbox.
 */
const WEB3FORMS_KEYS = {
  getStarted: '00c55bee-a900-4c7c-9592-8729f8546b32',
  contact: '101a72d3-398e-4963-9b8a-729d58ba5a8a',
  agents: '05717410-4640-4fba-ade1-d99326369e03',
};

/** Resolves to { ok, message } - never rejects, so no caller needs a catch. */
function recordLead(accessKey, fields) {
  try {
    return fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      keepalive: true,
      body: JSON.stringify(Object.assign({ access_key: accessKey }, fields)),
    })
      .then((res) => res.json().catch(() => ({})))
      .then((data) => ({
        ok: !!data && data.success === true,
        message: (data && data.message) || '',
      }))
      // Offline, blocked, or rate-limited. The handoff routes still run; the
      // direct route surfaces this to the visitor.
      .catch(() => ({ ok: false, message: '' }));
  } catch (e) {
    return Promise.resolve({ ok: false, message: '' });
  }
}

/**
 * Appends a short reassurance to a handoff success message, but only once the
 * lead has actually been stored - so the page never claims to have the details
 * when the request failed.
 */
function confirmLeadStored(saved, el) {
  if (!el) return;
  saved.then((res) => {
    if (!res.ok || !el.isConnected) return;
    const note = document.createElement('span');
    note.className = 'form-success-note';
    note.textContent = ' We’ve also received your details here, so we can reach you either way.';
    el.appendChild(note);
  });
}

/**
 * Hands off to the thank-you page after a confirmed send.
 *
 * The visitor's name travels in sessionStorage rather than a query string on
 * purpose: a ?name= would show up in GA4's page reports, in browser history
 * and in any referrer header, which is no place for someone's name. This
 * keeps it in the tab, where it is read once and immediately discarded.
 * summary (optional) is {subtitle, rows, filename} for the same "download a
 * summary" link the WhatsApp/email handoffs show - the direct-send route
 * skips those success messages entirely (it redirects here instead), so this
 * is how it still offers the same download.
 *
 * location.replace rather than assign, so Back doesn't return to a form that
 * has already been submitted.
 */
const THANKS_KEY = 'e11_thanks';

function goToThankYou(name, from, summary) {
  try {
    sessionStorage.setItem(THANKS_KEY, JSON.stringify({ name: name, from: from, summary: summary || null }));
  } catch (e) { /* private mode - the page falls back to its generic copy */ }
  window.location.replace('/thank-you/');
}

/**
 * Thank-you page. Personalises the copy if we arrived from a form in this tab,
 * and reports the conversion. The markup already reads correctly with none of
 * this applied, which is what someone landing here directly will see.
 */
function initThankYou() {
  const heading = document.querySelector('[data-thanks-heading]');
  if (!heading) return;

  let data = null;
  try {
    const raw = sessionStorage.getItem(THANKS_KEY);
    if (raw) data = JSON.parse(raw);
    // Read once: a refresh, or a later visit, gets the generic page rather
    // than greeting someone by a name from a submission they've forgotten.
    sessionStorage.removeItem(THANKS_KEY);
  } catch (e) { /* fall through to the generic copy */ }

  if (!data) return;

  if (data.name) {
    const nameEl = heading.querySelector('[data-thanks-name]');
    // textContent, not innerHTML - this is user input echoed back to the page.
    if (nameEl) nameEl.textContent = ', ' + data.name;
  }

  const line = document.querySelector('[data-thanks-line]');
  if (line && data.from === 'get-started') {
    line.textContent = "We've got your request and it's landed in our inbox. "
      + "We'll be in touch shortly about next steps.";
  }

  const step2 = document.querySelector('[data-thanks-step-2]');
  if (step2 && data.from === 'get-started') {
    step2.textContent = 'We confirm the package, the price and the timeline, '
      + 'then collect your content (text, photos, logo).';
  }

  if (data.summary) {
    const summaryEl = document.querySelector('[data-thanks-summary]');
    if (summaryEl) addSummaryDownload(summaryEl, data.summary.subtitle, data.summary.rows, data.summary.filename);
  }

  // The conversion itself. The pageview is what you'd mark as the GA4
  // conversion; this adds which form produced it.
  if (typeof gtag === 'function') {
    gtag('event', 'generate_lead', { form: data.from || 'unknown' });
  }
}

/**
 * Agent referral code page (/agents/code/). A link the studio hands an agent
 * directly - e.g. https://elevven11studio.github.io/agents/code/?name=Jane&code=JANE10 -
 * that greets them by name and hands back their ready-to-share referral link,
 * built entirely from the URL so there's no backend involved. With no ?code=
 * (someone opening the bare page) it just shows the generic fallback already
 * in the markup.
 */
function initAgentCodePage() {
  const heading = document.querySelector('[data-code-heading]');
  if (!heading) return;

  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  const code = params.get('code');
  if (!code) return;

  const nameEl = heading.querySelector('[data-code-name]');
  // textContent, not innerHTML - this is user-suppliable (from the URL).
  if (name && nameEl) nameEl.textContent = ', ' + name;

  const line = document.querySelector('[data-code-line]');
  if (line) line.textContent = "Here's your personal referral code and link - save this page, or copy your link below.";

  const valueEl = document.querySelector('[data-code-value]');
  if (valueEl) valueEl.textContent = code;

  const linkEl = document.querySelector('[data-code-link]');
  if (linkEl) linkEl.textContent = 'https://elevven11studio.github.io/get-started/?ref=' + encodeURIComponent(code);

  const section = document.querySelector('[data-code-section]');
  if (section) section.hidden = false;
  const empty = document.querySelector('[data-code-empty]');
  if (empty) empty.hidden = true;
}

/**
 * Private agent-link generator (/agents/generate/). Not indexed or linked
 * from navigation anywhere on the site - a small tool for building the
 * /agents/code/ welcome link for an agent without hand-encoding their name
 * into a URL. Everything happens client-side; nothing is sent anywhere.
 */
function initAgentLinkGenerator() {
  const nameInput = document.querySelector('[data-gen-name]');
  if (!nameInput) return;

  const codeInput = document.querySelector('[data-gen-code]');
  const output = document.querySelector('[data-gen-output]');
  const empty = document.querySelector('[data-gen-empty]');
  const linkEl = document.querySelector('[data-gen-link]');
  const openLink = document.querySelector('[data-gen-open]');

  function update() {
    const name = nameInput.value.trim();
    const code = codeInput.value.trim();

    if (!name || !code) {
      if (output) output.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }

    const url = 'https://elevven11studio.github.io/agents/code/?name='
      + encodeURIComponent(name) + '&code=' + encodeURIComponent(code);

    if (linkEl) linkEl.textContent = url;
    if (openLink) openLink.href = url;
    if (empty) empty.hidden = true;
    if (output) output.hidden = false;
  }

  nameInput.addEventListener('input', update);
  codeInput.addEventListener('input', update);
}

/**
 * Split send button: a primary action plus a caret that reveals the
 * alternatives. Only the open/close behaviour lives here - each form wires
 * what the buttons actually do, since the payloads differ.
 *
 * The options are inert while closed (the menu is visibility:hidden, so they
 * leave the tab order on their own) and the caret owns aria-expanded.
 */
function initSendSplit() {
  document.querySelectorAll('[data-send-split]').forEach((split) => {
    const toggle = split.querySelector('.send-split-toggle');
    const menu = split.querySelector('.send-split-menu');
    const options = Array.from(split.querySelectorAll('.send-split-option'));
    if (!toggle || !menu || !options.length) return;

    function setOpen(open) {
      split.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      options.forEach((o) => { o.tabIndex = open ? 0 : -1; });
    }

    toggle.addEventListener('click', () => {
      const opening = !split.classList.contains('open');
      setOpen(opening);
      // Deferred a frame: the menu is visibility:hidden until the open class
      // lands, and a hidden element silently refuses focus.
      if (opening) requestAnimationFrame(() => options[0].focus());
    });

    // Choosing an option closes the menu; the action itself is wired elsewhere.
    options.forEach((o) => o.addEventListener('click', () => setOpen(false)));

    // Arrow keys move between options, matching what a menu button implies.
    menu.addEventListener('keydown', (e) => {
      const i = options.indexOf(document.activeElement);
      if (i === -1) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); options[(i + 1) % options.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); options[(i - 1 + options.length) % options.length].focus(); }
    });

    document.addEventListener('click', (e) => {
      if (split.classList.contains('open') && !split.contains(e.target)) setOpen(false);
    });
    split.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && split.classList.contains('open')) { setOpen(false); toggle.focus(); }
    });

    setOpen(false);
  });
}

/**
 * Busy state and failure reporting for a direct (on-page) send.
 *
 * There is no success case here: a send that lands redirects to /thank-you/,
 * so the only thing this has to render in place is the failure - and that
 * names WhatsApp and email as the way through, since those still work when
 * the post doesn't.
 */
/**
 * Shows a validation error inline, next to the form, instead of a native
 * alert(). Some environments - including this project's own in-editor
 * preview tooling - suppress alert() entirely, so a warning that only ever
 * shows as a JS dialog can silently vanish and look like the button just
 * isn't doing anything. Reuses the same .form-error-msg box the direct-send
 * failure state uses, so there's one visual language for "something's wrong"
 * on these forms rather than two.
 */
function showFormError(form, message) {
  const card = form.closest('.glass-card') || form.parentElement;
  const errorEl = card && card.querySelector('.form-error-msg');
  if (!errorEl) { alert(message); return; } // fallback for a page without the element
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function directSendFeedback(form, mainBtn) {
  const card = form.closest('.glass-card') || form.parentElement;
  const successEl = card && card.querySelector('.form-success-msg');
  const errorEl = card && card.querySelector('.form-error-msg');
  const label = mainBtn ? mainBtn.textContent : '';

  return {
    start() {
      if (errorEl) errorEl.style.display = 'none';
      // A handoff message from an earlier attempt would otherwise sit above a
      // form the visitor is now re-sending.
      if (successEl) successEl.style.display = 'none';
      if (mainBtn) {
        mainBtn.setAttribute('aria-busy', 'true');
        mainBtn.disabled = true;
        mainBtn.textContent = 'Sending…';
      }
      return () => {
        if (!mainBtn) return;
        mainBtn.removeAttribute('aria-busy');
        mainBtn.disabled = false;
        mainBtn.textContent = label;
      };
    },
    failed() {
      if (!errorEl) return;
      errorEl.textContent = 'Sorry, that didn’t go through. Please check your connection '
        + 'and try again, or use the arrow beside the button to send on WhatsApp or by '
        + 'email instead.';
      errorEl.style.display = 'block';
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  };
}

/**
 * Country-based localization: Naira pricing and "Nigeria" copy by default,
 * rewritten for visitors detected outside Nigeria. Nothing serves this site
 * but a static host, so this is a client-side best guess using a free
 * IP-geolocation lookup, cached for the browser session. If the lookup fails (offline, blocked,
 * rate-limited) we simply leave the Nigeria-facing markup already in the
 * HTML as the fallback - that's the studio's home market.
 *
 * Every price in the markup is written in Naira by default and tagged
 * with data-ngn="<amount>" (optionally data-suffix="+" for "starting at"
 * prices). Every "Nigeria"-referencing phrase that should adapt for other
 * countries is wrapped in a <span class="geo-phrase" data-us="..."> with
 * the Nigeria-facing text as its default content. For US visitors that
 * span's text is swapped to its data-us alternative (e.g. "in Nigeria" ->
 * "in America"); for every other country the phrase is simply removed.
 */
/**
 * Live NGN/USD rate.
 *
 * Two things need it: the USD prices shown to visitors outside Nigeria, and the
 * support page, which has to convert a USD donation into the Naira figure
 * Paystack will actually charge. This used to be a hardcoded 1550 with a note
 * to update it occasionally, which is exactly the kind of note nobody acts on -
 * by the time it was replaced the real rate was around 1325, so every USD price
 * on the site was reading about 15% low.
 *
 * Two providers, both free, keyless and CORS-enabled; the second exists so one
 * being down is not an outage. The result is cached in localStorage for six
 * hours, so a normal browse costs at most one request a day and the last good
 * rate keeps working offline. NGN_PER_USD_FALLBACK is only ever reached by a
 * first-time visitor with both providers unreachable.
 */
const NGN_PER_USD_FALLBACK = 1325;
const RATE_CACHE_KEY = 'e11_usd_rate';
const RATE_TTL_MS = 6 * 60 * 60 * 1000;

const RATE_SOURCES = [
  {
    url: 'https://open.er-api.com/v6/latest/USD',
    pick: (d) => d && d.rates && d.rates.NGN,
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    pick: (d) => d && d.usd && d.usd.ngn,
  },
];

// Module state rather than a return value, so formatUsd() can stay synchronous
// for the many call sites that only format. Anything that needs an accurate
// number awaits getNgnPerUsd() first.
let ngnPerUsd = NGN_PER_USD_FALLBACK;
let rateFetchedAt = 0;
let rateIsLive = false;
let ratePromise = null;

function readCachedRate() {
  try {
    const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY));
    if (!cached || !isFinite(cached.rate) || cached.rate <= 0) return null;
    return cached;
  } catch (e) {
    return null; // private mode, or something else wrote to the key
  }
}

/**
 * Resolves to Naira per USD. Safe to call as often as you like: the in-flight
 * promise is shared, so ten call sites on one page make one request between
 * them. Never rejects - a total failure resolves to the last known rate.
 */
function getNgnPerUsd() {
  if (ratePromise) return ratePromise;

  // A cached rate is adopted immediately even when it has expired, so a slow
  // or failing lookup degrades to yesterday's rate rather than to the fallback.
  const cached = readCachedRate();
  if (cached) {
    ngnPerUsd = cached.rate;
    rateFetchedAt = cached.at || 0;
    rateIsLive = true;
    if (Date.now() - rateFetchedAt < RATE_TTL_MS) {
      ratePromise = Promise.resolve(ngnPerUsd);
      return ratePromise;
    }
  }

  ratePromise = (async () => {
    for (const source of RATE_SOURCES) {
      try {
        const res = await fetch(source.url);
        if (!res.ok) continue;
        const rate = source.pick(await res.json());
        if (!isFinite(rate) || rate <= 0) continue;

        ngnPerUsd = rate;
        rateFetchedAt = Date.now();
        rateIsLive = true;
        try {
          localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({ rate, at: rateFetchedAt }));
        } catch (e) { /* private mode: this session still has the rate in memory */ }
        return rate;
      } catch (e) { /* try the next provider */ }
    }
    return ngnPerUsd;
  })();

  return ratePromise;
}

/**
 * Currency codes rather than symbols, sitewide. NGN and USD are unambiguous to
 * an international reader, ₦ is not widely recognised outside Nigeria, and the
 * codes match what Paystack prints at checkout - so the figure someone sees on
 * a pricing card and the figure on the payment page read the same way.
 */
function formatNaira(amount) {
  return 'NGN ' + Math.round(amount).toLocaleString('en-NG');
}

function formatUsd(amountNgn) {
  const usd = amountNgn / ngnPerUsd;
  // Round to something that reads like a price rather than a conversion:
  // whole dollars while small, then to the nearest 5.
  const rounded = usd < 20 ? Math.round(usd) : Math.round(usd / 5) * 5;
  return 'USD ' + rounded.toLocaleString('en-US');
}

async function detectCountryCode() {
  const cached = sessionStorage.getItem('e11_country');
  if (cached) return cached;

  try {
    const res = await fetch('https://ipwho.is/');
    const data = await res.json();
    if (data && data.success !== false && data.country_code) {
      sessionStorage.setItem('e11_country', data.country_code);
      return data.country_code;
    }
  } catch (e) {
    // Offline or blocked - fall back to the Naira prices already in the HTML.
  }
  return null;
}

async function initGeoLocalization() {
  const priceEls = document.querySelectorAll('[data-ngn]');
  const geoEls = document.querySelectorAll('.geo-phrase');
  if (!priceEls.length && !geoEls.length) return;

  const country = await detectCountryCode();
  if (!country || country === 'NG') return; // Nigeria-facing markup is already correct
  await getNgnPerUsd();

  priceEls.forEach((el) => {
    const amount = parseInt(el.getAttribute('data-ngn'), 10);
    if (!amount) return;
    const suffix = el.getAttribute('data-suffix') || '';
    const usdText = formatUsd(amount) + suffix;

    if (el.tagName === 'OPTION') {
      const label = el.getAttribute('data-label') || el.value;
      el.textContent = `${label} (${usdText})`;
    } else {
      el.textContent = usdText;
    }
  });

  geoEls.forEach((el) => {
    el.textContent = country === 'US' ? (el.getAttribute('data-us') || '') : '';
  });
}

/**
 * Sends a GA4 event whenever someone picks a contact route (WhatsApp vs the
 * Google Form), so the split between channels is visible in analytics rather
 * than guessed at. Any element tagged data-lead-channel="<name>" is tracked.
 */
function initLeadChannelTracking() {
  const targets = document.querySelectorAll('[data-lead-channel]');
  if (!targets.length) return;

  targets.forEach((el) => {
    el.addEventListener('click', () => {
      if (typeof gtag !== 'function') return;
      gtag('event', 'lead_channel_click', {
        lead_channel: el.getAttribute('data-lead-channel'),
        page_path: window.location.pathname,
      });
    });
  });
}

/**
 * Reads ?ref=CODE from the URL (per the agent referral link scheme) and
 * surfaces it on any page with a `.referral-banner` and hidden `#referral-code`
 * input, so it can be attributed on the Get Started form.
 */
function initReferralCapture() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (!ref) return;

  sessionStorage.setItem('e11_referral_code', ref);
  if (hasCookieConsent()) setCookie(REFERRAL_COOKIE, ref, COOKIE_DAYS);

  const banner = document.querySelector('.referral-banner');
  if (banner) {
    banner.textContent = `Referred by agent code: ${ref}`;
    banner.style.display = 'block';
  }

  const hiddenInput = document.getElementById('referral-code');
  if (hiddenInput) hiddenInput.value = ref;
}

/**
 * Get Started form: submissions are handed off to WhatsApp as a pre-filled
 * message the customer sends directly, and recorded via recordLead at the
 * same time so the enquiry survives an abandoned handoff.
 */
function initGetStartedForm() {
  const form = document.querySelector('.get-started-form');
  if (!form) return;

  const storedRef = sessionStorage.getItem('e11_referral_code') || getCookie(REFERRAL_COOKIE);
  const hiddenInput = document.getElementById('referral-code');
  if (storedRef && hiddenInput && !hiddenInput.value) {
    hiddenInput.value = storedRef;
    const banner = document.querySelector('.referral-banner');
    if (banner) {
      banner.textContent = `Referred by agent code: ${storedRef}`;
      banner.style.display = 'block';
    }
  }

  restoreFormDataCookie(form);
  wireFormAutosave(form);
  wireClearSavedInfo(form);
  initAddonCheckout(form);
  initProjectType(form);

  const packageSelect = document.getElementById('gs-package');

  const get = (name) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (!field) return '';
    if (field.type === 'checkbox') return field.checked ? 'Yes' : '';
    return field.value.trim();
  };

  /**
   * Builds the message body plus the structured field set behind it, or
   * returns null if required fields are empty. The body is what the visitor
   * sends from WhatsApp or their mail app; the fields are what gets recorded
   * server-side, so a lead is legible even if they never press send.
   */
  function compose() {
    const required = ['name', 'phone', 'package'];
    for (const field of required) {
      if (!get(field)) {
        showFormError(form, 'Please fill in your name, phone number, and chosen package.');
        return null;
      }
    }
    if (!get('agreeTerms')) {
      showFormError(form, 'Please agree to the Terms of Service to continue.');
      return null;
    }

    // Use the select's visible option text rather than its raw value, so the
    // price shown matches whatever currency initCurrencyByCountry rewrote it
    // to (Naira for Nigeria, an approximate USD figure elsewhere).
    const packageText = packageSelect && packageSelect.selectedIndex >= 0
      ? packageSelect.options[packageSelect.selectedIndex].textContent.trim()
      : get('package');

    // Best-effort, auto-detected from the same IP lookup that drives currency
    // display - no manual country field/dropdown on the form.
    const country = sessionStorage.getItem('e11_country');

    // Website is still the common case, so it stays the default. An app
    // enquiry arriving as "I would like to get a website built" reads as a
    // mis-sent message, and the subject line is what sorts the inbox.
    const wantsApp = /\bapp\b/i.test(packageText);
    const noun = wantsApp ? 'mobile app' : 'website';
    const appFeatures = Array.from(form.querySelectorAll('input[name="appFeatures"]:checked')).map((el) => el.value);

    // Read straight from the checkboxes rather than recomputing prices here -
    // initAddonCheckout already rendered the total in the visitor's currency,
    // so reuse that text instead of duplicating its currency-detection logic.
    const addonNames = wantsApp ? [] : Array.from(form.querySelectorAll('input[name="addons"]:checked')).map((el) => el.value);
    const totalEl = document.querySelector('[data-summary-total]');
    const totalText = totalEl ? totalEl.textContent.trim() : '';

    const lines = [
      `Hi Elevven11 Studio, I would like to get a ${noun} built.`,
      `Name: ${get('name')}`,
      get('business') ? `Business/Person name: ${get('business')}` : null,
      `Phone: ${get('phone')}`,
      get('email') ? `Email: ${get('email')}` : null,
      get('location') ? `Location: ${get('location')}` : null,
      `Package: ${packageText}`,
      addonNames.length ? `Add-ons: ${addonNames.join(', ')}` : null,
      addonNames.length && totalText && totalText !== '-' ? `Estimated total: ${totalText}` : null,
      !wantsApp && get('exampleType') ? `Interested in example style: ${get('exampleType')}` : null,
      get('description') ? `${wantsApp ? 'About the app' : 'About the business'}: ${get('description')}` : null,
      wantsApp && get('appPlatform') ? `Platforms: ${get('appPlatform')}` : null,
      wantsApp && get('appStage') ? `Stage: ${get('appStage')}` : null,
      wantsApp && appFeatures.length ? `Needs: ${appFeatures.join(', ')}` : null,
      wantsApp && get('appTimeline') ? `Timeline: ${get('appTimeline')}` : null,
      wantsApp && get('appRef') ? `Reference: ${get('appRef')}` : null,
      !wantsApp && get('styleMood') ? `Style vibe: ${get('styleMood')}` : null,
      !wantsApp && get('colors') ? `Preferred colors: ${get('colors')}` : null,
      !wantsApp && get('colorsNotes') ? `More on colors/style: ${get('colorsNotes')}` : null,
      country ? `Detected country: ${country}` : null,
      get('referral') ? `Referral code: ${get('referral')}` : null,
    ].filter(Boolean);

    return {
      body: lines.join('\n'),
      fields: {
        subject: `${wantsApp ? 'App' : 'Website'} request: ${get('name')}` +
          (get('referral') ? ` (ref ${get('referral')})` : ''),
        from_name: 'Elevven11 Get Started form',
        name: get('name'),
        business: get('business'),
        phone: get('phone'),
        email: get('email'),
        location: get('location'),
        package: packageText,
        addons: addonNames.join(', '),
        estimated_total: addonNames.length ? totalText : '',
        example_style: wantsApp ? '' : get('exampleType'),
        about: get('description'),
        style_vibe: wantsApp ? '' : get('styleMood'),
        colors: wantsApp ? '' : get('colors'),
        colors_notes: wantsApp ? '' : get('colorsNotes'),
        app_platform: wantsApp ? get('appPlatform') : '',
        app_stage: wantsApp ? get('appStage') : '',
        app_features: wantsApp ? appFeatures.join(', ') : '',
        app_timeline: wantsApp ? get('appTimeline') : '',
        app_reference: wantsApp ? get('appRef') : '',
        detected_country: country || '',
        referral_code: get('referral'),
        terms_agreed: get('agreeTerms') ? 'yes' : 'no',
      },
      summary: {
        subtitle: wantsApp ? 'App Request Summary' : 'Website Request Summary',
        filename: wantsApp ? 'elevven11-app-request.png' : 'elevven11-website-request.png',
        rows: [
          { label: 'Name', value: get('name') },
          { label: 'Business/Person name', value: get('business') },
          { label: 'Phone', value: get('phone') },
          { label: 'Email', value: get('email') },
          { label: 'Location', value: get('location') },
          { label: 'Package', value: packageText },
          { label: 'Add-ons', value: addonNames.join(', ') },
          { label: 'Estimated total', value: addonNames.length ? totalText : '' },
          { label: 'Example style', value: wantsApp ? '' : get('exampleType') },
          { label: wantsApp ? 'About the app' : 'About the business', value: get('description') },
          { label: 'Platforms', value: wantsApp ? get('appPlatform') : '' },
          { label: 'Stage', value: wantsApp ? get('appStage') : '' },
          { label: 'Needs', value: wantsApp ? appFeatures.join(', ') : '' },
          { label: 'Timeline', value: wantsApp ? get('appTimeline') : '' },
          { label: 'Reference', value: wantsApp ? get('appRef') : '' },
          { label: 'Style vibe', value: wantsApp ? '' : get('styleMood') },
          { label: 'Preferred colors', value: wantsApp ? '' : get('colors') },
          { label: 'More on colors/style', value: wantsApp ? '' : get('colorsNotes') },
        ],
      },
    };
  }

  const mainBtn = form.querySelector('.send-split-main');
  const feedback = directSendFeedback(form, mainBtn);

  /**
   * The default route: post it to us and stay put. This one awaits the
   * result, because unlike the handoffs there is no second chance behind it -
   * if it failed, the visitor has to know.
   */
  function sendDirect() {
    const composed = compose();
    if (!composed) return;

    const finish = feedback.start();
    recordLead(
      WEB3FORMS_KEYS.getStarted,
      Object.assign({ chosen_channel: 'direct' }, composed.fields)
    ).then((res) => {
      finish();
      if (res.ok) {
        // The request is in. Drop the autosaved copy first - otherwise a
        // return visit refills the form with a request already sent.
        deleteCookie(FORM_DATA_COOKIE);
        goToThankYou(get('name'), 'get-started', composed.summary);
      } else {
        feedback.failed();
      }
    });
  }

  /** Hands the composed message to whichever channel was chosen. */
  function send(channel) {
    const composed = compose();
    if (!composed) return;
    const body = composed.body;

    // Fired before the handoff and deliberately not awaited - see recordLead.
    const saved = recordLead(
      WEB3FORMS_KEYS.getStarted,
      Object.assign({ chosen_channel: channel }, composed.fields)
    );

    let sharedToWhatsApp = false;
    if (channel === 'whatsapp') {
      // Tries the device's native share sheet first (image + text together,
      // WhatsApp shows up there if installed) - see tryShareToWhatsApp. Only
      // reaches window.open() when that isn't supported, so the popup-blocker-
      // sensitive call stays in the same synchronous tick as this click either way.
      sharedToWhatsApp = tryShareToWhatsApp(
        renderSummaryImage(composed.summary.subtitle, composed.summary.rows),
        composed.summary.filename,
        body
      );
      if (!sharedToWhatsApp) {
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(body), '_blank');
      }
    } else {
      // Anchor click rather than location.href: iOS Safari can block
      // programmatic mailto: navigation, and a popup leaves a blank tab.
      const a = document.createElement('a');
      a.href = 'mailto:elevven11studio@gmail.com'
        + '?subject=' + encodeURIComponent(composed.fields.subject)
        + '&body=' + encodeURIComponent(body);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    const successMsg = document.querySelector('.form-success-msg');
    const errorMsg = document.querySelector('.form-error-msg');
    if (errorMsg) errorMsg.style.display = 'none';
    if (successMsg) {
      successMsg.textContent = sharedToWhatsApp
        ? `Thanks, ${get('name')}! Pick WhatsApp from the share menu to send your details.`
        : channel === 'whatsapp'
        ? `Thanks, ${get('name')}! WhatsApp should have opened with your details filled in. Just hit send there to reach us.`
        : `Thanks, ${get('name')}! Your email app should have opened with your details filled in. Just hit send there to reach us.`;
      successMsg.style.display = 'block';
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      confirmLeadStored(saved, successMsg);
      addSummaryDownload(successMsg, composed.summary.subtitle, composed.summary.rows, composed.summary.filename);
    }
  }

  // Submitting the form - the main half of the split button, or pressing Enter
  // in a field - now sends it to us directly. Native validation runs first,
  // since the main button is a real type="submit".
  form.addEventListener('submit', (e) => { e.preventDefault(); sendDirect(); });

  // The two handoff routes, now behind the caret.
  form.querySelectorAll('[data-gs-send]').forEach((btn) => {
    btn.addEventListener('click', () => send(btn.getAttribute('data-gs-send')));
  });
}

/**
 * Website / mobile app switch on the Get Started form. The package select
 * stays the single source of truth (an app is the "Flutter app" option), so
 * the switch is derived from it and everything downstream keeps working.
 * Website-only groups carry data-for="website", app-only ones data-for="app".
 */
function initProjectType(form) {
  const radios = Array.from(form.querySelectorAll('input[name="projectType"]'));
  const pkg = document.getElementById('gs-package');
  if (!radios.length || !pkg) return;
  const appOption = Array.from(pkg.options).find((o) => /\bapp\b/i.test(o.value));

  function apply(type) {
    const isApp = type === 'app';
    form.querySelectorAll('[data-for]').forEach((el) => {
      // The add-on panel is opened by its own toggle, so only ever force it shut.
      if (el.hasAttribute('data-addon-panel')) { if (isApp) el.hidden = true; return; }
      el.hidden = el.getAttribute('data-for') !== type;
    });
    if (isApp) {
      const toggle = form.querySelector('[data-addon-toggle]');
      if (toggle && toggle.checked) { toggle.checked = false; toggle.dispatchEvent(new Event('change', { bubbles: true })); }
      form.querySelectorAll('input[name="addons"]').forEach((el) => { el.checked = false; });
      if (appOption) pkg.value = appOption.value;
    } else if (appOption && pkg.value === appOption.value) {
      pkg.value = '';
    }
    if (appOption) appOption.hidden = !isApp;
    form.querySelectorAll('[data-label-' + type + ']').forEach((el) => { el.textContent = el.getAttribute('data-label-' + type); });
    form.querySelectorAll('[data-placeholder-' + type + ']').forEach((el) => { el.placeholder = el.getAttribute('data-placeholder-' + type); });
    const hero = document.querySelector('.hero-title strong');
    if (hero) hero.textContent = isApp ? 'App' : 'Website';
  }

  radios.forEach((r) => r.addEventListener('change', () => { if (r.checked) { apply(r.value); saveFormDataCookie(form); } }));
  pkg.addEventListener('change', () => {
    const type = appOption && pkg.value === appOption.value ? 'app' : 'website';
    radios.forEach((r) => { r.checked = r.value === type; });
    apply(type);
  });

  const start = appOption && pkg.value === appOption.value ? 'app' : 'website';
  radios.forEach((r) => { r.checked = r.value === start; });
  apply(start);
}

// Fields snapshotted into FORM_DATA_COOKIE. Deliberately excludes the
// referral field - that has its own cookie/sessionStorage path above, since
// it needs to be captured before the form even exists (a ?ref= link can
// land on any page, not just Get Started).
const AUTOSAVE_FIELDS = ['name', 'business', 'phone', 'email', 'location', 'package', 'exampleType', 'description', 'styleMood', 'colors', 'colorsNotes', 'appPlatform', 'appStage', 'appTimeline', 'appRef'];

function saveFormDataCookie(form) {
  if (!hasCookieConsent()) return;
  const data = {};
  AUTOSAVE_FIELDS.forEach((name) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (field && field.value) data[name] = field.value;
  });

  // Checkboxes share one name, so the generic single-value loop above can't
  // capture them - collect the checked ones into their own array instead.
  const addons = Array.from(form.querySelectorAll('input[name="addons"]:checked')).map((el) => el.value);
  if (addons.length) data.addons = addons;
  const appFeatures = Array.from(form.querySelectorAll('input[name="appFeatures"]:checked')).map((el) => el.value);
  if (appFeatures.length) data.appFeatures = appFeatures;

  setCookie(FORM_DATA_COOKIE, JSON.stringify(data), COOKIE_DAYS);
}

/** Prefills the form from a saved cookie snapshot, without overwriting any
 * field a page script already set (e.g. ?package= via the pricing page). */
function restoreFormDataCookie(form) {
  const raw = getCookie(FORM_DATA_COOKIE);
  if (!raw) return;
  let data;
  try { data = JSON.parse(raw); } catch (e) { return; }

  Object.keys(data).forEach((name) => {
    if (name === 'addons' || name === 'appFeatures') return; // handled separately below - it's an array, not a single value
    const field = form.querySelector(`[name="${name}"]`);
    if (!field || field.value) return;
    field.value = data[name];
  });

  // The color chips track selection with a CSS class the generic loop above
  // can't set - re-apply it to whichever chip matches the restored value.
  if (data.colors) {
    const chip = form.querySelector(`.color-chip[data-color="${CSS.escape(data.colors)}"]`);
    if (chip) {
      chip.classList.add('selected');
      chip.setAttribute('aria-pressed', 'true');
    }
  }

  if (Array.isArray(data.appFeatures)) {
    data.appFeatures.forEach((value) => {
      const input = form.querySelector(`input[name="appFeatures"][value="${CSS.escape(value)}"]`);
      if (input) input.checked = true;
    });
  }

  if (Array.isArray(data.addons)) {
    data.addons.forEach((value) => {
      const input = form.querySelector(`input[name="addons"][value="${CSS.escape(value)}"]`);
      if (input) input.checked = true;
    });
  }
}

/** Saves on every edit, debounced for text fields; immediate for selects and
 * color chips since those don't fire the 'input' event this listens for. */
function wireFormAutosave(form) {
  let saveTimer = null;
  const saveSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => saveFormDataCookie(form), 500); };

  form.addEventListener('input', saveSoon);
  form.addEventListener('change', () => saveFormDataCookie(form));

  // The color-chip click handler (wired inline on the Get Started page) sets
  // the hidden field's value directly, which fires neither event - so hook
  // the same click, deferred a tick to run after that handler updates it.
  form.querySelectorAll('.color-chip').forEach((chip) => {
    chip.addEventListener('click', () => setTimeout(() => saveFormDataCookie(form), 0));
  });
}

/** Wires up a page's "Clear saved info & cookies" control, if present. */
function wireClearSavedInfo(form) {
  const btn = document.querySelector('[data-clear-cookies]');
  if (!btn) return;

  btn.addEventListener('click', () => {
    deleteCookie(FORM_DATA_COOKIE);
    deleteCookie(REFERRAL_COOKIE);
    deleteCookie(CONSENT_COOKIE);
    sessionStorage.removeItem('e11_referral_code');

    form.reset();
    form.querySelectorAll('.color-chip.selected').forEach((chip) => {
      chip.classList.remove('selected');
      chip.setAttribute('aria-pressed', 'false');
    });

    // form.reset() alone doesn't clear these two: setting .value on a
    // type="hidden" input also rewrites its "value" attribute (per spec,
    // hidden inputs have no separate dirty-value flag), so once restored
    // from a cookie their defaultValue - what reset() restores to - is the
    // restored value itself, not empty. Clear them directly instead.
    const colorsField = document.getElementById('gs-colors');
    if (colorsField) colorsField.value = '';
    const referralField = document.getElementById('referral-code');
    if (referralField) referralField.value = '';

    const banner = document.querySelector('.referral-banner');
    if (banner) banner.style.display = 'none';

    const note = document.querySelector('[data-clear-note]');
    if (note) {
      note.textContent = 'Saved info and cookies cleared.';
      note.style.display = 'block';
    }

    // form.reset() unchecks the add-ons and the toggle for us, but can't
    // touch the panel's [hidden] or repaint the summary on its own - see the
    // matching assignment in initAddonCheckout.
    if (form.__resetAddonPanel) form.__resetAddonPanel();
  });
}

/**
 * Add-ons checkout on the Get Started form: a live order summary (package +
 * checked add-ons) that updates as either changes, in whatever currency
 * initGeoLocalization decided for this visitor. compose() below reads the
 * same checkboxes to fold the selection into the outgoing message.
 */
function initAddonCheckout(form) {
  const packageSelect = document.getElementById('gs-package');
  const toggle = form.querySelector('[data-addon-toggle]');
  const panel = form.querySelector('[data-addon-panel]');
  const addonInputs = form.querySelectorAll('input[name="addons"]');
  const summaryLines = form.querySelector('[data-summary-lines]');
  const summaryTotal = form.querySelector('[data-summary-total]');
  const summaryNote = form.querySelector('[data-summary-note]');
  if (!packageSelect || !summaryLines || !summaryTotal) return;

  // Collapsed by default so most visitors never see it - restoreFormDataCookie
  // (which runs before this) may have already re-checked some add-ons on a
  // return visit, in which case open it straight away rather than hiding a
  // choice the visitor already made.
  const hasRestoredSelection = Array.from(addonInputs).some((input) => input.checked);
  if (panel) panel.hidden = !hasRestoredSelection;
  if (toggle) toggle.checked = hasRestoredSelection;

  if (toggle && panel) {
    toggle.addEventListener('change', () => {
      panel.hidden = !toggle.checked;
      // Unchecking the toggle drops any selection made while it was open,
      // so a hidden panel can't silently keep add-ons in the outgoing order.
      if (!toggle.checked) addonInputs.forEach((input) => { input.checked = false; });
      render();
    });
  }

  // Lets wireClearSavedInfo collapse this back to its default state too -
  // form.reset() unchecks the toggle and add-ons but can't touch [hidden].
  form.__resetAddonPanel = () => {
    if (panel) panel.hidden = true;
    render();
  };

  async function render() {
    const country = await detectCountryCode();
    const overseas = !!(country && country !== 'NG');
    if (overseas) await getNgnPerUsd();
    const fmt = (ngn) => (overseas ? formatUsd(ngn) : formatNaira(ngn));

    const opt = packageSelect.options[packageSelect.selectedIndex];
    const pkgAmount = opt ? parseInt(opt.getAttribute('data-ngn'), 10) : NaN;
    const pkgIsEstimate = !!(opt && opt.getAttribute('data-suffix') === '+');
    const pkgLabel = opt && opt.value ? (opt.getAttribute('data-label') || opt.value) : '';
    // An option with no data-ngn is quoted per project (app work, "Not sure
    // yet"). Add-ons still carry fixed prices, but totalling those on their own
    // would present a 15,000 add-on as if it were the price of the whole
    // project, so a quote-only selection deliberately gets no total at all -
    // compose() then leaves the "Estimated total" line out of the message.
    const pkgIsQuoteOnly = !!pkgLabel && isNaN(pkgAmount);

    const rows = [];
    let total = 0;
    let hasAmount = false;

    if (pkgLabel) {
      const priceText = isNaN(pkgAmount) ? '&mdash;' : fmt(pkgAmount) + (pkgIsEstimate ? '+' : '');
      rows.push(`<div class="order-summary-line"><span>${pkgLabel}</span><span>${priceText}</span></div>`);
      if (!isNaN(pkgAmount)) { total += pkgAmount; hasAmount = true; }
    }

    addonInputs.forEach((input) => {
      if (!input.checked) return;
      const amount = parseInt(input.getAttribute('data-ngn'), 10) || 0;
      rows.push(`<div class="order-summary-line"><span>${input.value}</span><span>${fmt(amount)}</span></div>`);
      total += amount;
      hasAmount = true;
    });

    summaryLines.innerHTML = rows.length
      ? rows.join('')
      : '<p style="color: var(--text-muted); margin: 0;">Select a package to see your total.</p>';
    summaryTotal.textContent = hasAmount && !pkgIsQuoteOnly
      ? fmt(total) + (pkgIsEstimate ? '+' : '')
      : '-';

    if (summaryNote) {
      const noteText = pkgIsQuoteOnly
        ? 'This one is quoted per project, so there is no total to show yet. Any add-ons you picked are listed above at their fixed price.'
        : pkgIsEstimate
          ? 'Custom packages are quoted separately - this total is an estimate based on the starting price, plus your chosen add-ons.'
          : '';
      summaryNote.style.display = noteText ? 'block' : 'none';
      summaryNote.textContent = noteText;
    }
  }

  packageSelect.addEventListener('change', render);
  addonInputs.forEach((input) => input.addEventListener('change', render));
  form.__renderOrderSummary = render;
  render();
}

/**
 * Picture sliders.
 *
 * The markup is already a working slider on its own: a scroll-snap track that
 * swipes on touch and scrolls on desktop with no JavaScript at all. This adds
 * the arrows, the dot indicators, a live caption and keyboard control on top,
 * so nothing here is load-bearing - if it fails, the slider still works.
 *
 * Any element with [data-slider] is picked up.
 */
function initSliders() {
  const sliders = document.querySelectorAll('[data-slider]');
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const track = slider.querySelector('.slider-track');
    const slides = Array.from(slider.querySelectorAll('.slider-slide'));
    if (!track || slides.length < 2) return;

    const label = slider.getAttribute('data-slider') || 'Slides';
    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-roledescription', 'carousel');
    slider.setAttribute('aria-label', label);

    const caption = slider.querySelector('.slider-caption');

    // The buttons must centre on the TRACK, not on .slider - the dots and
    // caption sit inside .slider too, which would drag the arrows below the
    // artwork. Wrapping the track gives them the right box to centre against,
    // and it stays correct on resize without any measuring.
    const viewport = document.createElement('div');
    viewport.className = 'slider-viewport';
    track.parentNode.insertBefore(viewport, track);
    viewport.appendChild(track);

    // A stroked SVG rather than a text arrow: text glyphs sit off-centre in a
    // circular button because of font metrics, and cannot be given round caps.
    const arrow = (dir) => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
      + '<path d="' + (dir === 'next' ? 'M9 4.5 16.5 12 9 19.5' : 'M15 4.5 7.5 12 15 19.5')
      + '" fill="none" stroke="currentColor" stroke-width="2.1" '
      + 'stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const mkBtn = (dir, text) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slider-btn ' + dir;
      b.innerHTML = arrow(dir);
      b.setAttribute('aria-label', text);
      viewport.appendChild(b);
      return b;
    };
    const prev = mkBtn('prev', 'Previous slide');
    const next = mkBtn('next', 'Next slide');

    const dots = document.createElement('div');
    dots.className = 'slider-dots';
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'slider-dot';
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1) + ' of ' + slides.length);
      d.addEventListener('click', () => go(i));
      dots.appendChild(d);
    });
    // Above the caption: the dots belong with the artwork they index, and the
    // caption is a description of the current slide rather than a control.
    if (caption) slider.insertBefore(dots, caption);
    else slider.appendChild(dots);

    let current = 0;
    let animating = null;
    let programmatic = false;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /**
     * The browser's own smooth scrolling scales its duration with distance, so
     * jumping from the first dot to the last crawled for almost a second. And
     * mandatory snapping fights a scripted scroll, yanking the position to the
     * nearest snap point mid-flight. So: animate it here at a fixed duration,
     * with snapping switched off for the duration of the animation only.
     */
    function animateTo(target) {
      if (animating) cancelAnimationFrame(animating);
      const start = track.scrollLeft;
      const delta = target - start;
      if (Math.abs(delta) < 1) return;

      if (reduced) { track.scrollLeft = target; return; }

      const dur = 420;
      const t0 = performance.now();
      const prevSnap = track.style.scrollSnapType;
      track.style.scrollSnapType = 'none';
      programmatic = true;

      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        track.scrollLeft = start + delta * ease(t);
        if (t < 1) {
          animating = requestAnimationFrame(step);
        } else {
          animating = null;
          track.style.scrollSnapType = prevSnap;
          programmatic = false;
        }
      };
      animating = requestAnimationFrame(step);
    }

    function go(i) {
      current = Math.max(0, Math.min(slides.length - 1, i));
      // Offsets, not scrollIntoView: the latter would scroll the page too.
      animateTo(slides[current].offsetLeft - track.offsetLeft);
      sync();
    }

    function sync() {
      Array.from(dots.children).forEach((d, i) =>
        d.setAttribute('aria-current', i === current ? 'true' : 'false'));
      prev.disabled = current === 0;
      next.disabled = current === slides.length - 1;
      if (caption) {
        const img = slides[current].querySelector('img');
        caption.textContent = img ? img.getAttribute('alt') : '';
      }
      slides.forEach((s, i) => s.setAttribute('aria-hidden', i === current ? 'false' : 'true'));
    }

    prev.addEventListener('click', () => go(current - 1));
    next.addEventListener('click', () => go(current + 1));

    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    });

    // Someone swiping or scrolling the track directly is the source of truth,
    // so mirror that back into the dots rather than fighting it.
    let raf;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      if (programmatic) return; // our own animation already set the target
      raf = requestAnimationFrame(() => {
        const mid = track.scrollLeft + track.clientWidth / 2;
        let best = 0, bestDist = Infinity;
        slides.forEach((s, i) => {
          const c = s.offsetLeft - track.offsetLeft + s.clientWidth / 2;
          const d = Math.abs(c - mid);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        if (best !== current) { current = best; sync(); }
      });
    }, { passive: true });

    sync();
  });
}

/**
 * Contact form: same shape as the Get Started form, but the visitor picks the
 * channel. Both buttons build the identical message; one hands it to WhatsApp,
 * the other to the visitor's mail app.
 *
 * Neither channel actually sends on its own - mailto: and wa.me open a
 * composer with the text pre-filled, and the person presses send themselves.
 * That's why recordLead runs alongside them: the enquiry reaches the studio
 * inbox whether or not they follow through in the composer.
 */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const EMAIL = 'elevven11studio@gmail.com';

  const get = (name) => {
    const field = form.querySelector('[name="' + name + '"]');
    return field ? field.value.trim() : '';
  };

  const topicSelect = form.querySelector('[name="topic"]');

  // A link can arrive with the topic already settled: the extension pages
  // send people here to ask about a particular product. Matches an option by
  // its short data-key first, then by its full value, and leaves the default
  // selected when the parameter names nothing on the list.
  (function preselectTopic() {
    if (!topicSelect) return;
    const requested = new URLSearchParams(window.location.search).get('topic');
    if (!requested) return;
    const wanted = requested.trim().toLowerCase();
    const match = Array.from(topicSelect.options).find(
      (o) => (o.dataset.key || '').toLowerCase() === wanted || o.value.toLowerCase() === wanted
    );
    if (match) topicSelect.value = match.value;
  })();

  // The same links appear further down this page, where following them would
  // reload the page to change one dropdown. Set it in place instead. The href
  // stays a working link, so this is an enhancement rather than the mechanism.
  function selectTopic(key) {
    if (!topicSelect) return false;
    const wanted = key.trim().toLowerCase();
    const match = Array.from(topicSelect.options).find(
      (o) => (o.dataset.key || '').toLowerCase() === wanted || o.value.toLowerCase() === wanted
    );
    if (!match) return false;
    topicSelect.value = match.value;
    topicSelect.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  document.querySelectorAll('a[href*="topic="]').forEach((link) => {
    const url = new URL(link.href, window.location.href);
    if (url.pathname !== window.location.pathname) return;
    const key = url.searchParams.get('topic');
    if (!key) return;
    link.addEventListener('click', (event) => {
      if (!selectTopic(key)) return;
      event.preventDefault();
      const target = document.querySelector(url.hash || '#message-us') || form;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // "Website enquiry" is the wrong subject line on a question about an
  // extension, and the subject is the first thing read in the inbox. An
  // option that needs a different one says so in data-subject.
  const subjectLine = () => {
    const option = topicSelect && topicSelect.selectedOptions[0];
    const prefix = (option && option.dataset.subject) || 'Website enquiry';
    return prefix + ': ' + get('topic');
  };

  function compose() {
    if (!get('name') || !get('message')) {
      showFormError(form, 'Please fill in your name and a short message.');
      return null;
    }
    const lines = [
      'Hi Elevven11 Studio,',
      '',
      get('message'),
      '',
      'Name: ' + get('name'),
      get('email') ? 'Email: ' + get('email') : null,
      get('phone') ? 'Phone/WhatsApp: ' + get('phone') : null,
      'About: ' + get('topic'),
    ].filter((l) => l !== null);

    return {
      body: lines.join('\n'),
      fields: {
        subject: subjectLine(),
        from_name: 'Elevven11 contact form',
        name: get('name'),
        email: get('email'),
        phone: get('phone'),
        topic: get('topic'),
        message: get('message'),
      },
      summary: {
        subtitle: 'Enquiry Summary',
        filename: 'elevven11-enquiry.png',
        rows: [
          { label: 'Name', value: get('name') },
          { label: 'Email', value: get('email') },
          { label: 'Phone/WhatsApp', value: get('phone') },
          { label: 'About', value: get('topic') },
          { label: 'Message', value: get('message') },
        ],
      },
    };
  }

  const mainBtn = form.querySelector('.send-split-main');
  const feedback = directSendFeedback(form, mainBtn);

  function done(channel, saved, summary, sharedToWhatsApp) {
    const msg = form.parentElement.querySelector('.form-success-msg');
    const err = form.parentElement.querySelector('.form-error-msg');
    if (err) err.style.display = 'none';
    if (!msg) return;
    msg.textContent = sharedToWhatsApp
      ? 'Thanks, ' + get('name') + '! Pick WhatsApp from the share menu to send your message.'
      : channel === 'whatsapp'
      ? 'Thanks, ' + get('name') + '! WhatsApp should have opened with your message ready \u2014 press send there to reach us.'
      : 'Thanks, ' + get('name') + '! Your email app should have opened with the message ready \u2014 press send there to reach us.';
    msg.style.display = 'block';
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    confirmLeadStored(saved, msg);
    addSummaryDownload(msg, summary.subtitle, summary.rows, summary.filename);
  }

  /** The default route: delivered here, on the page. Awaited - see recordLead. */
  function sendDirect() {
    const composed = compose();
    if (!composed) return;

    const finish = feedback.start();
    recordLead(
      WEB3FORMS_KEYS.contact,
      Object.assign({ chosen_channel: 'direct' }, composed.fields)
    ).then((res) => {
      finish();
      if (res.ok) goToThankYou(get('name'), 'contact', composed.summary);
      else feedback.failed();
    });
  }

  // The main half is a real type="submit", so native validation runs and Enter
  // in a field works; the caret's two options are type="button" and handled
  // below. Nothing carries data-send="direct", so neither path double-fires.
  form.addEventListener('submit', (e) => { e.preventDefault(); sendDirect(); });

  form.querySelectorAll('[data-send]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const channel = btn.getAttribute('data-send');
      const composed = compose();
      if (!composed) return;
      const body = composed.body;

      // Fired before the handoff and deliberately not awaited - see recordLead.
      const saved = recordLead(
        WEB3FORMS_KEYS.contact,
        Object.assign({ chosen_channel: channel }, composed.fields)
      );

      let sharedToWhatsApp = false;
      if (channel === 'whatsapp') {
        // See the matching comment on the Get Started form - tries the native
        // share sheet (image + text) first, falls back to the text-only link
        // in the same synchronous tick when that isn't supported.
        sharedToWhatsApp = tryShareToWhatsApp(
          renderSummaryImage(composed.summary.subtitle, composed.summary.rows),
          composed.summary.filename,
          body
        );
        if (!sharedToWhatsApp) {
          window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(body), '_blank');
        }
      } else {
        const subject = subjectLine();
        // A synthesised anchor click rather than window.location.href: iOS
        // Safari sometimes blocks programmatic mailto: navigation, and a
        // popup would leave a blank tab behind on desktop.
        const a = document.createElement('a');
        a.href = 'mailto:' + EMAIL
          + '?subject=' + encodeURIComponent(subject)
          + '&body=' + encodeURIComponent(body);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      done(channel, saved, composed.summary, sharedToWhatsApp);
    });
  });
}

/**
 * Referral agent application form. Same shape as the Contact form above -
 * default route posts to Web3Forms directly, WhatsApp/Email sit behind the
 * caret as handoffs. Streamlined from the source Google Form: one combined
 * agreement checkbox instead of six; location, referral type, occupation,
 * experience and how-they-heard-about-us all folded away - location comes
 * from the same IP lookup the currency display uses, and the rest is left to
 * a single optional notes field, since the full rules are already spelled
 * out further down this page and in full at /terms/#referral-terms.
 */
function initAgentForm() {
  const form = document.querySelector('.agent-form');
  if (!form) return;

  const get = (name) => {
    const field = form.querySelector('[name="' + name + '"]');
    if (!field) return '';
    if (field.type === 'checkbox') return field.checked ? 'Yes' : '';
    return field.value.trim();
  };

  function compose() {
    const required = ['name', 'phone', 'email'];
    for (const f of required) {
      if (!get(f)) {
        showFormError(form, 'Please fill in your name, WhatsApp number, and email.');
        return null;
      }
    }
    if (!get('agreeTerms')) {
      showFormError(form, 'Please agree to the Referral Program Terms to apply.');
      return null;
    }

    // Best-effort, auto-detected from the same IP lookup the currency display
    // uses elsewhere - no manual location field on this form.
    const country = sessionStorage.getItem('e11_country');

    const lines = [
      'Hi Elevven11 Studio, I would like to become a referral agent.',
      `Name: ${get('name')}`,
      `WhatsApp: ${get('phone')}`,
      `Email: ${get('email')}`,
      country ? `Detected country: ${country}` : null,
      get('notes') ? `Notes: ${get('notes')}` : null,
      'Agreed to referral program terms: Yes',
    ].filter(Boolean);

    return {
      body: lines.join('\n'),
      fields: {
        subject: `Agent application: ${get('name')}`,
        from_name: 'Elevven11 agent application form',
        name: get('name'),
        phone: get('phone'),
        email: get('email'),
        detected_country: country || '',
        notes: get('notes'),
        agreed_terms: get('agreeTerms') ? 'yes' : 'no',
      },
      summary: {
        subtitle: 'Agent Application Summary',
        filename: 'elevven11-agent-application.png',
        rows: [
          { label: 'Name', value: get('name') },
          { label: 'WhatsApp', value: get('phone') },
          { label: 'Email', value: get('email') },
          { label: 'Detected country', value: country || '' },
          { label: 'Notes', value: get('notes') },
        ],
      },
    };
  }

  const mainBtn = form.querySelector('.send-split-main');
  const feedback = directSendFeedback(form, mainBtn);

  function done(channel, saved, summary, sharedToWhatsApp) {
    const msg = form.parentElement.querySelector('.form-success-msg');
    const err = form.parentElement.querySelector('.form-error-msg');
    if (err) err.style.display = 'none';
    if (!msg) return;
    msg.textContent = sharedToWhatsApp
      ? 'Thanks, ' + get('name') + '! Pick WhatsApp from the share menu to send your application.'
      : channel === 'whatsapp'
      ? 'Thanks, ' + get('name') + '! WhatsApp should have opened with your application ready. Press send there to reach us.'
      : 'Thanks, ' + get('name') + '! Your email app should have opened with the application ready. Press send there to reach us.';
    msg.style.display = 'block';
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    confirmLeadStored(saved, msg);
    addSummaryDownload(msg, summary.subtitle, summary.rows, summary.filename);
  }

  /** The default route: delivered here, on the page. Awaited - see recordLead. */
  function sendDirect() {
    const composed = compose();
    if (!composed) return;

    const finish = feedback.start();
    recordLead(
      WEB3FORMS_KEYS.agents,
      Object.assign({ chosen_channel: 'direct' }, composed.fields)
    ).then((res) => {
      finish();
      if (res.ok) goToThankYou(get('name'), 'agents', composed.summary);
      else feedback.failed();
    });
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); sendDirect(); });

  form.querySelectorAll('[data-agent-send]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const channel = btn.getAttribute('data-agent-send');
      const composed = compose();
      if (!composed) return;
      const body = composed.body;

      // Fired before the handoff and deliberately not awaited - see recordLead.
      const saved = recordLead(
        WEB3FORMS_KEYS.agents,
        Object.assign({ chosen_channel: channel }, composed.fields)
      );

      let sharedToWhatsApp = false;
      if (channel === 'whatsapp') {
        // See the matching comment on the Get Started form - tries the native
        // share sheet (image + text) first, falls back to the text-only link
        // in the same synchronous tick when that isn't supported.
        sharedToWhatsApp = tryShareToWhatsApp(
          renderSummaryImage(composed.summary.subtitle, composed.summary.rows),
          composed.summary.filename,
          body
        );
        if (!sharedToWhatsApp) {
          window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(body), '_blank');
        }
      } else {
        // Anchor click rather than location.href: iOS Safari can block
        // programmatic mailto: navigation, and a popup leaves a blank tab.
        const a = document.createElement('a');
        a.href = 'mailto:elevven11studio@gmail.com'
          + '?subject=' + encodeURIComponent('Agent application: ' + get('name'))
          + '&body=' + encodeURIComponent(body);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      done(channel, saved, composed.summary, sharedToWhatsApp);
    });
  });
}

/**
 * Carries an agent's referral code into the Google Form.
 *
 * The WhatsApp route already appends the code to the message, but the Google
 * Form is a separate document and had no way of knowing about it - a customer
 * who arrived on ?ref=CODE and chose the form would have been credited to
 * nobody. Google Forms accepts prefilled answers as query parameters, so the
 * code travels with the link.
 *
 * Entry IDs live on the markup as data attributes, not here, so the form can be
 * re-pointed without touching this file.
 */
function initFormPrefill() {
  const links = document.querySelectorAll('[data-form-prefill]');
  if (!links.length) return;

  const params = new URLSearchParams(window.location.search);
  const code = params.get('ref') || sessionStorage.getItem('e11_referral_code');
  if (!code) return; // no code, leave the plain form link alone

  links.forEach((a) => {
    const base = a.getAttribute('data-form-base');
    const refEntry = a.getAttribute('data-form-ref-entry');
    const referredEntry = a.getAttribute('data-form-referred-entry');
    if (!base || !refEntry) return;

    const url = new URL(base);
    if (referredEntry) url.searchParams.set(referredEntry, 'Yes');
    url.searchParams.set(refEntry, code);
    a.href = url.toString();
  });

  // Tell the customer their code is being carried, so a blank-looking form
  // field later does not read as the referral having been lost.
  const note = document.querySelector('.form-prefill-note');
  if (note) {
    note.textContent = 'Referral code ' + code + ' will be filled in for you.';
    note.style.display = 'block';
  }
}

/**
 * Support page: a donation form that hands off to a Paystack payment page.
 *
 * Paystack settles in Naira only, so Naira is the currency of record and USD is
 * a convenience for donors abroad. Picking USD converts at the live rate and
 * sends the resulting Naira figure to Paystack; the page shows both numbers
 * before the handoff, so nobody arrives at checkout surprised by the amount.
 *
 * The handoff is a plain URL with prefilled query parameters, all four marked
 * readonly, so the payment page cannot be edited into a different amount or a
 * different donor after we have shown the confirmation. Checked against the
 * live page: `amount` is in Naira, not kobo.
 *
 * Without JavaScript the form cannot build that URL, so the markup carries a
 * <noscript> link straight to the payment page for the donor to fill in
 * themselves.
 */
const PAYSTACK_PAGE = 'https://paystack.shop/pay/-q3x9ac71x';

// Preset amounts per currency, plus the floor and ceiling for a custom one.
// The Naira minimum is a sensible small donation; the USD minimum is set so
// the converted Naira figure clears Paystack's own minimum at any plausible
// rate. The maximum is what stops the field quoting a number nobody is going
// to pay: a bare type="number" accepts exponent notation, so "1e20" used to
// produce a straight-faced offer to charge NGN 100,000,000,000,000,000,000.
// Anyone genuinely giving more than this should talk to us instead.
const DONATION_PRESETS = {
  NGN: { amounts: [10000, 30000, 50000], min: 1000, max: 10000000, step: 500 },
  USD: { amounts: [10, 25, 50], min: 1, max: 10000, step: 1 },
};

function limitText(code, bound) {
  const amount = DONATION_PRESETS[code][bound];
  return code === 'NGN' ? formatNaira(amount) : 'USD ' + amount.toLocaleString('en-US');
}

function initSupportForm() {
  const form = document.querySelector('.support-form');
  if (!form) return;

  const amountInput = form.querySelector('[name="amount"]');
  const presetWrap = form.querySelector('[data-amount-presets]');
  const currencyInputs = Array.from(form.querySelectorAll('[name="currency"]'));
  const amountPrefix = form.querySelector('[data-amount-prefix]');
  const conversionEl = form.querySelector('[data-conversion]');
  const rateEl = form.querySelector('[data-rate-note]');
  const submitBtn = form.querySelector('[type="submit"]');

  const currency = () => (currencyInputs.find((i) => i.checked) || {}).value || 'NGN';
  const value = (name) => {
    const field = form.querySelector('[name="' + name + '"]');
    return field ? field.value.trim() : '';
  };

  // Naira is what Paystack charges, so every amount collapses to it here and
  // the rest of the page works off that one number.
  function amountInNaira() {
    const raw = parseFloat(amountInput.value);
    if (!isFinite(raw) || raw <= 0) return NaN;
    return currency() === 'USD' ? Math.round(raw * ngnPerUsd) : Math.round(raw);
  }

  function renderPresets() {
    const code = currency();
    presetWrap.innerHTML = DONATION_PRESETS[code].amounts.map((amount) => {
      const label = code === 'NGN' ? formatNaira(amount) : 'USD ' + amount;
      return '<button class="amount-option" type="button" aria-pressed="false" '
        + 'data-amount="' + amount + '">' + label + '</button>';
    }).join('');
  }

  function syncPresetState() {
    const raw = parseFloat(amountInput.value);
    presetWrap.querySelectorAll('.amount-option').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(parseFloat(btn.dataset.amount) === raw));
    });
  }

  function renderRate() {
    if (!rateEl) return;
    if (!rateIsLive) {
      rateEl.textContent = 'Using an indicative rate of USD 1 = ' + formatNaira(ngnPerUsd)
        + '. We could not reach the rate service just now.';
      return;
    }
    const when = new Date(rateFetchedAt)
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    rateEl.textContent = 'Today’s rate: USD 1 = NGN '
      + ngnPerUsd.toLocaleString('en-NG', { maximumFractionDigits: 2 })
      + ' · checked ' + when;
  }

  function render() {
    const code = currency();
    if (amountPrefix) amountPrefix.textContent = code;
    amountInput.min = DONATION_PRESETS[code].min;
    amountInput.max = DONATION_PRESETS[code].max;
    amountInput.step = DONATION_PRESETS[code].step;
    amountInput.placeholder = code === 'NGN' ? '30000' : '25';

    syncPresetState();
    renderRate();

    if (!conversionEl) return;
    const naira = amountInNaira();

    if (isNaN(naira)) {
      conversionEl.textContent = code === 'USD'
        ? 'Paystack charges in Naira. Enter an amount and we will show you the Naira figure first.'
        : '';
      return;
    }

    const raw = parseFloat(amountInput.value);
    if (raw > DONATION_PRESETS[code].max) {
      conversionEl.textContent = 'That is more than this form takes. The most it will send is '
        + limitText(code, 'max')
        + '. For anything larger, please get in touch and we will arrange it properly.';
      return;
    }

    if (raw < DONATION_PRESETS[code].min) {
      conversionEl.textContent = 'The smallest amount this form takes is '
        + limitText(code, 'min') + '.';
      return;
    }

    conversionEl.textContent = code === 'USD'
      // The donor's own bank converts back on the way out, at its own rate, so
      // the dollar figure on their statement will differ a little. Say so here
      // rather than let the statement be the first they hear of it.
      ? 'Paystack will charge ' + formatNaira(naira) + '. That is about USD '
        + parseFloat(amountInput.value).toLocaleString('en-US')
        + ' at today’s rate; your own bank sets its rate, so the figure on your '
        + 'statement may differ slightly.'
      : 'Paystack will charge ' + formatNaira(naira) + ' (about ' + formatUsd(naira) + ').';
  }

  presetWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.amount-option');
    if (!btn) return;
    amountInput.value = btn.dataset.amount;
    render();
  });

  currencyInputs.forEach((input) => input.addEventListener('change', () => {
    // The number in the box belongs to the currency it was typed in, and 25
    // dollars is not 25 naira. Clearing it is less wrong than reinterpreting it.
    amountInput.value = '';
    renderPresets();
    render();
  }));

  amountInput.addEventListener('input', render);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const first = value('first_name');
    const last = value('last_name');
    const email = value('email');
    const code = currency();
    const raw = parseFloat(amountInput.value);
    const naira = amountInNaira();

    if (!first || !last) {
      showFormError(form, 'Please enter your first and last name - Paystack asks for both.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFormError(form, 'Please enter a valid email address, so Paystack can send your receipt.');
      return;
    }
    if (isNaN(naira) || raw < DONATION_PRESETS[code].min) {
      showFormError(form, 'Please choose an amount of at least '
        + limitText(code, 'min') + '.');
      return;
    }
    if (raw > DONATION_PRESETS[code].max) {
      showFormError(form, 'That is more than this form takes. The most it will send is '
        + limitText(code, 'max') + '. For anything larger, please get in touch first.');
      return;
    }

    const card = form.closest('.glass-card');
    const errorEl = card && card.querySelector('.form-error-msg');
    if (errorEl) errorEl.style.display = 'none';

    const url = PAYSTACK_PAGE + '?' + new URLSearchParams({
      email: email,
      first_name: first,
      last_name: last,
      amount: String(naira),
      readonly: 'email,amount,first_name,last_name',
    }).toString();

    if (typeof gtag === 'function') {
      gtag('event', 'begin_checkout', {
        currency: 'NGN',
        value: naira,
        chosen_currency: code,
        items: [{ item_id: 'donation', item_name: 'Support donation' }],
      });
    }

    if (submitBtn) {
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.textContent = 'Opening Paystack…';
    }

    // Same tab, not a popup: this is the whole point of the page, and a
    // window.open() here is exactly what a popup blocker eats.
    window.location.href = url;
  });

  renderPresets();
  render();

  // Default to the donor's likely currency, then let the live rate refine the
  // figures. Both are best-effort, and the form is usable before either
  // resolves - Naira, the currency of record, is the starting state.
  (async () => {
    const country = await detectCountryCode();
    if (country && country !== 'NG') {
      const usd = currencyInputs.find((i) => i.value === 'USD');
      if (usd && !usd.checked) { usd.checked = true; renderPresets(); }
    }
    await getNgnPerUsd();
    render();
  })();
}

/**
 * Support thank-you page.
 *
 * The page itself is static and says nothing about the transaction - the donor
 * has already seen the amount on Paystack, and a page on a static host has no
 * way to verify a payment anyway, so it would only be repeating back a number
 * from the URL. This exists purely to close the funnel that initSupportForm
 * opened with begin_checkout.
 *
 * Two guards. Paystack appends ?trxref=&reference= to its redirect, so a visit
 * without one of those did not come from a completed payment and is not
 * counted. And the reference is remembered, so a refresh or a back-and-forward
 * does not book the same donation twice.
 */
function initSupportThanks() {
  if (!document.querySelector('[data-support-thanks]')) return;

  const params = new URLSearchParams(location.search);
  const reference = params.get('reference') || params.get('trxref');
  if (!reference) return; // opened directly, not redirected from a payment

  const key = 'e11_thanked_' + reference;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch (e) { /* private mode: risk a double count rather than lose the event */ }

  if (typeof gtag === 'function') {
    // No value or currency: the redirect carries neither, and a figure invented
    // from the URL would be worse than no figure at all.
    gtag('event', 'purchase', {
      transaction_id: reference,
      items: [{ item_id: 'donation', item_name: 'Support donation' }],
    });
  }
}
