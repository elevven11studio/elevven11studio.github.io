/**
 * Bright carousels: five 1080x1080 slides per subject, in the same style as
 * the bright promos and built from the same copy and accents
 * (bright-promos-data.js).
 *
 *   promo/bright/carousel/<slug>/1..5.png
 *
 *   1 cover         headline and a "swipe" cue
 *   2 the pitch     the paragraph, large
 *   3 what you get  the chips, as a list
 *   4 the visual    the tilted card, big, with the headline as a caption
 *   5 the ask       QR code and the call to action
 *
 * Post all five together as one carousel. Nothing outside
 * promo/bright/carousel is written.
 *
 *   cd scripts && npm run bright-carousels
 *   node generate-bright-carousels.js pricing agents   (just those)
 */
const fs = require('fs');
const path = require('path');
const { SITE, esc, qrPng, render } = require('./promo-kit');
const { C, S, M, textW, wrap, rng, piece, tile, applyTheme, currentDefs } = require('./generate-bright-promos');
const SUBJECTS = require('./bright-promos-data');

const OUT = path.resolve(__dirname, '..', 'promo/bright/carousel');
const N = 5;
const BLACK = 'font-family="Segoe UI Black, Segoe UI, Arial, sans-serif" font-weight="900"';

function confetti(slug, n, box, skip) {
  const r = rng(slug + n + box.join());
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]);
    const piece_ = piece(r, x, y, 0.9);
    if (skip && x > skip[0] && x < skip[2] && y > skip[1] && y < skip[3]) continue;
    out += piece_;
  }
  return out;
}

function eyebrow(text, y = 180) {
  const eye = text.toUpperCase();
  const w = Math.round(textW(eye, 22, 0.9) + eye.length * 3.2 + 72);
  return '<rect x="' + M + '" y="' + y + '" width="' + w + '" height="52" rx="26" fill="' + C.cream + '" fill-opacity="0.06" stroke="' + C.line + '" stroke-width="2"/>'
    + '<circle cx="' + (M + 30) + '" cy="' + (y + 26) + '" r="7" fill="' + C.mint + '"/>'
    + '<text x="' + (M + 52) + '" y="' + (y + 34) + '" font-size="22" font-weight="600" letter-spacing="3.2" fill="' + C.cream + '">' + esc(eye) + '</text>';
}

const lineSpans = (p) => p.head.map(([a, b]) => '<tspan fill="' + C.cream + '">' + esc(a) + '</tspan><tspan fill="url(#accent)">' + esc(b) + '</tspan>');

