/**
 * Promotion flyers for social and WhatsApp, in two shapes and two editions.
 *
 *   promo/flyers/main.png       the website offer, with all three prices
 *   promo/flyers/agents.png     referral programme (gold, per the brand rule
 *                               that gold marks money/earnings moments)
 *   promo/flyers/examples.png   the template library
 *   promo/flyers/support.png    the support page
 *
 * Each subject is written four times, from two axes:
 *
 * - Edition. The plain file is Nigeria-facing: Naira, a local mobile number,
 *   "in Nigeria" in the eyebrow. The -intl file is for everyone else: Dollars,
 *   the number in international form, and the Nigeria framing dropped. This
 *   mirrors what the site already does at runtime through detectCountryCode() -
 *   the flyers just cannot ask where you are, so they come in two and you pick.
 *
 * - Shape. 1080x1350 by default, and -square at 1080x1080. The square is a
 *   different layout, not a crop: it carries three of the five included lines,
 *   a tighter type scale and less air between blocks. Cropping the tall one
 *   would have cut the contact bar off, which is the part that matters.
 *
 * Why these exist alongside promo/*.png, which cover the same four subjects:
 * a promo is a single message, and a flyer answers the questions that come
 * after it - what it costs, what is included, and how to reach a human. The
 * promo earns the glance; this is what gets forwarded afterwards.
 *
 *   cd tools && npm install && npm run flyers
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'promo/flyers');
const SITE = 'https://elevven11studio.github.io';

// Currency codes rather than the ₦ symbol, matching the site and what Paystack
// prints at checkout. The trailing space is part of it.
const NAIRA = 'NGN ';

// The number as a Nigerian reader expects to see it written, not as it is
// dialled. The international edition uses the +234 form instead.
const WHATSAPP_DISPLAY = '0912 092 5909';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Kept short on purpose. Every character here ends up in the QR, and the
// longest of these URLs was pushing the symbol into a denser version that
// stopped resolving at the size someone actually holds a phone up to.
// utm_source=flyer also separates these from the square promos in GA, which
// utm_source=promo did not.
const utm = (c) => 'utm_source=flyer&utm_medium=qr&utm_campaign=' + c;

/* ---------------- formats ---------------- */

/**
 * Every y coordinate on the flyer, per shape. Laid out bottom-up: the contact
 * bar is sized around the QR, which has a hard floor (see barH), and everything
 * else takes the room that is left. The square is not a scaled copy - it drops
 * two of the included lines and tightens the type, because a 1350 layout
 * squeezed into 1080 either collides or goes unreadably small.
 */
const FORMATS = {
  portrait: {
    suffix: '', w: 1080, h: 1350, m: 80, items: 5,
    wordmarkY: 96, eyebrowY: 182, ruleY: 232,
    headY: 336, headStep: 92, headSize: 80,
    subGap: 58, subSize: 29,
    listGap: 78, listStep: 56, listSize: 27,
    cellsGap: 4, cellH: 132, cellLabelSize: 20, cellValueSize: 40,
    footnoteAt: 'below', footnoteGap: 30, footnoteSize: 21,
    barY: 1038, barH: 232, qr: 190,
  },
  square: {
    suffix: '-square', w: 1080, h: 1080, m: 80, items: 3,
    wordmarkY: 82, eyebrowY: 146, ruleY: 180,
    headY: 268, headStep: 80, headSize: 72,
    subGap: 52, subSize: 27,
    listGap: 60, listStep: 54, listSize: 26,
    // No room under the cells here, so the note goes in the gap above them -
    // which also takes up the slack that was sitting empty between the list
    // and the prices.
    cellsGap: 22, cellH: 124, cellLabelSize: 19, cellValueSize: 37,
    footnoteAt: 'above', footnoteGap: 22, footnoteSize: 20,
    barY: 790, barH: 220, qr: 176,
  },
};

/* ---------------- exchange rate ---------------- */

// The site converts at runtime and can always be current. A flyer is a PNG that
// will be forwarded for months, so the best it can do is be honest: convert at
// the rate on the day it was built, print that rate on the flyer, and say which
// currency is actually charged. Same providers as getNgnPerUsd() in main.js.
const RATE_FALLBACK = 1325;
const RATE_SOURCES = [
  { url: 'https://open.er-api.com/v6/latest/USD', pick: (d) => d && d.rates && d.rates.NGN },
  {
    url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    pick: (d) => d && d.usd && d.usd.ngn,
  },
];

