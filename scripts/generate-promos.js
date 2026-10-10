/**
 * Square (1080x1080) promo graphics for social posts.
 *
 *   promo/main.png            the general offer
 *   promo/agents.png          referral programme (gold accent, per the brand
 *                             rule that gold marks money/earnings moments)
 *   promo/examples.png        template library, with a real 6-up demo grid
 *   promo/follow-share.png    follow & share card
 *   promo/demos/<slug>.png    one per demo
 *
 * Design notes, since these were deliberate choices:
 *
 * - The demo promos show each template on a PHONE, not in a desktop browser.
 *   The audience buys on phones and "mobile friendly" is a selling point, so
 *   showing the real mobile render argues the point instead of asserting it.
 *   Needs assets/previews/mobile/, so run `npm run previews` first.
 *
 * - Cards alternate between the dark brand ground and a light cream one. A run
 *   of identical dark squares blends into a single smear in a feed; alternating
 *   gives the series rhythm and makes each post read as its own thing.
 *
 * - Colours are per-theme, not shared. The brand green (#86efac) is designed
 *   for a dark ground and is close to illegible on cream, so the light theme
 *   uses a darker green and a deeper gold.
 *
 *   cd scripts && npm install && npm run promos
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');

const ROOT = path.resolve(__dirname, '..');
const PREVIEWS = path.join(ROOT, 'assets/previews');
const MOBILE = path.join(PREVIEWS, 'mobile');
const OUT = path.join(ROOT, 'promo');
const SITE = 'https://elevven11studio.github.io';
const S = 1080;

// Currency codes rather than the ₦ symbol, matching the site and what
// Paystack prints at checkout. The trailing space is part of it: every call
// site concatenates straight onto a figure.
const NAIRA = 'NGN ';
const MIDDOT = '·';
const EMDASH = '—';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const utm = (c) => 'utm_source=promo&utm_medium=qr&utm_campaign=' + c;

/* ---------------- themes ---------------- */

const THEMES = {
  dark: {
    bg: '#0b0a10', panel: '#15121d',
    text: '#f7f3ec', muted: '#a79f95', faint: '#7a7268',
    line: 'rgba(247,243,236,0.14)', dot: 'rgba(247,243,236,0.10)',
    green: ['#86efac', '#22c55e'], gold: ['#f0c866', '#c99a2e'],
    onAccent: '#0b0a10',
  },
  light: {
    bg: '#f4f1ea', panel: '#e7e2d6',
    text: '#14121a', muted: '#5d564b', faint: '#8a8175',
    line: 'rgba(20,18,26,0.16)', dot: 'rgba(20,18,26,0.10)',
    // The brand green is tuned for a dark ground; on cream it needs to go
    // considerably darker to stay readable.
    green: ['#1f9d55', '#137a40'], gold: ['#9a6f16', '#7a560f'],
    onAccent: '#ffffff',
  },
};

/** Width-aware sizing for letter-spaced text, which fit() under-measures. */
function fitTracked(text, maxWidth, start, tracking, min = 14) {
  let size = start;
  while (size > min && text.length * (size * 0.55 + tracking) > maxWidth) size -= 1;
  return size;
}

function fit(text, maxWidth, start, min = 26) {
  let size = start;
  while (size > min && text.length * size * 0.55 > maxWidth) size -= 2;
  return size;
}

function wrap(text, maxChars, maxLines) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars) {
      lines.push(line.trim());
      line = w;
      if (lines.length === maxLines) break;
    } else line = (line + ' ' + w).trim();
  }
  if (lines.length < maxLines && line) lines.push(line.trim());
  return lines;
}

function defs(t, accent) {
  const ramp = accent === 'gold' ? t.gold : t.green;
  return '<defs>'
    + '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="' + ramp[0] + '"/>'
    + '<stop offset="100%" stop-color="' + ramp[1] + '"/></linearGradient>'
    + '<pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">'
    + '<circle cx="2" cy="2" r="2" fill="' + t.dot + '"/></pattern>'
    + '<radialGradient id="glow" cx="82%" cy="14%" r="62%">'
    + '<stop offset="0%" stop-color="' + ramp[0] + '" stop-opacity="0.20"/>'
    + '<stop offset="100%" stop-color="' + ramp[0] + '" stop-opacity="0"/></radialGradient>'
    + '<filter id="drop" x="-25%" y="-25%" width="150%" height="150%">'
    + '<feDropShadow dx="0" dy="18" stdDeviation="26" flood-color="#000" flood-opacity="0.42"/>'
    + '</filter></defs>';
}

