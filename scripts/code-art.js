/**
 * Plain code design for the tech and programming posts (generate-tech.js).
 *
 * Flat and simple: a solid dark background, one accent colour per topic, a plain
 * icon on a flat square (or the big number in the accent colour), a small
 * `// tag` label, a heavy headline whose last line takes the accent, a readable
 * supporting line, and the joke after a `$` prompt. No gradients, glows, grids
 * or decoration.
 *
 * The picture size flexes to the text: long copy gets a smaller icon, short copy
 * a bigger one, so every slide is balanced.
 *
 * Same API as doodle-art.js (postSvg, reelCardSvg, reelCoverSvg, reelCtaSvg).
 * Fonts: Segoe UI Black (headlines), Segoe UI (body), Cascadia Code or Consolas
 * (labels). Measured widths: Black 0.49 em, Regular 0.43 em, Cascadia 0.585 em.
 */

const sharp = require('sharp');
const { SITE, esc, MOTIFS, wrapW } = require('./fact-art');

const BLACK = "'Segoe UI Black', 'Segoe UI', Arial, sans-serif";
const SANS = "'Segoe UI', Arial, sans-serif";
const MONO = "'Cascadia Code', Consolas, 'Courier New', monospace";

const C = {
  bg: '#0b0f17', tile: '#141c2b', line: '#2a3550', text: '#f3f6fb', body: '#b4bfd0', dim: '#7a879d', paper: '#eef3fb',
};

// One pair per topic: the accent and a second colour for icons.
const ACCENTS = [
  ['#38d6ff', '#8b7bff'], ['#b6ff4d', '#38d6ff'], ['#ff5fd2', '#ffb347'],
  ['#ffb347', '#ff5f7a'], ['#8b7bff', '#38d6ff'], ['#4dffb5', '#38d6ff'],
];

const K = { head: 0.53, body: 0.47, bold: 0.5 };

const W = 1080;
const BAND = 1350;
const REEL_H = 1920;
const YOFF = 240;
const TOTAL = 12;
const MX = 64;          // side margin
const CW = W - MX * 2;  // content width

const DIM = {
  post: { H: 1080, topY: 130, limit: 980, footY: 1034, head: [74, 66, 58], fact: [31, 28], joke: 36, pl: 50, tileMin: 180, tileMax: 330, statMax: 210 },
  reel: { H: BAND, topY: 140, limit: 1196, footY: 1308, progY: 1236, head: [90, 80, 70], fact: [37, 34, 31], joke: 42, pl: 56, tileMin: 230, tileMax: 440, statMax: 270 },
};

/* ---------------- helpers ---------------- */

const f1 = (n) => Number(n).toFixed(1);

// Real widths of the big numbers and words, in em, measured once by prepare():
// capitals, W and M are far wider than an average letter.
const statEm = new Map();