async function ngnPerUsd() {
  for (const source of RATE_SOURCES) {
    try {
      const res = await fetch(source.url);
      if (!res.ok) continue;
      const rate = source.pick(await res.json());
      if (Number.isFinite(rate) && rate > 0) return { rate, live: true };
    } catch (e) { /* try the next provider */ }
  }
  console.warn('WARNING: no rate provider reachable, falling back to ' + RATE_FALLBACK);
  return { rate: RATE_FALLBACK, live: false };
}

// Same rounding as formatUsd() on the site, so a flyer and the page it links to
// never quote two different dollar figures for the same package.
function usd(amountNgn, rate) {
  const value = amountNgn / rate;
  const rounded = value < 20 ? Math.round(value) : Math.round(value / 5) * 5;
  return 'USD ' + rounded.toLocaleString('en-US');
}

/* ---------------- themes ---------------- */

// Same palettes as generate-promos.js. Duplicated rather than shared because
// these two scripts have no other reason to depend on each other, and a shared
// module for six colour pairs would be the tail wagging the dog.
const THEMES = {
  dark: {
    bg: '#0b0a10', panel: 'rgba(247,243,236,0.045)', panelLine: 'rgba(247,243,236,0.10)',
    text: '#f7f3ec', muted: '#a79f95', faint: '#7a7268',
    green: ['#86efac', '#22c55e'], gold: ['#f0c866', '#c99a2e'],
    dot: 'rgba(247,243,236,0.10)',
  },
  light: {
    bg: '#f4f1ea', panel: 'rgba(20,18,26,0.04)', panelLine: 'rgba(20,18,26,0.12)',
    text: '#14121a', muted: '#5d564b', faint: '#8a8175',
    // The brand green is tuned for a dark ground and is close to illegible on
    // cream, so the light theme goes considerably darker.
    green: ['#1f9d55', '#137a40'], gold: ['#9a6f16', '#7a560f'],
    dot: 'rgba(20,18,26,0.10)',
  },
};

/* ---------------- text fitting ---------------- */

function fit(text, maxWidth, start, min = 30) {
  let size = start;
  while (size > min && text.length * size * 0.55 > maxWidth) size -= 2;
  return size;
}

/** Letter-spaced text measures wider than fit() assumes, so tracking is added in. */
function fitTracked(text, maxWidth, start, tracking, min = 14) {
  let size = start;
  while (size > min && text.length * (size * 0.55 + tracking) > maxWidth) size -= 1;
  return size;
}

/* ---------------- pieces ---------------- */

function defs(t, accent) {
  const ramp = accent === 'gold' ? t.gold : t.green;
  return '<defs>'
    + '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="' + ramp[0] + '"/>'
    + '<stop offset="100%" stop-color="' + ramp[1] + '"/></linearGradient>'
    + '<pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">'
    + '<circle cx="2" cy="2" r="2" fill="' + t.dot + '"/></pattern>'
    + '<radialGradient id="glow" cx="84%" cy="10%" r="58%">'
    + '<stop offset="0%" stop-color="' + ramp[0] + '" stop-opacity="0.18"/>'
    + '<stop offset="100%" stop-color="' + ramp[0] + '" stop-opacity="0"/></radialGradient>'
    + '</defs>';
}

const ground = (t, f) =>
  '<rect width="' + f.w + '" height="' + f.h + '" fill="' + t.bg + '"/>'
  + '<rect width="' + f.w + '" height="' + f.h + '" fill="url(#dots)"/>'
  + '<rect width="' + f.w + '" height="' + f.h + '" fill="url(#glow)"/>';

const wordmark = (t, f) => '<text x="' + f.m + '" y="' + f.wordmarkY + '" fill="' + t.text
  + '" font-size="25" font-weight="700" letter-spacing="5" opacity="0.92">ELEVVEN11 STUDIO</text>';

const rule = (t, f) => '<rect x="' + f.m + '" y="' + f.ruleY + '" width="96" height="4" rx="2" '
  + 'fill="url(#accent)"/>';

