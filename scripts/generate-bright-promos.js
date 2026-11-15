/**
 * Bright promos: a celebratory square, in the site palette, for every part of the studio.
 *
 *   promo/bright/<slug>.png   1080x1080, one per subject in bright-promos-data.js
 *
 * A separate set, written to its own folder. Nothing in promo/*.png,
 * promo/carousel or promo/flyers is touched.
 *
 * Layout: wordmark (no icon), eyebrow pill, two-tone headline, short paragraph, four chips,
 * and a cream card holding the QR. A tilted card carries one short
 * word, over layered brand shapes and confetti.
 *
 *   cd scripts && npm install && npm run bright
 *   node generate-bright-promos.js pricing agents   (just those)
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { SITE, esc, qrPng, render, defs } = require('./promo-kit');
const SUBJECTS = require('./bright-promos-data');

const OUT = path.resolve(__dirname, '..', 'promo/bright');
const S = 1080;
const M = 72;

// The site's own palette (assets/style.css), so these sit with the rest of
// the brand: near-black ground, cream type, green accent, champagne gold.
const C = {
  bg: '#0b0a10', card: '#15121d', cream: '#f7f3ec', muted: '#a79f95', ink: '#14121a',
  green: '#22c55e', mint: '#86efac', deep: '#137a40', teal: '#2dd4bf', gold: '#f0c866',
  coral: '#f08a6c', line: 'rgba(247,243,236,0.17)'
};
const CONFETTI = [C.mint, C.green, C.gold, C.teal, C.cream, C.coral];

// Accent per subject, matching the existing promos: extensions keep their own
// colours, the referral programme is gold, everything else is the site green.
// `pop` is the small gold-ish highlight, `second` the contrasting square.
const THEMES = {
  green: { from: '#86efac', to: '#22c55e', deep: '#137a40', pop: '#f0c866', second: '#2dd4bf' },
  gold: { from: '#f0c866', to: '#c99a2e', deep: '#8a6a1c', pop: '#86efac', second: '#2dd4bf' },
  sky: { from: '#38bdf8', to: '#0ea5e9', deep: '#0b6a96', pop: '#f0c866', second: '#a78bfa' },
  violet: { from: '#a78bfa', to: '#8b5cf6', deep: '#5b3fb5', pop: '#f0c866', second: '#2dd4bf' },
  teal: { from: '#2dd4bf', to: '#14b8a6', deep: '#0d7d72', pop: '#f0c866', second: '#fb923c' },
  orange: { from: '#fb923c', to: '#f97316', deep: '#a8480c', pop: '#f0c866', second: '#2dd4bf' }
};
let themeDefs = '';

// Points the shared palette at a subject's accent and returns the SVG defs.
function applyTheme(p) {
  const t = THEMES[p.theme || 'green'];
  Object.assign(C, { mint: t.from, green: t.to, deep: t.deep, gold: t.pop, teal: t.second });
  CONFETTI.splice(0, CONFETTI.length, t.from, t.to, t.pop, t.second, C.cream, C.coral);
  themeDefs = defs({ from: t.from, to: t.to, glow: t.from });
  return themeDefs;
}

// Rough Segoe UI advance widths, as a fraction of the font size. Good enough
// to size pills and wrap lines; nothing here needs to be pixel exact.
function textW(text, size, weight = 1) {
  let w = 0;
  for (const ch of String(text)) {
    if (" .,:;'!|il".includes(ch)) w += 0.27;
    else if ('fjrtI-'.includes(ch)) w += 0.36;
    else if ('mwMW'.includes(ch)) w += 0.86;
    else if (ch >= 'A' && ch <= 'Z') w += 0.66;
    else w += 0.55;
  }
  return w * size * weight;
}

function wrap(text, size, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? line + ' ' + word : word;
    if (line && textW(next, size) > max) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// Seeded so a subject's confetti is the same on every run.
function rng(seed) {
  let a = 0;
  for (const ch of seed) a = (Math.imul(a, 31) + ch.charCodeAt(0)) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function piece(r, x, y, scale = 1) {
  const col = CONFETTI[Math.floor(r() * CONFETTI.length)];
  const rot = Math.round(r() * 360);
  const kind = r();
  const at = 'transform="translate(' + x.toFixed(0) + ' ' + y.toFixed(0) + ') rotate(' + rot + ') scale(' + scale + ')"';
  if (kind < 0.5) return '<rect ' + at + ' x="-5" y="-11" width="10" height="22" rx="2" fill="' + col + '"/>';
  if (kind < 0.75) return '<circle ' + at + ' r="7" fill="' + col + '"/>';
  return '<path ' + at + ' d="M-12 0A12 12 0 0 0 12 0" fill="none" stroke="' + col + '" stroke-width="5" stroke-linecap="round"/>';
}

function confetti(slug) {
  const r = rng(slug);
  let out = '';
  for (let i = 0; i < 16; i++) out += piece(r, 500 + r() * 540, 44 + r() * 130);
  for (let i = 0; i < 20; i++) {
    const x = 720 + r() * 320, y = 200 + r() * 420;
    if (x > 660 && y > 380 && y < 700) continue; // leave the mockup clear
    out += piece(r, x, y, 0.9);
  }
  for (let i = 0; i < 18; i++) {
    const ang = (-165 + r() * 150) * Math.PI / 180, d = 150 + r() * 130;
    out += piece(r, 860 + Math.cos(ang) * d, 850 + Math.sin(ang) * d, 0.8);
  }
  return out;
}

// Own artwork: a tilted browser-style card carrying the subject word, over
// layered brand shapes with a soft glow.
function shapes() {
  return '<circle cx="1010" cy="1010" r="250" fill="url(#accent)"/>'
    + '<circle cx="1010" cy="1010" r="168" fill="' + C.deep + '" opacity="0.9"/>'
    + '<circle cx="800" cy="318" r="62" fill="' + C.gold + '"/>'
    + '<circle cx="990" cy="760" r="34" fill="none" stroke="' + C.coral + '" stroke-width="10"/>'
    + '<rect x="700" y="690" width="150" height="150" rx="34" fill="' + C.teal + '" opacity="0.85" transform="rotate(14 775 765)"/>';
}

function tile(word, x = 850, y = 530, scale = 1, rot = -6) {
  const size = Math.min(84, Math.floor(250 / Math.max(1, textW(word, 1, 1.1))));
  return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + scale + ')">'
    + '<rect x="-170" y="-140" width="340" height="280" rx="26" fill="' + C.card + '" stroke="' + C.line + '" stroke-width="2"/>'
    + '<rect x="-170" y="-140" width="340" height="6" rx="3" fill="url(#accent)"/>'
    + '<rect x="-146" y="-104" width="292" height="104" rx="16" fill="url(#accent)"/>'
    + '<text x="0" y="' + (-52 + size * 0.36) + '" font-family="Segoe UI Black, Segoe UI, Arial, sans-serif" font-weight="900" font-size="'
    + size + '" fill="' + C.bg + '" text-anchor="middle">' + esc(word) + '</text>'
    + '<rect x="-146" y="26" width="200" height="12" rx="6" fill="' + C.cream + '" opacity="0.18"/>'
    + '<rect x="-146" y="50" width="150" height="12" rx="6" fill="' + C.cream + '" opacity="0.18"/>'
    + '<rect x="-146" y="84" width="104" height="30" rx="15" fill="' + C.gold + '"/>'
    + '</g>';
}

function chip(label, x, y) {
  const fsz = 24, h = 52;
  const w = Math.round(textW(label, fsz, 1.04) + 76);
  return {
    w,
    svg: '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="26" fill="' + C.cream + '" fill-opacity="0.06" stroke="' + C.line + '" stroke-width="2"/>'
      + '<circle cx="' + (x + 28) + '" cy="' + (y + 26) + '" r="7" fill="' + C.gold + '"/>'
      + '<text x="' + (x + 48) + '" y="' + (y + 34) + '" font-size="' + fsz + '" font-weight="600" fill="' + C.cream + '">' + esc(label) + '</text>'
  };
}

async function scene(p) {
  let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S + '" viewBox="0 0 ' + S + ' ' + S + '">'
    + applyTheme(p) + '<filter id="soft" x="-10%" y="-20%" width="120%" height="150%"><feGaussianBlur stdDeviation="14"/></filter>'
    + '<rect width="' + S + '" height="' + S + '" fill="' + C.bg + '"/>'
    + '<rect width="' + S + '" height="' + S + '" fill="url(#g1)"/>'
    + '<rect width="' + S + '" height="' + S + '" fill="url(#g2)"/>'
    + '<rect width="' + S + '" height="' + S + '" fill="url(#dots)"/>'
    + '<rect width="' + S + '" height="10" fill="url(#accent)"/>'
    + shapes() + confetti(p.slug) + tile(p.word)
    + '<g font-family="Segoe UI, Arial, sans-serif">';

  // Wordmark only, no icon
  svg += '<text x="' + M + '" y="116" font-family="Segoe UI Black, Segoe UI, Arial, sans-serif" font-weight="900" font-size="36" letter-spacing="1" fill="' + C.mint + '">ELEVVEN11 STUDIO</text>';

  // Eyebrow
  const eye = p.eyebrow.toUpperCase();
  const eyeW = Math.round(textW(eye, 22, 0.9) + eye.length * 3.2 + 72);
  svg += '<rect x="' + M + '" y="180" width="' + eyeW + '" height="52" rx="26" fill="' + C.cream + '" fill-opacity="0.06" stroke="' + C.line + '" stroke-width="2"/>'
    + '<circle cx="' + (M + 30) + '" cy="206" r="7" fill="' + C.mint + '"/>'
    + '<text x="' + (M + 52) + '" y="214" font-size="22" font-weight="600" letter-spacing="3.2" fill="' + C.cream + '">' + esc(eye) + '</text>';

  // Headline: each line is [dark, green]
  let size = 86;
  const widest = () => Math.max(...p.head.map(([a, b]) => textW(a + b, size, 1.16)));
  while (size > 60 && widest() > 600) size -= 2;
  let y = 256 + size * 0.86;
  for (const [dark, green] of p.head) {
    svg += '<text x="' + (M - 3) + '" y="' + y.toFixed(0) + '" font-family="Segoe UI Black, Segoe UI, Arial, sans-serif" font-weight="900" font-size="'
      + size + '" letter-spacing="-2" xml:space="preserve"><tspan fill="' + C.cream + '">' + esc(dark) + '</tspan><tspan fill="url(#accent)">'
      + esc(green) + '</tspan></text>';
    y += size * 1.06;
  }

  // Paragraph
  y += 2;
  for (const line of wrap(p.text, 30, 548)) {
    svg += '<text x="' + M + '" y="' + y.toFixed(0) + '" font-size="30" fill="' + C.muted + '">' + esc(line) + '</text>';
    y += 44;
  }

  // Chips, wrapped to stay clear of the artwork
  let cx = M, cy = y - 4;
  for (const label of p.chips) {
    let c = chip(label, cx, cy);
    if (cx > M && cx + c.w > 664) { cx = M; cy += 62; c = chip(label, cx, cy); }
    svg += c.svg;
    cx += c.w + 14;
  }
  if (cy + 52 > 776) { console.error(p.slug + ': copy runs into the QR card (' + (cy + 52) + ')'); process.exitCode = 1; }

  // QR card
  const cardY = 800, cardH = 216, cardW = 584, qr = 176;
  svg += '<rect x="' + (M + 6) + '" y="' + (cardY + 14) + '" width="' + (cardW - 12) + '" height="' + cardH + '" rx="30" fill="' + C.green + '" opacity="0.18" filter="url(#soft)"/>'
    + '<rect x="' + M + '" y="' + cardY + '" width="' + cardW + '" height="' + cardH + '" rx="30" fill="' + C.cream + '"/>'
    + '<rect x="' + (M + 14) + '" y="' + (cardY + 14) + '" width="188" height="188" rx="16" fill="#fff" stroke="rgba(20,18,26,0.12)" stroke-width="2"/>';
  const tx = M + 20 + qr + 36, tw = M + cardW - 24 - tx;
  const title = wrap(p.qrTitle, 32, tw / 1.1), note = wrap(p.qrText, 24, tw);
  let ty = cardY + cardH / 2 - (title.length * 38 + 8 + note.length * 32) / 2 + 30;
  for (const line of title) {
    svg += '<text x="' + tx + '" y="' + ty.toFixed(0) + '" font-size="32" font-weight="700" fill="' + C.ink + '">' + esc(line) + '</text>';
    ty += 38;
  }
  ty += 2;
  for (const line of note) {
    svg += '<text x="' + tx + '" y="' + ty.toFixed(0) + '" font-size="24" fill="#5d564b">' + esc(line) + '</text>';
    ty += 32;
  }
  svg += '</g></svg>';

  const url = SITE + p.path + '?utm_source=promo&utm_medium=qr&utm_campaign=bright-' + p.slug;
  return { svg, layers: [{ input: await qrPng(url, qr), left: M + 20, top: cardY + 20 }] };
}

module.exports = { C, S, M, textW, wrap, rng, piece, tile, applyTheme, currentDefs: () => themeDefs };

if (require.main === module) (async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SUBJECTS.filter((p) => only.includes(p.slug)) : SUBJECTS;
  fs.mkdirSync(OUT, { recursive: true });
  for (const p of list) {
    await render(await scene(p), path.join(OUT, p.slug + '.png'));
    console.log('promo/bright/' + p.slug + '.png');
  }
  console.log(list.length + ' bright promos written');
})().catch((e) => { console.error(e); process.exit(1); });