async function prepare(strings) {
  for (const s of new Set(strings)) {
    if (statEm.has(s)) continue;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="300"><rect width="3000" height="300" fill="#fff"/><text x="20" y="200" font-size="100" font-family="${BLACK}" fill="#000">${esc(s)}</text></svg>`;
    const { info } = await sharp(Buffer.from(svg)).trim({ background: '#fff', threshold: 10 }).toBuffer({ resolveWithObject: true });
    statEm.set(s, info.width / 100);
  }
}

const statWidth = (s, size) => (statEm.get(s) || s.length * 0.62) * size;

function wrapB(text, maxW, size, k) {
  const base = wrapW(text, maxW, size, k);
  if (base.length < 2 || base[base.length - 1].includes(' ')) return base;
  for (let w = maxW - 30; w > maxW * 0.6; w -= 30) {
    const t = wrapW(text, w, size, k);
    if (t.length === base.length && t[t.length - 1].includes(' ')) return t;
  }
  return base;
}

function t(x, y, s, size, o = {}) {
  const { font = SANS, fill = C.text, anchor = 'start', weight = 400, opacity = 1, ls = 0 } = o;
  return `<text x="${x}" y="${f1(y)}" font-size="${size}" font-family="${font}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"`
    + (opacity < 1 ? ` opacity="${opacity}"` : '') + (ls ? ` letter-spacing="${ls}"` : '') + `>${esc(s)}</text>`;
}

// ti picks the accent pair; every slide of a topic shares it.
const look = (ti) => { const [a, b] = ACCENTS[ti % ACCENTS.length]; return { a, b }; };

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ---------------- canvas and chrome ---------------- */

function doc(canvasH, offsetY, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${canvasH}" viewBox="0 0 ${W} ${canvasH}">`
    + `<rect width="${W}" height="${canvasH}" fill="${C.bg}"/><g transform="translate(0 ${offsetY})">${body}</g></svg>`;
}

const topRow = (a, left, right) =>
  t(MX, 92, left, 24, { font: MONO, fill: C.dim })
  + t(W - MX, 92, right, 24, { font: MONO, fill: a, anchor: 'end', weight: 700 });

const footer = (a, y) =>
  `<rect x="${MX}" y="${y - 46}" width="${CW}" height="2" fill="${C.line}"/>`
  + t(MX, y, 'Elevven11 Studio', 27, { weight: 700 })
  + t(W - MX, y, SITE, 22, { font: MONO, fill: C.dim, anchor: 'end' });

function progress(a, idx, y) {
  const w = 36, gap = 10;
  const x0 = 540 - (TOTAL * w + (TOTAL - 1) * gap) / 2;
  let out = '';
  for (let i = 0; i < TOTAL; i++) out += `<rect x="${x0 + i * (w + gap)}" y="${y}" width="${w}" height="6" rx="3" fill="${i === idx ? a : C.line}"/>`;
  return out;
}

/* ---------------- picture ---------------- */

// A plain icon on a flat square, or just the big number in the accent colour.
function picture(p, a, b, cx, cy, size, statMax) {
  if (p.stat) {
    const fs = Math.min(statMax, Math.floor(920 / statWidth(p.stat, 1)), Math.floor(size * 0.95));
    return t(cx, cy + fs * 0.34, p.stat, fs, { font: BLACK, fill: a, anchor: 'middle' });
  }
  if (!MOTIFS[p.motif]) throw new Error('No motif: ' + p.motif);
  const x = cx - size / 2, y = cy - size / 2;
  const mp = { line: C.tile, paper: C.paper, accent: a, pop: b, bg: C.tile, text: C.paper, shadow: C.tile };
  return `<rect x="${f1(x)}" y="${f1(y)}" width="${size}" height="${size}" rx="${f1(size * 0.14)}" fill="${C.tile}" stroke="${C.line}" stroke-width="2"/>`
    + `<g transform="translate(${cx} ${f1(cy - size * 0.02)}) scale(${f1((size * 0.7) / 260)})">${MOTIFS[p.motif](mp)}</g>`;
}

/* ---------------- fact or joke card ---------------- */

function plan(p, d) {
  for (const hs of d.head) {
    for (const fs of d.fact) {
      const head = wrapB(p.hook, CW, hs, K.head);
      const fact = wrapB(p.fact, CW, fs, K.body);
      const joke = wrapB(p.punch, CW - 60, d.joke, K.bold);
      if (head.length > 3 || fact.length > 3 || joke.length > 2) continue;
      const step = Math.round(hs * 1.08);
      const lh = Math.round(fs * 1.42);
      const jokeH = joke.length * d.pl;
      const textH = 50 + head.length * step + 22 + fact.length * lh + 34 + jokeH;
      const avail = d.limit - d.topY - textH - 26;
      if (avail < d.tileMin) continue;
      return { hs, fs, head, fact, joke, step, lh, jokeH, avail, tile: Math.min(d.tileMax, avail) };
    }
  }
  throw new Error('Does not fit: ' + p.hook);
}

function cardBody(p, d, ti, si, left, right, tag, extra = '') {
  const { a, b } = look(ti);
  const L = plan(p, d);
  const tileCy = d.topY + L.avail / 2;
  const textTop = d.topY + L.avail + 26;

  const eyebrow = t(MX, textTop + 28, '// ' + tag.toLowerCase(), 25, { font: MONO, fill: a, weight: 700 });
  const h0 = textTop + 50 + L.hs * 0.82;
  const head = L.head.map((s, k) => t(MX, h0 + k * L.step, s, L.hs, { font: BLACK, fill: k === L.head.length - 1 ? a : C.text })).join('');
  const f0 = h0 + (L.head.length - 1) * L.step + L.hs * 0.22 + 22 + L.fs * 0.78;
  const fact = L.fact.map((s, k) => t(MX, f0 + k * L.lh, s, L.fs, { fill: C.body })).join('');
  const j0 = f0 + (L.fact.length - 1) * L.lh + L.fs * 0.3 + 34 + d.joke * 0.78;
  const joke = `<rect x="${MX}" y="${f1(j0 - d.joke * 0.86)}" width="6" height="${f1(L.jokeH - d.pl + d.joke * 1.08)}" rx="3" fill="${a}"/>`
    + L.joke.map((s, k) => t(MX + 30, j0 + k * d.pl, s, d.joke, { weight: 700 })).join('');

  return topRow(a, left, right) + picture(p, a, b, 540, tileCy, L.tile, d.statMax)
    + eyebrow + head + fact + joke + extra + footer(a, d.footY);
}

/* ---------------- public: posts ---------------- */

function postSvg(p, i, ti = 0) {
  const body = cardBody(p, DIM.post, ti, i, '~/elevven11/tech/' + slug(p.tag), '#' + String(i + 1).padStart(2, '0'), p.tag);
  return doc(DIM.post.H, 0, body);
}

/* ---------------- public: reel slides ---------------- */

function reelCardSvg(topic, p, si, ti) {
  const { a } = look(ti);
  const d = DIM.reel;
  const body = cardBody(p, d, ti, si, '~/elevven11/' + topic.slug, String(si).padStart(2, '0') + '/10', topic.tag, progress(a, si, d.progY));
  return doc(REEL_H, YOFF, body);
}

function reelCoverSvg(topic, ti) {
  const { a, b } = look(ti);
  const d = DIM.reel;
  const [l1, l2] = topic.cover.title;
  const s1 = Math.min(138, Math.floor(CW / (l1.length * 0.66)));
  const s2 = Math.min(138, Math.floor(CW / (l2.length * 0.66)));
  const y1 = 770;
  const y2 = y1 + Math.round(s2 * 1.04);
  const sub = wrapB(topic.cover.sub, CW, 36, K.body).slice(0, 2);
  const subY = y2 + 64;
  const btnY = subY + (sub.length - 1) * 50 + 52;

  const body = topRow(a, '~/elevven11/' + topic.slug, topic.kind === 'comedy' ? '10 laughs' : '10 facts')
    + picture({ motif: topic.cover.motif }, a, b, 540, 388, 400, d.statMax)
    + t(MX, y1, l1, s1, { font: BLACK }) + t(MX, y2, l2, s2, { font: BLACK, fill: a })
    + sub.map((s, k) => t(MX, subY + k * 50, s, 36, { fill: C.body })).join('')
    + `<rect x="${MX + 1.5}" y="${btnY}" width="290" height="70" rx="35" fill="none" stroke="${a}" stroke-width="3"/>`
    + t(MX + 46, btnY + 46, 'swipe', 32, { font: MONO, fill: a, weight: 700 })
    + `<path d="M${MX + 196} ${btnY + 35} H${MX + 246} M${MX + 228} ${btnY + 18} L${MX + 247} ${btnY + 35} L${MX + 228} ${btnY + 52}" fill="none" stroke="${a}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
    + progress(a, 0, d.progY) + footer(a, d.footY);
  return doc(REEL_H, YOFF, body);
}

function reelCtaSvg(topic, ti) {
  const { a, b } = look(ti);
  const d = DIM.reel;
  const head = topic.cta.head.map((s, k) => t(MX, 770 + k * 96, s, 84, { font: BLACK, fill: k === topic.cta.head.length - 1 ? a : C.text })).join('');
  const subY = 770 + (topic.cta.head.length - 1) * 96 + 70;
  const label = '$ open ' + SITE;
  const bw = Math.min(CW, Math.ceil(label.length * 31 * 0.585) + 80);

  const body = topRow(a, '~/elevven11/' + topic.slug, 'the end')
    + picture({ motif: 'laptop' }, a, b, 540, 360, 360, d.statMax)
    + head + t(MX, subY, topic.cta.sub, 36, { fill: C.body })
    + `<rect x="${MX}" y="${subY + 56}" width="${bw}" height="100" rx="50" fill="${a}"/>`
    + t(MX + bw / 2, subY + 56 + 65, label, 31, { font: MONO, fill: C.bg, anchor: 'middle', weight: 700 })
    + progress(a, 11, d.progY) + footer(a, d.footY);
  return doc(REEL_H, YOFF, body);
}

module.exports = { prepare, postSvg, reelCardSvg, reelCoverSvg, reelCtaSvg, BAND, REEL_H, YOFF, W, TOTAL, SITE };