/** A tick in a soft accent disc. Reads as "included" faster than a bullet. */
function tick(x, y, ramp) {
  return '<g><circle cx="' + x + '" cy="' + (y - 9) + '" r="15" fill="' + ramp[0] + '" opacity="0.16"/>'
    + '<path d="M' + (x - 7) + ' ' + (y - 9) + ' l5 5 l9 -10" fill="none" stroke="' + ramp[0]
    + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>';
}

/**
 * The three-cell strip. Every flyer has three headline numbers of some kind -
 * package prices, commission tiers, suggested amounts - so they all share this
 * one component rather than each inventing its own.
 */
function cells(t, f, y, items) {
  const gap = 18;
  const w = (f.w - f.m * 2 - gap * 2) / 3;
  return items.map((c, i) => {
    const x = f.m + i * (w + gap);
    const cx = x + w / 2;
    return '<g>'
      + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + f.cellH + '" rx="18" fill="'
      + t.panel + '" stroke="' + t.panelLine + '" stroke-width="1"/>'
      + '<text x="' + cx + '" y="' + (y + f.cellH * 0.33) + '" fill="' + t.faint + '" font-size="'
      + fitTracked(c.label.toUpperCase(), w - 24, f.cellLabelSize, 2) + '" font-weight="700" '
      + 'letter-spacing="2" text-anchor="middle">' + esc(c.label.toUpperCase()) + '</text>'
      + '<text x="' + cx + '" y="' + (y + f.cellH * 0.72) + '" fill="url(#accent)" font-size="'
      + fit(c.value, w - 26, f.cellValueSize, 22) + '" font-weight="700" text-anchor="middle">'
      + esc(c.value) + '</text>'
      + '</g>';
  }).join('');
}

/** Sits between the cells and the contact bar, on converted editions only. */
const footnote = (t, f, y, text) => '<text x="' + f.m + '" y="' + y + '" fill="' + t.faint
  + '" font-size="' + f.footnoteSize + '">' + esc(text) + '</text>';

/**
 * Contact bar. The single most important thing on a flyer someone screenshots,
 * so it gets its own panel at the bottom rather than being a line of small
 * print: a number to message, the address to type, and a code to scan.
 *
 * The bar is sized around the QR rather than the other way round. At 138px the
 * code stopped decoding below a 540px render, where the promos manage 360px -
 * and 360px is roughly what a flyer occupies when someone holds up a phone for
 * a stranger to scan.
 */
const qrPad = 16;
const qrPlate = (f) => f.qr + qrPad * 2;
const qrX = (f) => f.w - f.m - qrPlate(f);
const qrY = (f) => f.barY + (f.barH - qrPlate(f)) / 2;

function contactBar(t, f, o) {
  // Text has to stop short of the plate, or a long address runs under the code.
  const textW = f.w - f.m * 2 - qrPlate(f) - 70;
  return '<g>'
    + '<rect x="' + f.m + '" y="' + f.barY + '" width="' + (f.w - f.m * 2) + '" height="' + f.barH
    + '" rx="24" fill="' + t.panel + '" stroke="' + t.panelLine + '" stroke-width="1"/>'
    + '<text x="' + (f.m + 34) + '" y="' + (f.barY + f.barH * 0.27) + '" fill="' + t.faint
    + '" font-size="19" font-weight="700" letter-spacing="3">'
    + esc(o.barLabel.toUpperCase()) + '</text>'
    + '<text x="' + (f.m + 34) + '" y="' + (f.barY + f.barH * 0.53) + '" fill="' + t.text
    + '" font-size="' + fit(o.barPrimary, textW, 38, 24) + '" font-weight="700">'
    + esc(o.barPrimary) + '</text>'
    + '<text x="' + (f.m + 34) + '" y="' + (f.barY + f.barH * 0.72) + '" fill="' + t.muted
    + '" font-size="' + fit(o.barSecondary, textW, 24, 18) + '">'
    + esc(o.barSecondary) + '</text>'
    + '<rect x="' + qrX(f) + '" y="' + qrY(f) + '" width="' + qrPlate(f) + '" height="' + qrPlate(f)
    + '" rx="16" fill="#ffffff"/>'
    + '</g>';
}