const ground = (t) =>
  '<rect width="' + S + '" height="' + S + '" fill="' + t.bg + '"/>'
  + '<rect width="' + S + '" height="' + S + '" fill="url(#dots)"/>'
  + '<rect width="' + S + '" height="' + S + '" fill="url(#glow)"/>';

const wordmark = (t, y) => '<text x="80" y="' + y + '" fill="' + t.text + '" font-size="25" '
  + 'font-weight="700" letter-spacing="5" opacity="0.92">ELEVVEN11 STUDIO</text>';

const footer = (t) => '<text x="80" y="1000" fill="' + t.faint + '" font-size="23">'
  + 'elevven11studio.github.io</text>';

const rule = (t, y, w) => '<rect x="80" y="' + y + '" width="' + (w || 96) + '" height="4" rx="2" fill="url(#accent)"/>';

/* ---------------- phone mockup ---------------- */

// Phone geometry is MEASURED from the capture, not hardcoded. Hardcoded values
// were written for a 420x900 capture; when the capture later moved to 500x1000
// they quietly cropped 80px off the right of every screen and the layout looked
// misaligned. deriveScreen() below keeps these in step with whatever
// generate-previews.js produces.
const PHONE = { x: 648, y: 196, w: 352, bezel: 14 };
const SCREEN = { w: 324, h: 623 };

// The demo pages carry a studio ribbon across the top. Left in, the promo says
// 'Get a website like this' twice - once as its own headline and again inside
// the phone - and puts our branding where the customer's site should be. The
// green pill measures out at row 78 of the 900px capture; 92 clears the bar.
const RIBBON_M = 92;

function phoneFrame(t) {
  const bodyH = SCREEN.h + PHONE.bezel * 2;
  const x = PHONE.x, y = PHONE.y, w = PHONE.w;
  return '<g filter="url(#drop)">'
    + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + bodyH + '" rx="44" fill="#0a0910"/>'
    + '<rect x="' + (x + 1.5) + '" y="' + (y + 1.5) + '" width="' + (w - 3) + '" height="' + (bodyH - 3)
    + '" rx="42.5" fill="none" stroke="rgba(247,243,236,0.22)" stroke-width="1.5"/>'
    + '</g>'
    // speaker notch
    + '<rect x="' + (x + w / 2 - 34) + '" y="' + (y + 20) + '" width="68" height="7" rx="3.5" '
    + 'fill="rgba(247,243,236,0.30)"/>';
}

/* ---------------- QR ---------------- */

const QR = { x: 764, y: 806, size: 200, pad: 22 };
const QR_PX = QR.size - QR.pad * 2;

const qrCard = (t, caption) =>
  '<rect x="' + QR.x + '" y="' + QR.y + '" width="' + QR.size + '" height="' + QR.size
  + '" rx="20" fill="#ffffff"/>'
  + '<text x="' + (QR.x + QR.size / 2) + '" y="' + (QR.y + QR.size + 30) + '" fill="' + t.faint
  + '" font-size="20" text-anchor="middle">' + esc(caption) + '</text>';

async function qrLayer(url) {
  return {
    input: await QRCode.toBuffer(url, {
      type: 'png', width: QR_PX, margin: 1, errorCorrectionLevel: 'M',
      color: { dark: '#0b0a10ff', light: '#ffffffff' },
    }),
    left: QR.x + QR.pad, top: QR.y + QR.pad,
  };
}

/* ---------------- page promo visuals ---------------- */

// Three staggered phone tops, fading out toward the bottom, to the right of
// the text column, which is held to about 540px wide when a visual is present.
const FAN = { x: 672, w: 150, gap: 28, ys: [500, 410] };

async function phoneFan(slugs) {
  const layers = [];
  for (const [k, slug] of slugs.slice(0, 2).entries()) {
    const w = FAN.w, bz = 8;
    const shot = path.join(MOBILE, slug + '.jpg');
    const m = await sharp(shot).metadata();
    const sw = w - bz * 2;
    const sh = Math.round(sw * (m.height - RIBBON_M) / m.width);
    const h = sh + bz * 2;
    // Full width, scaled to fit the screen, then cut to height: 'cover' would crop the sides.
    const scaled = await sharp(shot)
      .extract({ left: 0, top: RIBBON_M, width: m.width, height: m.height - RIBBON_M })
      .resize({ width: sw, height: sh }).png().toBuffer();
    const screen = scaled;
    const body = Buffer.from('<svg width="' + w + '" height="' + h + '"><rect x="1" y="1" width="' + (w - 2)
      + '" height="' + (h + 40) + '" rx="26" fill="#0a0910" stroke="rgba(247,243,236,0.25)" stroke-width="1.5"/></svg>');
    const fade = Buffer.from('<svg width="' + w + '" height="' + h + '"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0.5" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'
      + '<rect width="' + w + '" height="' + h + '" fill="url(#f)"/></svg>');
    const phone = await sharp(body)
      .composite([{ input: await roundRect(screen, sw, sh, 18), left: bz, top: bz }, { input: fade, blend: 'dest-in' }])
      .png().toBuffer();
    layers.push({ input: phone, left: FAN.x + k * (FAN.w + FAN.gap), top: FAN.ys[k] });
  }
  return layers;
}