// Frame shared by every slide: ground, wordmark, counter, progress bars.
function frame(i, art, body) {
  let bars = '', x = M;
  for (let k = 1; k <= N; k++) {
    const on = k === i, w = on ? 56 : 24;
    bars += '<rect x="' + x + '" y="1034" width="' + w + '" height="8" rx="4" fill="' + (on ? C.green : C.cream) + '" opacity="' + (on ? 1 : 0.22) + '"/>';
    x += w + 10;
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S + '" viewBox="0 0 ' + S + ' ' + S + '">'
    + currentDefs() + '<filter id="soft" x="-10%" y="-20%" width="120%" height="150%"><feGaussianBlur stdDeviation="14"/></filter>'
    + '<rect width="' + S + '" height="' + S + '" fill="' + C.bg + '"/>'
    + '<rect width="' + S + '" height="' + S + '" fill="url(#g1)"/><rect width="' + S + '" height="' + S + '" fill="url(#g2)"/>'
    + '<rect width="' + S + '" height="' + S + '" fill="url(#dots)"/><rect width="' + S + '" height="10" fill="url(#accent)"/>'
    + art
    + '<g font-family="Segoe UI, Arial, sans-serif">'
    + '<text x="' + M + '" y="116" ' + BLACK + ' font-size="36" letter-spacing="1" fill="' + C.mint + '">ELEVVEN11 STUDIO</text>'
    + '<text x="' + (S - M) + '" y="114" font-size="28" font-weight="600" letter-spacing="2" fill="' + C.muted + '" text-anchor="end">' + i + ' / ' + N + '</text>'
    + body + bars + '</g></svg>';
}

const corner = (r) => '<circle cx="1040" cy="1040" r="' + r + '" fill="url(#accent)"/>'
  + '<circle cx="1040" cy="1040" r="' + Math.round(r * 0.66) + '" fill="' + C.deep + '" opacity="0.9"/>';

function cover(p) {
  let size = 120;
  const widest = () => Math.max(...p.head.map(([a, b]) => textW(a + b, size, 1.16)));
  while (size > 70 && widest() > 900) size -= 2;
  let body = eyebrow(p.eyebrow), y = 268 + size * 0.86;
  lineSpans(p).forEach((sp) => {
    body += '<text x="' + (M - 3) + '" y="' + y.toFixed(0) + '" ' + BLACK + ' font-size="' + size + '" letter-spacing="-2" xml:space="preserve">' + sp + '</text>';
    y += size * 1.04;
  });
  const sw = 214;
  body += '<rect x="' + M + '" y="930" width="' + sw + '" height="64" rx="32" fill="url(#accent)"/>'
    + '<text x="' + (M + sw / 2) + '" y="972" font-size="26" font-weight="800" letter-spacing="3" fill="' + C.bg + '" text-anchor="middle">SWIPE  →</text>';
  const art = corner(240)
    + '<circle cx="880" cy="500" r="56" fill="' + C.gold + '"/>'
    + '<rect x="640" y="860" width="130" height="130" rx="30" fill="' + C.teal + '" opacity="0.85" transform="rotate(14 705 925)"/>'
    + '<circle cx="580" cy="700" r="30" fill="none" stroke="' + C.coral + '" stroke-width="9"/>'
    + confetti(p.slug, 34, [420, 150, 1040, 560], [60, 170, 960, 560]) + tile(p.word, 790, 760, 1.15, -6);
  return frame(1, art, body);
}

function pitch(p) {
  let body = eyebrow(p.eyebrow), y = 360;
  for (const line of wrap(p.text, 52, 900)) {
    body += '<text x="' + M + '" y="' + y + '" font-size="52" font-weight="600" fill="' + C.cream + '">' + esc(line) + '</text>';
    y += 76;
  }
  body += '<rect x="' + M + '" y="' + (y - 20) + '" width="120" height="8" rx="4" fill="url(#accent)"/>';
  const art = corner(170) + '<circle cx="930" cy="760" r="44" fill="' + C.gold + '"/>'
    + '<rect x="740" y="880" width="110" height="110" rx="26" fill="' + C.teal + '" opacity="0.85" transform="rotate(12 795 935)"/>'
    + confetti(p.slug, 26, [600, 600, 1040, 1000]);
  return frame(2, art, body);
}

function items(p) {
  const rowH = 132, cardH = p.chips.length * rowH + 48, cardY = 270;
  let body = eyebrow(p.eyebrow)
    + '<rect x="' + M + '" y="' + cardY + '" width="936" height="' + cardH + '" rx="30" fill="' + C.card + '" stroke="' + C.line + '" stroke-width="2"/>'
    + '<rect x="' + M + '" y="' + cardY + '" width="936" height="6" rx="3" fill="url(#accent)"/>';
  p.chips.forEach((label, k) => {
    const cy = cardY + 24 + k * rowH + rowH / 2;
    if (k) body += '<line x1="' + (M + 40) + '" y1="' + (cardY + 24 + k * rowH) + '" x2="' + (M + 896) + '" y2="' + (cardY + 24 + k * rowH) + '" stroke="' + C.line + '"/>';
    body += '<circle cx="' + (M + 64) + '" cy="' + cy + '" r="14" fill="' + C.gold + '"/>'
      + '<text x="' + (M + 112) + '" y="' + (cy + 16) + '" font-size="48" font-weight="700" fill="' + C.cream + '">' + esc(label) + '</text>';
  });
  const art = '<circle cx="1040" cy="1060" r="150" fill="url(#accent)" opacity="0.9"/>' + confetti(p.slug, 20, [700, 150, 1040, 260]);
  return frame(3, art, body);
}

function visual(p) {
  const text = p.head.map(([a, b]) => a + b).join(' ');
  let size = 64;
  while (size > 36 && textW(text, size, 1.16) > 900) size -= 2;
  const spans = lineSpans(p).join('<tspan> </tspan>');
  const body = '<text x="' + (S / 2) + '" y="900" ' + BLACK + ' font-size="' + size + '" letter-spacing="-1" text-anchor="middle" xml:space="preserve">' + spans + '</text>';
  const art = '<circle cx="190" cy="800" r="64" fill="' + C.gold + '"/>'
    + '<rect x="800" y="210" width="130" height="130" rx="30" fill="' + C.teal + '" opacity="0.85" transform="rotate(14 865 275)"/>'
    + '<circle cx="880" cy="760" r="32" fill="none" stroke="' + C.coral + '" stroke-width="9"/>'
    + corner(160) + confetti(p.slug, 44, [60, 180, 1020, 820], [210, 300, 870, 760]) + tile(p.word, 540, 520, 1.75, -5);
  return frame(4, art, body);
}

async function cta(p) {
  let body = '', y = 270;
  for (const line of wrap(p.qrTitle, 76, 900)) {
    body += '<text x="' + M + '" y="' + (y + 60) + '" ' + BLACK + ' font-size="76" letter-spacing="-1" fill="' + C.cream + '">' + esc(line) + '</text>';
    y += 84;
  }
  y += 10;
  for (const line of wrap(p.qrText, 34, 900)) {
    body += '<text x="' + M + '" y="' + (y + 44) + '" font-size="34" fill="' + C.muted + '">' + esc(line) + '</text>';
    y += 46;
  }
  const side = 400, cy = Math.max(520, y + 50), cx = (S - side) / 2;
  if (cy + side > 960) { console.error(p.slug + ': slide 5 runs long (' + (cy + side) + ')'); process.exitCode = 1; }
  body += '<rect x="' + (cx + 6) + '" y="' + (cy + 14) + '" width="' + (side - 12) + '" height="' + side + '" rx="34" fill="' + C.green + '" opacity="0.2" filter="url(#soft)"/>'
    + '<rect x="' + cx + '" y="' + cy + '" width="' + side + '" height="' + side + '" rx="34" fill="' + C.cream + '"/>'
    + '<rect x="' + (cx + 24) + '" y="' + (cy + 24) + '" width="352" height="352" rx="18" fill="#fff"/>'
    + '<text x="' + (S / 2) + '" y="' + (cy + side + 44) + '" font-size="26" font-weight="600" letter-spacing="1" fill="' + C.muted + '" text-anchor="middle">elevven11studio.github.io</text>';
  const art = corner(150) + '<circle cx="110" cy="860" r="44" fill="' + C.gold + '"/>' + confetti(p.slug, 24, [40, 150, 1040, 560], [40, 170, 1040, 500]);
  const url = SITE + p.path + '?utm_source=promo&utm_medium=carousel&utm_campaign=bright-' + p.slug;
  return { svg: frame(5, art, body), layers: [{ input: await qrPng(url, 304), left: cx + 48, top: cy + 48 }] };
}

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? SUBJECTS.filter((p) => only.includes(p.slug)) : SUBJECTS;
  for (const p of list) {
    applyTheme(p);
    const dir = path.join(OUT, p.slug);
    fs.mkdirSync(dir, { recursive: true });
    const slides = [{ svg: cover(p), layers: [] }, { svg: pitch(p), layers: [] }, { svg: items(p), layers: [] }, { svg: visual(p), layers: [] }, await cta(p)];
    for (let i = 0; i < slides.length; i++) await render(slides[i], path.join(dir, (i + 1) + '.png'));
    console.log('promo/bright/carousel/' + p.slug + '/1-5.png');
  }
  console.log(list.length + ' carousels written');
})().catch((e) => { console.error(e); process.exit(1); });