async function qrLayer(f, url) {
  return {
    input: await QRCode.toBuffer(url, {
      type: 'png', width: f.qr, margin: 1, errorCorrectionLevel: 'M',
      color: { dark: '#0b0a10ff', light: '#ffffffff' },
    }),
    left: Math.round(qrX(f) + qrPad),
    top: Math.round(qrY(f) + qrPad),
  };
}

/* ---------------- the flyer ---------------- */

function flyer(o, f) {
  const t = THEMES[o.theme];
  const ramp = o.accent === 'gold' ? t.gold : t.green;

  const head = o.lines.map((l, i) =>
    '<text x="' + f.m + '" y="' + (f.headY + i * f.headStep) + '" fill="'
    + (i === o.lines.length - 1 ? 'url(#accent)' : t.text) + '" font-size="'
    + fit(l, f.w - f.m * 2, f.headSize) + '" font-weight="700" letter-spacing="-1">'
    + esc(l) + '</text>').join('');

  const headEnd = f.headY + (o.lines.length - 1) * f.headStep;
  const subY = headEnd + f.subGap;
  const listY = subY + f.listGap;

  // The square carries a curated three rather than the first three: on the
  // agents flyer the fifth line (when you get paid) is the one that sells it.
  const items = f.items >= o.included.length
    ? o.included
    : (o.short || o.included.slice(0, f.items));

  const list = items.map((item, i) => {
    const ly = listY + i * f.listStep;
    return tick(f.m + 15, ly, ramp)
      + '<text x="' + (f.m + 48) + '" y="' + ly + '" fill="' + t.muted + '" font-size="'
      + f.listSize + '">' + esc(item) + '</text>';
  }).join('');

  const cellsY = listY + items.length * f.listStep + f.cellsGap;
  const noteY = f.footnoteAt === 'above'
    ? cellsY - f.footnoteGap
    : cellsY + f.cellH + f.footnoteGap;

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + f.w + '" height="' + f.h
    + '" viewBox="0 0 ' + f.w + ' ' + f.h + '">'
    + defs(t, o.accent) + ground(t, f)
    + '<g font-family="Segoe UI, Arial, sans-serif">'
    + wordmark(t, f)
    + '<text x="' + f.m + '" y="' + f.eyebrowY + '" fill="' + ramp[0] + '" font-size="'
    + fitTracked(o.eyebrow, f.w - f.m * 2, 23, 4) + '" font-weight="700" letter-spacing="4">'
    + esc(o.eyebrow) + '</text>'
    + rule(t, f)
    + head
    + '<text x="' + f.m + '" y="' + subY + '" fill="' + t.muted + '" font-size="'
    + fit(o.sub, f.w - f.m * 2, f.subSize, 21) + '">' + esc(o.sub) + '</text>'
    + list
    + cells(t, f, cellsY, o.cells)
    + (o.footnote ? footnote(t, f, noteY, o.footnote) : '')
    + contactBar(t, f, o)
    + '</g></svg>';
}

/* ---------------- content ---------------- */

// Prices are duplicated from the pricing and agents pages. Nothing reads them
// automatically, so this is the one place that can go quietly stale - check it
// against /pricing/ whenever you re-run.
const AMOUNTS = {
  starter: 50000,
  plus: 80000,
  custom: 120000,
  commissionStarter: 10000,
  commissionPlus: 15000,
};

const ngn = (n) => NAIRA + n.toLocaleString('en-NG');

const PRICES = {
  starter: ngn(AMOUNTS.starter),
  plus: ngn(AMOUNTS.plus),
  custom: ngn(AMOUNTS.custom) + '+',
  commissionStarter: ngn(AMOUNTS.commissionStarter),
  commissionPlus: ngn(AMOUNTS.commissionPlus),
};

/**
 * Both editions of all four flyers.
 *
 * The Nigeria-facing edition is the base; the international one overrides only
 * what actually differs. Keeping them as one object with an override rather
 * than two parallel lists means the shared copy - the included list, the
 * headlines - cannot drift between editions.
 *
 * Themes alternate so a run of these in a feed does not smear into one block.
 */