// Payout card for the referral promo (gold).
function payoutCard(t) {
  const x = 640, y = 430, w = 360, h = 250;
  const row = (yy, label, amt) => '<line x1="' + (x + 28) + '" y1="' + (yy - 40) + '" x2="' + (x + w - 28) + '" y2="' + (yy - 40)
    + '" stroke="' + t.line + '"/><text x="' + (x + 28) + '" y="' + yy + '" fill="' + t.muted + '" font-size="24">' + label
    + '</text><text x="' + (x + w - 28) + '" y="' + yy + '" fill="url(#accent)" font-size="30" font-weight="700" text-anchor="end">'
    + amt + '</text>';
  return '<g filter="url(#drop)"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="22" fill="' + t.panel
    + '" stroke="' + t.line + '"/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="5" rx="2.5" fill="url(#accent)"/></g>'
    + '<text x="' + (x + 28) + '" y="' + (y + 48) + '" fill="' + t.faint + '" font-size="19" letter-spacing="3">PER REFERRAL</text>'
    + row(y + 110, 'Starter', NAIRA + '10,000') + row(y + 180, 'Plus', NAIRA + '15,000')
    + '<text x="' + (x + 28) + '" y="' + (y + 232) + '" fill="' + t.faint + '" font-size="19">Paid once their payment clears</text>';
}

/* ---------------- page promo ---------------- */

function pagePromo(o) {
  const t = THEMES[o.theme];
  const ramp = o.accent === 'gold' ? o.themeGold || t.gold : t.green;

  // With a visual on the right, the text column is narrowed to leave room for it.
  const narrow = !!(o.fan || o.payout);
  const size = narrow ? Math.min(...o.lines.map((l) => fit(l, 540, 84, 40))) : null;
  const step = narrow ? Math.round(size * 1.22) : 96;
  const head = o.lines.map((l, i) =>
    '<text x="80" y="' + (352 + i * step) + '" fill="'
    + (i === o.lines.length - 1 ? 'url(#accent)' : t.text) + '" font-size="'
    + (narrow ? size : fit(l, 920, 84)) + '" font-weight="700" letter-spacing="-1">' + esc(l) + '</text>').join('');

  const subY = 352 + o.lines.length * step + 14;
  const subExtra = narrow ? (wrap(o.sub, 32, 3).length - 1) * 40 : 0;

  const bullets = (o.bullets || []).map((b, i) =>
    '<g><circle cx="92" cy="' + (subY + subExtra + 62 + i * 52 - 8) + '" r="5" fill="url(#accent)"/>'
    + '<text x="118" y="' + (subY + subExtra + 62 + i * 52) + '" fill="' + t.muted + '" font-size="29">'
    + esc(b) + '</text></g>').join('');

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S + '" viewBox="0 0 '
    + S + ' ' + S + '">' + defs(t, o.accent) + ground(t)
    + '<g font-family="Segoe UI, Arial, sans-serif">'
    + wordmark(t, 96)
    + '<text x="80" y="182" fill="' + ramp[0] + '" font-size="23" font-weight="700" letter-spacing="4">'
    + esc(o.eyebrow) + '</text>'
    + rule(t, 232)
    + head
    + (narrow ? wrap(o.sub, 32, 3) : [o.sub]).map((l, i) =>
      '<text x="80" y="' + (subY + i * 40) + '" fill="' + t.muted + '" font-size="30">' + esc(l) + '</text>').join('')
    + bullets
    + (o.payout ? payoutCard(t) : '')
    + (o.qrCaption ? qrCard(t, o.qrCaption) : '')
    + footer(t)
    + '</g></svg>';
}

/* ---------------- demo promo ---------------- */