function buildFlyers(rate, asOf) {
  const converted = 'Billed in NGN. USD shown at ' + ngn(Math.round(rate))
    + ' to USD 1, ' + asOf + '.';

  const base = {
    main: {
      theme: 'dark', accent: 'neon',
      eyebrow: 'WEBSITE DESIGN IN NIGERIA',
      lines: ['Pay Once.', 'No Monthly Fee.'],
      sub: 'A real website for your business, from setup to going live.',
      included: [
        'Mobile-friendly on every screen',
        'WhatsApp button and contact details',
        'Hosting and setup handled for you',
        'Free updates after you go live',
        // The terms are careful here: the finished site is yours to use, but
        // the underlying templates stay with the studio. "You own it" would
        // overstate that, so this borrows the terms page's own wording.
        'The finished site is yours to use',
      ],
      short: [
        'Mobile-friendly on every screen',
        'Hosting and setup handled for you',
        'The finished site is yours to use',
      ],
      cells: [
        { label: 'Starter', value: PRICES.starter },
        { label: 'Plus', value: PRICES.plus },
        { label: 'Custom', value: PRICES.custom },
      ],
      barLabel: 'Message us on WhatsApp',
      barPrimary: WHATSAPP_DISPLAY,
      barSecondary: 'elevven11studio.github.io',
      qr: SITE + '/?' + utm('main'),

      intl: {
        // "in Nigeria" is a selling point at home and a question mark abroad,
        // so the eyebrow says what is on offer instead of where it is made.
        eyebrow: 'WEBSITES FOR SMALL BUSINESS',
        sub: 'A real website for your business, built and delivered online.',
        included: [
          'Mobile-friendly on every screen',
          'WhatsApp button and contact details',
          'Hosting and setup handled for you',
          'Free updates after you go live',
          'Handled online, wherever you are',
        ],
        cells: [
          { label: 'Starter', value: usd(AMOUNTS.starter, rate) },
          { label: 'Plus', value: usd(AMOUNTS.plus, rate) },
          { label: 'Custom', value: usd(AMOUNTS.custom, rate) + '+' },
        ],
        // International dialling form: a leading 0 is meaningless outside the
        // country and the number simply will not connect.
        barPrimary: '+234 912 092 5909',
        footnote: converted,
        qr: SITE + '/?' + utm('main-intl'),
      },
    },

    agents: {
      theme: 'dark', accent: 'gold',
      eyebrow: 'REFERRAL PROGRAMME',
      lines: ['Refer Someone.', 'Get Paid.'],
      sub: 'No website skills needed. Share a link, earn on every sale.',
      included: [
        'Apply in about two minutes',
        'Get a referral code that is yours',
        'Share your link anywhere you like',
        'We handle the build and the client',
        'Paid once the customer completes payment',
      ],
      short: [
        'Apply in about two minutes',
        'Share your link anywhere you like',
        'Paid once the customer completes payment',
      ],
      cells: [
        { label: 'Starter sale', value: PRICES.commissionStarter },
        { label: 'Plus sale', value: PRICES.commissionPlus },
        { label: 'Custom', value: 'Agreed' },
      ],
      barLabel: 'Apply to join',
      barPrimary: 'elevven11studio.github.io/agents',
      barSecondary: 'Or message ' + WHATSAPP_DISPLAY + ' on WhatsApp',
      qr: SITE + '/agents/?' + utm('agents'),

      intl: {
        sub: 'No website skills needed. Refer from anywhere, earn on every sale.',
        cells: [
          { label: 'Starter sale', value: usd(AMOUNTS.commissionStarter, rate) },
          { label: 'Plus sale', value: usd(AMOUNTS.commissionPlus, rate) },
          { label: 'Custom', value: 'Agreed' },
        ],
        barSecondary: 'Or message +234 912 092 5909 on WhatsApp',
        footnote: converted + ' Commission is paid in NGN.',
        qr: SITE + '/agents/?' + utm('agents-intl'),
      },
    },

    examples: {
      theme: 'light', accent: 'neon',
      eyebrow: 'TEMPLATE LIBRARY',
      lines: ['See The Work', 'Before You Pay.'],
      sub: 'Every template is a real site you can open and click through.',
      included: [
        'Restaurants, barbers and fashion',
        'Churches, schools and events',
        'Real estate, logistics and fitness',
        'Photographers, consultants, freelancers',
        'Three style variants of each one',
      ],
      short: [
        'Restaurants, barbers and fashion',
        'Churches, schools and events',
        'Three style variants of each one',
      ],
      cells: [
        { label: 'Live demos', value: '42' },
        { label: 'Industries', value: '14' },
        { label: 'From', value: PRICES.starter },
      ],
      barLabel: 'Browse the demos',
      barPrimary: 'elevven11studio.github.io/examples',
      barSecondary: 'Scan to open them on your phone',
      qr: SITE + '/examples/?' + utm('examples'),

      intl: {
        cells: [
          { label: 'Live demos', value: '42' },
          { label: 'Industries', value: '14' },
          { label: 'From', value: usd(AMOUNTS.starter, rate) },
        ],
        footnote: converted,
        qr: SITE + '/examples/?' + utm('examples-intl'),
      },
    },

    support: {
      theme: 'light', accent: 'neon',
      eyebrow: 'SUPPORT THE STUDIO',
      lines: ['Pay What', 'You Like.'],
      sub: 'Optional, and it buys nothing. The demos and guides stay free either way.',
      included: [
        'Pay in Naira or in Dollars',
        'Card, bank transfer or USSD',
        'Handled by Paystack, not by us',
        'No account and no sign-up',
        'One payment, nothing recurring',
      ],
      short: [
        'Pay in Naira or in Dollars',
        'Card, bank transfer or USSD',
        'No account and no sign-up',
      ],
      cells: [
        { label: 'A little', value: ngn(10000) },
        { label: 'A bit more', value: ngn(30000) },
        { label: 'Generous', value: ngn(50000) },
      ],
      barLabel: 'Chip in',
      barPrimary: 'elevven11studio.github.io/support',
      barSecondary: 'Any amount, and no pressure at all',
      qr: SITE + '/support/?' + utm('support'),

      intl: {
        // Not converted: these are the literal USD preset buttons on the
        // support page, so the flyer and the page offer the same three choices.
        cells: [
          { label: 'A little', value: 'USD 10' },
          { label: 'A bit more', value: 'USD 25' },
          { label: 'Generous', value: 'USD 50' },
        ],
        footnote: 'Paystack settles in NGN, so a USD amount converts at the rate on the day.',
        qr: SITE + '/support/?' + utm('support-intl'),
      },
    },
  };

  const out = {};
  for (const [slug, cfg] of Object.entries(base)) {
    const { intl, ...local } = cfg;
    out[slug] = local;
    out[slug + '-intl'] = { ...local, ...intl };
  }
  return out;
}