// Desktop render of the same template, framed bottom-left. The phone alone
// only proves "mobile friendly"; this fills the empty corner and shows the
// site holds up on a laptop too.
const DESK = { x: 80, y: 664, w: 480 };
function desktopFrame(t, uri) {
  const bar = 28, ih = Math.round(DESK.w * 420 / 800), h = bar + ih, r = 12;
  const { x, y, w } = DESK;
  return '<g filter="url(#drop)"><clipPath id="deskclip"><rect x="' + x + '" y="' + y + '" width="' + w
    + '" height="' + h + '" rx="' + r + '"/></clipPath>'
    + '<g clip-path="url(#deskclip)"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + bar
    + '" fill="#221d2e"/><image href="' + uri + '" x="' + x + '" y="' + (y + bar) + '" width="' + w
    + '" height="' + ih + '"/></g>'
    + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r
    + '" fill="none" stroke="rgba(247,243,236,0.22)" stroke-width="1.5"/></g>'
    + ['#ff5f57', '#febc2e', '#28c840'].map((c, i) =>
      '<circle cx="' + (x + 16 + i * 14) + '" cy="' + (y + bar / 2) + '" r="4" fill="' + c + '"/>').join('')
    + '<rect x="' + (x + 64) + '" y="' + (y + 7) + '" width="' + (w - 84) + '" height="14" rx="7" fill="rgba(11,10,16,0.65)"/>';
}

function demoPromo(o) {
  const t = THEMES[o.theme];
  const nameLines = wrap(o.business, 17, 2);
  const size = fit(nameLines[0], 520, 60, 34);
  const label = (o.industry + ' ' + MIDDOT + ' ' + o.style).toUpperCase();

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S + '" viewBox="0 0 '
    + S + ' ' + S + '">' + defs(t, 'neon') + ground(t)
    + '<g font-family="Segoe UI, Arial, sans-serif">'
    + wordmark(t, 96)
    + '<text x="80" y="182" fill="' + t.green[0] + '" font-size="'
    + fitTracked(label, 520, 21, 3) + '" font-weight="700" letter-spacing="3">'
    + esc(label) + '</text>'
    + rule(t, 224)
    + nameLines.map((l, i) =>
      '<text x="80" y="' + (306 + i * 70) + '" fill="' + t.text + '" font-size="' + size
      + '" font-weight="700" letter-spacing="-0.5">' + esc(l) + '</text>').join('')
    + '<text x="80" y="' + (306 + nameLines.length * 70 + 34) + '" fill="url(#accent)" font-size="40" '
    + 'font-weight="700">Get a website like this.</text>'
    + '<text x="80" y="' + (306 + nameLines.length * 70 + 84) + '" fill="' + t.muted + '" font-size="27">From '
    + NAIRA + '50,000 one-time.</text>'
    + '<text x="80" y="' + (306 + nameLines.length * 70 + 122) + '" fill="' + t.muted + '" font-size="27">'
    + 'No monthly hosting fee.</text>'
    + desktopFrame(t, o.thumbUri)
    + phoneFrame(t)
    + footer(t)
    + '</g></svg>';
}

/* ---------------- run ---------------- */

async function roundRect(buf, w, h, r) {
  const mask = Buffer.from('<svg width="' + w + '" height="' + h + '"><rect width="' + w
    + '" height="' + h + '" rx="' + r + '" fill="#fff"/></svg>');
  return sharp(buf).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
}

/**
 * Sizes the phone screen to the real portrait capture, so `cover` never has to
 * trim and the mock never shows a sliced-off layout. Also re-centres the phone
 * vertically for whatever height that produces.
 */