/* ---------------- run ---------------- */

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const { rate, live } = await ngnPerUsd();
  const asOf = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  console.log('rate: ' + ngn(Math.round(rate)) + ' to USD 1'
    + (live ? ' (live, ' + asOf + ')' : ' (FALLBACK - no provider reachable)') + '\n');

  const flyers = buildFlyers(rate, asOf);
  let count = 0;

  for (const [slug, cfg] of Object.entries(flyers)) {
    for (const f of Object.values(FORMATS)) {
      const name = slug + f.suffix;
      const file = path.join(OUT, name + '.png');

      await sharp(Buffer.from(flyer(cfg, f)))
        .composite([await qrLayer(f, cfg.qr)])
        .png({ compressionLevel: 9 })
        .toFile(file);

      // WebP alongside, same as the slides: anything on the site that embeds
      // one of these should load the smaller file, and the PNG stays as the
      // copy people download and forward.
      await sharp(file).webp({ quality: 95, effort: 6 })
        .toFile(path.join(OUT, name + '.webp'));

      console.log('  ' + name.padEnd(22) + (f.w + 'x' + f.h).padEnd(11)
        + Math.round(fs.statSync(file).size / 1024) + 'K');
      count++;
    }
  }

  console.log('\n' + count + ' flyers in promo/flyers/ - four subjects, '
    + 'NGN and USD editions, portrait and square');
  console.log('Run `npm run verify-qr` to confirm the codes still decode.');
})().catch((e) => { console.error(e); process.exitCode = 1; });