async function deriveScreen() {
  const first = fs.readdirSync(MOBILE).find((f) => f.endsWith('.jpg'));
  if (!first) return;
  const m = await sharp(path.join(MOBILE, first)).metadata();
  const srcW = m.width;
  const srcH = m.height - RIBBON_M;
  SCREEN.w = 324;
  SCREEN.h = Math.round(SCREEN.w * (srcH / srcW));
  PHONE.y = Math.round((S - (SCREEN.h + PHONE.bezel * 2)) / 2);
  console.log('capture ' + m.width + 'x' + m.height + '  ->  screen '
    + SCREEN.w + 'x' + SCREEN.h + ', phone y=' + PHONE.y);
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'demos'), { recursive: true });
  await deriveScreen();

  const PAGES = [
    {
      name: 'main', theme: 'dark', accent: 'neon', qrCaption: 'Scan to visit',
      url: SITE + '/?' + utm('main'),
      eyebrow: 'WEBSITE DESIGN IN NIGERIA',
      lines: ['Simple Websites.', 'No Monthly', 'Hosting Fee.'],
      sub: 'For small businesses, freelancers and creators.',
      bullets: ['42 live demos across 14 industries', 'From ' + NAIRA + '50,000, one-time'],
      fan: ['barber', 'fashion', 'fitness'],
    },
    {
      name: 'agents', theme: 'dark', accent: 'gold', qrCaption: 'Scan to join',
      url: SITE + '/agents/?' + utm('agents'),
      eyebrow: 'REFERRAL PROGRAMME',
      lines: ['Refer Someone.', 'Earn a', 'Commission.'],
      sub: 'No website skills needed. Get paid when they buy.',
      payout: true,
    },
    {
      name: 'examples', theme: 'light', accent: 'neon', qrCaption: 'Scan to browse',
      url: SITE + '/examples/?' + utm('examples'),
      eyebrow: 'TEMPLATE LIBRARY',
      lines: ['42 Live Demos.', '14 Industries.'],
      sub: 'Restaurants, salons, churches, schools, and more.',
      bullets: ['Three style options per industry', 'Open them all on your phone'],
      fan: ['church', 'restaurant', 'consultant'],
    },
    {
      name: 'follow-share', theme: 'light', accent: 'neon', qrCaption: 'Scan to visit',
      url: SITE + '/?' + utm('follow-share'),
      eyebrow: 'FOLLOW & SHARE',
      lines: ['Like the work?', 'Follow us and', 'share the link.'],
      sub: 'It costs nothing and helps a small business get found.',
      bullets: ['facebook.com/Elevven11Studio', 'linkedin.com/company/elevven11-studio'],
      fan: ['photographer', 'events', 'logistics'],
    },
  ];

  for (const p of PAGES) {
    await sharp(Buffer.from(pagePromo(p)))
      .composite([await qrLayer(p.url), ...(p.fan ? await phoneFan(p.fan) : [])])
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT, p.name + '.png'));
  }
  console.log('page promos: ' + PAGES.map((p) => p.name).join(', '));

  const slugs = fs.readdirSync(path.join(ROOT, 'examples'), { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name);

  const missing = [];
  let made = 0;

  for (const [i, slug] of slugs.entries()) {
    const shot = path.join(MOBILE, slug + '.jpg');
    if (!fs.existsSync(shot)) { missing.push(slug); continue; }

    const html = fs.readFileSync(path.join(ROOT, 'examples', slug, 'index.html'), 'utf8');
    const title = (html.match(/<title>([^<]*)<\/title>/) || [, ''])[1];
    const desc = (html.match(/name="description" content="([^"]*)"/) || [, ''])[1];
    const business = title.split(EMDASH)[0].trim() || slug;
    const styleMatch = desc.match(/\(Style ([ABC])\)/);
    const industry = (desc.split(/\s+template demo/i)[0] || 'Website')
      .replace(/\s*\(Style [ABC]\)/, '').trim();

    const screen = await roundRect(
      await (async () => {
        const m = await sharp(shot).metadata();
        return sharp(shot)
          .extract({ left: 0, top: RIBBON_M, width: m.width, height: m.height - RIBBON_M })
          .resize(SCREEN.w, SCREEN.h, { fit: 'cover', position: 'top' })
          .png().toBuffer();
      })(),
      SCREEN.w, SCREEN.h, 30);

    await sharp(Buffer.from(demoPromo({
      business, industry,
      style: 'Style ' + (styleMatch ? styleMatch[1] : 'A'),
      theme: i % 2 === 0 ? 'dark' : 'light',
      thumbUri: 'data:image/jpeg;base64,' + (await sharp(path.join(PREVIEWS, slug + '.webp'))
        .jpeg({ quality: 82 }).toBuffer()).toString('base64'),
    })))
      .composite([{ input: screen, left: PHONE.x + PHONE.bezel, top: PHONE.y + PHONE.bezel }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT, 'demos', slug + '.png'));
    made++;
  }

  const size = (p) => fs.statSync(p).size;
  const bytes = PAGES.map((p) => size(path.join(OUT, p.name + '.png')))
    .concat(fs.readdirSync(path.join(OUT, 'demos')).map((f) => size(path.join(OUT, 'demos', f))))
    .reduce((a, b) => a + b, 0);

  console.log('demo promos: ' + made);
  console.log('\nwrote ' + (PAGES.length + made) + ' promos at ' + S + 'x' + S
    + ', ' + (bytes / 1024 / 1024).toFixed(2) + ' MB');
  if (missing.length) {
    console.error('\nMISSING mobile capture for: ' + missing.join(', '));
    console.error('run `npm run previews` first');
    process.exitCode = 1;
  }
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
