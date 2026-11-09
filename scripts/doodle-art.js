/**
 * Doodle style for the social post generators (generate-doodle-posts.js and
 * generate-doodle-reels.js). Everything looks hand drawn: notebook paper, a
 * wobble filter on every outline, marker lettering, a sticky note for the joke,
 * washi tape and scribbled stars, spirals and hearts.
 *
 * The pictures are the same MOTIFS the sticker generators use (fact-art.js),
 * redrawn here with ink outlines and marker fills. The wobble filter is what
 * turns clean shapes into doodles, so any new motif looks right with no extra
 * work.
 *
 * Needs a handwriting font. Ink Free and Segoe Print ship with Windows; the
 * font stacks below fall back to Comic Sans and then to any cursive face.
 * Character widths used for wrapping were measured for Ink Free (0.42 em) and
 * Segoe Print (0.51 em), plus a little headroom.
 */

const { SITE, esc, MOTIFS, starPoints, wrapW } = require('./fact-art');

const HEAD = "'Ink Free', 'Segoe Print', 'Comic Sans MS', cursive";
const BODY = "'Segoe Print', 'Ink Free', 'Comic Sans MS', cursive";
const INK = '#1d2433';
const MARKERS = ['#ffe45e', '#ff8fb1', '#6ec1ff', '#7be0a0', '#ffb066', '#b79cff'];

const PAPERS = [
  { bg: '#fffaf0', pat: 'grid', line: '#9ec9ee' },
  { bg: '#f6fbff', pat: 'ruled', line: '#a9cdee' },
  { bg: '#fff6fa', pat: 'dots', line: '#e8a9c3' },
  { bg: '#f4fff7', pat: 'grid', line: '#a8dfb8' },
  { bg: '#fffaea', pat: 'ruled', line: '#e8cf8f' },
  { bg: '#f8f5ff', pat: 'dots', line: '#bba9e8' },
];

const K = { head: 0.46, body: 0.54, punch: 0.46 };

const W = 1080;
const BAND = 1350;     // 4:5 design area for reel slides
const REEL_H = 1920;
const YOFF = 240;      // where the band starts on the reel canvas
const TOTAL = 12;      // slides per reel set, for the progress dots

// Two canvases share one layout engine; only the numbers differ.
const DIM = {
  post: { H: 1080, cy: 290, rx: 228, ry: 186, motif: 1.1, statMax: 190, statW: 860,
    head: [74, 66, 58], fact: [27], punch: 38, pl: 48, y0: 566, limit: 1004, footY: 1050 },
  reel: { H: BAND, cy: 430, rx: 290, ry: 238, motif: 1.42, statMax: 240, statW: 900,
    head: [86, 76, 66], fact: [33, 30], punch: 42, pl: 52, y0: 770, limit: 1205, footY: 1318 },
};

/* ---------------- small helpers ---------------- */

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Like wrapW, but never leaves a single word alone on the last line.
function wrapB(text, maxW, size, k) {
  const base = wrapW(text, maxW, size, k);
  if (base.length < 2 || base[base.length - 1].includes(' ')) return base;
  for (let w = maxW - 30; w > maxW * 0.6; w -= 30) {
    const t = wrapW(text, w, size, k);
    if (t.length === base.length && t[t.length - 1].includes(' ')) return t;
  }
  return base;
}

const sk = (w = 6) => `stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const f1 = (n) => Number(n).toFixed(1);

// Ink Free has one weight, so a stroke in the text colour fakes a marker nib.
function tx(x, y, s, size, o = {}) {
  const { font = HEAD, fill = INK, anchor = 'start', rot = 0, bold = font === HEAD, opacity = 1 } = o;
  return `<text x="${x}" y="${y}" font-size="${size}" font-family="${font}" fill="${fill}" text-anchor="${anchor}"`
    + (bold ? ` stroke="${fill}" stroke-width="${f1(size * 0.028)}" stroke-linejoin="round"` : '')
    + (opacity < 1 ? ` opacity="${opacity}"` : '')
    + (rot ? ` transform="rotate(${rot} ${x} ${y})"` : '') + `>${esc(s)}</text>`;
}

function blob(cx, cy, rx, ry, seed, n = 9) {
  const r = rng(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const k = 0.86 + r() * 0.2;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = 'M' + mid(pts[n - 1], pts[0]).map(f1).join(' ');
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % n]);
    d += ` Q${f1(p[0])} ${f1(p[1])} ${f1(m[0])} ${f1(m[1])}`;
  }
  return d + ' Z';
}

/* ---------------- doodle decorations ---------------- */

const dStar = (x, y, s, col) => `<polygon points="${starPoints(x, y, s, s * 0.45, 5)}" fill="${col}" ${sk(5)}/>`;

function dSpiral(x, y, s, turns = 2.4) {
  let d = '';
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const a = t * turns * Math.PI * 2;
    d += (i ? 'L' : 'M') + f1(x + s * t * Math.cos(a)) + ' ' + f1(y + s * t * Math.sin(a));
  }
  return `<path d="${d}" fill="none" ${sk(5)}/>`;
}

function dSquig(x, y, w, col = INK) {
  let d = `M${x} ${y}`;
  for (let i = 0; i < Math.max(2, Math.round(w / 30)); i++) d += ` q15 ${i % 2 ? 20 : -20} 30 0`;
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round"/>`;
}

const dHeart = (x, y, s, col) => `<path transform="translate(${x} ${y}) scale(${s / 20})" d="M0 18 C-30 -6 -26 -34 0 -18 C26 -34 30 -6 0 18 Z" fill="${col}" stroke="${INK}" stroke-width="${f1((5 * 20) / s)}" stroke-linejoin="round"/>`;

const dRays = (cx, cy, r1, r2, n) => Array.from({ length: n }, (_, i) => {
  const a = (Math.PI * 2 * i) / n;
  return `<line x1="${f1(cx + r1 * Math.cos(a))}" y1="${f1(cy + r1 * Math.sin(a))}" x2="${f1(cx + r2 * Math.cos(a))}" y2="${f1(cy + r2 * Math.sin(a))}" ${sk(6)}/>`;
}).join('');

function dArrow(x1, y1, x2, y2, bend = 40) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const cx = (x1 + x2) / 2 - (dy / len) * bend, cy = (y1 + y2) / 2 + (dx / len) * bend;
  const a = Math.atan2(y2 - cy, x2 - cx), h = 24;
  const p = (g) => `${f1(x2 - h * Math.cos(a + g))} ${f1(y2 - h * Math.sin(a + g))}`;
  return `<path d="M${x1} ${y1} Q${f1(cx)} ${f1(cy)} ${x2} ${y2} M${p(0.55)} L${x2} ${y2} L${p(-0.55)}" fill="none" ${sk(7)}/>`;
}

function dTape(x, y, w, h, rot, col) {
  const z = 7, left = [], right = [];
  for (let i = 0; i <= 4; i++) {
    left.push(`${-w / 2 + (i % 2 ? z : 0)},${-h / 2 + (i * h) / 4}`);
    right.push(`${w / 2 - (i % 2 ? z : 0)},${h / 2 - (i * h) / 4}`);
  }
  return `<polygon transform="translate(${x} ${y}) rotate(${rot})" points="${left.join(' ')} ${right.join(' ')}" fill="${col}" opacity="0.85"/>`;
}

const swash = (x, y, w, h, col, rot = -1.2) =>
  `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" fill="${col}" opacity="0.72" transform="rotate(${rot} ${f1(x + w / 2)} ${f1(y + h / 2)})"/>`;

function stickyNote(x, y, w, h, rot, col) {
  const f = 30;
  return `<g transform="rotate(${rot} ${f1(x + w / 2)} ${f1(y + h / 2)})">`
    + `<polygon points="${x + 9},${y + 11} ${x + w + 9},${y + 11} ${x + w + 9},${y + h - f + 11} ${x + w - f + 9},${y + h + 11} ${x + 9},${y + h + 11}" fill="${INK}" opacity="0.14"/>`
    + `<polygon points="${x},${y} ${x + w},${y} ${x + w},${y + h - f} ${x + w - f},${y + h} ${x},${y + h}" fill="${col}" ${sk(5)}/>`
    + `<polygon points="${x + w - f},${y + h} ${x + w},${y + h - f} ${x + w - f},${y + h - f}" fill="#ffffff" opacity="0.6" ${sk(4)}/></g>`;
}

function pill(text, x, y, col) {
  const w = Math.round(text.length * 16 + 58);
  return `<g transform="rotate(-3 ${x} ${y + 30})"><g filter="url(#wobS)"><rect x="${x}" y="${y}" width="${w}" height="58" rx="29" fill="${col}" ${sk(5)}/></g>`
    + tx(x + w / 2, y + 40, text.toUpperCase(), 27, { anchor: 'middle' }) + '</g>';
}

/* ---------------- canvas ---------------- */

function defs(paper) {
  const pat = {
    grid: `<pattern id="paper" width="46" height="46" patternUnits="userSpaceOnUse"><path d="M46 0 H0 V46" fill="none" stroke="${paper.line}" stroke-width="2" opacity="0.6"/></pattern>`,
    ruled: `<pattern id="paper" width="46" height="46" patternUnits="userSpaceOnUse"><path d="M0 45 H46" fill="none" stroke="${paper.line}" stroke-width="2" opacity="0.7"/></pattern>`,
    dots: `<pattern id="paper" width="38" height="38" patternUnits="userSpaceOnUse"><circle cx="19" cy="19" r="3" fill="${paper.line}" opacity="0.75"/></pattern>`,
  }[paper.pat];
  return '<defs>'
    + '<filter id="wob" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>'
    + '<filter id="wobS" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>'
    + pat + '</defs>';
}

function doc(paper, canvasH, offsetY, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${canvasH}" viewBox="0 0 ${W} ${canvasH}">${defs(paper)}`
    + `<rect width="${W}" height="${canvasH}" fill="${paper.bg}"/><rect width="${W}" height="${canvasH}" fill="url(#paper)"/>`
    + `<g transform="translate(0 ${offsetY})">${body}</g></svg>`;
}

// Which colours and paper a slide gets. Neighbouring slides always differ.
function look(ti, si) {
  const n = MARKERS.length;
  const s = ti * 2 + si * 3;
  return {
    pal: { a: MARKERS[s % n], b: MARKERS[(s + 2) % n], c: MARKERS[(s + 4) % n] },
    paper: PAPERS[(ti + si) % PAPERS.length],
  };
}

/* ---------------- shared pieces ---------------- */

function picture(p, pal, d, seed, cy = d.cy, motifScale = d.motif, rx = d.rx, ry = d.ry) {
  const cx = 540;
  const mp = { line: INK, paper: '#ffffff', accent: pal.a, pop: pal.b, bg: '#ffffff', text: INK, shadow: INK };
  if (p.stat) {
    const size = Math.min(d.statMax, Math.floor(d.statW / (p.stat.length * 0.56)));
    const w = Math.min(d.statW + 80, p.stat.length * size * 0.56 + 110);
    return `<g filter="url(#wobS)">${swash(cx - w / 2, cy - size * 0.46, w, size * 0.7, pal.a, -3)}</g>`
      + tx(cx, cy + size * 0.27, p.stat, size, { anchor: 'middle', rot: -3 })
      + `<g filter="url(#wob)">${dSquig(cx - w / 2 + 34, cy + size * 0.55, w - 68, pal.b)}</g>`;
  }
  if (!MOTIFS[p.motif]) throw new Error('No motif: ' + p.motif);
  const b = blob(cx, cy, rx, ry, seed);
  return `<g filter="url(#wob)"><path d="${b}" fill="${pal.a}" opacity="0.55" transform="translate(11 11)"/><path d="${b}" fill="none" ${sk(7)}/></g>`
    + `<g filter="url(#wob)" transform="translate(${cx} ${cy}) scale(${motifScale})">${MOTIFS[p.motif](mp)}</g>`;
}

function decorations(i, cy, pal, ry) {
  const f = i % 2;
  const sets = [
    () => dStar(f ? 950 : 125, cy - 120, 30, pal.b) + dSpiral(f ? 128 : 952, cy + 60, 36) + dHeart(f ? 965 : 110, cy + ry - 20, 26, pal.c),
    () => dRays(f ? 935 : 150, cy - 112, 26, 54, 7) + dStar(f ? 140 : 940, cy + 80, 26, pal.a) + dSquig(f ? 60 : 830, cy + ry + 10, 150, pal.b),
    () => dSpiral(f ? 945 : 135, cy - 110, 34) + dStar(f ? 125 : 955, cy + 36, 24, pal.a) + dStar(f ? 960 : 100, cy + ry - 10, 16, pal.c),
  ];
  return `<g filter="url(#wob)">${sets[i % 3]()}</g>`;
}

function footer(y) {
  return tx(70, y, 'Elevven11 Studio', 32)
    + tx(1010, y, SITE, 26, { font: BODY, anchor: 'end', opacity: 0.85 })
    + `<g filter="url(#wobS)">${dSquig(70, y + 14, 150, '#ffb066')}</g>`;
}

/* ---------------- fact or joke card (posts and reel slides) ---------------- */

function textLayout(p, d) {
  for (const hs of d.head) {
    for (const fs of d.fact) {
      const head = wrapB(p.hook, 940, hs, K.head);
      const fact = wrapB(p.fact, 940, fs, K.body);
      const bub = wrapB(p.punch, 800, d.punch, K.punch);
      if (head.length > 3 || fact.length > 3 || bub.length > 2) continue;
      const step = Math.round(hs * 1.12);
      const lh = Math.round(fs * 1.5);
      const factY = d.y0 + (head.length - 1) * step + Math.round(hs * 0.9);
      const nTop = factY + (fact.length - 1) * lh + Math.round(fs * 1.4);
      const nH = 40 + bub.length * d.pl + 34;
      if (nTop + nH > d.limit) continue;
      const extra = d.limit - (d.cy + d.ry + 14) - (nTop + nH - (d.y0 - hs * 0.8)) - 20;
      return {
        hs, fs, head, fact, bub, step, lh, factY, nTop, nH,
        dyPic: Math.max(0, Math.min(Math.round(extra * 0.3), 80)),
        dyText: Math.max(0, Math.min(Math.round(extra * 0.7), 190)),
      };
    }
  }
  throw new Error('Does not fit: ' + p.hook);
}

function cardBody(p, d, ti, si, tag, counter, extraBottom = '') {
  const { pal } = look(ti, si);
  const L = textLayout(p, d);

  const lastW = Math.min(960, L.head[L.head.length - 1].length * L.hs * K.head + 30);
  const lastBase = d.y0 + (L.head.length - 1) * L.step;
  const head = `<g filter="url(#wobS)">${swash(60, lastBase - L.hs * 0.46, lastW, L.hs * 0.52, pal.b, -1)}</g>`
    + `<g transform="rotate(-1 540 ${d.y0})">` + L.head.map((t, k) => tx(70, d.y0 + k * L.step, t, L.hs)).join('') + '</g>';
  const fact = L.fact.map((t, k) => tx(70, L.factY + k * L.lh, t, L.fs, { font: BODY, opacity: 0.92 })).join('');

  const nw = Math.max(420, Math.min(960, Math.ceil(Math.max(...L.bub.map((t) => t.length)) * d.punch * K.punch) + 96));
  const note = `<g filter="url(#wobS)">${stickyNote(70, L.nTop, nw, L.nH, 1.6, pal.c)}</g>`
    + `<g transform="rotate(1.6 ${70 + nw / 2} ${L.nTop + L.nH / 2})">`
    + L.bub.map((t, k) => tx(70 + nw / 2, L.nTop + 28 + d.punch + k * d.pl, t, d.punch, { anchor: 'middle' })).join('') + '</g>'
    + dTape(150, L.nTop - 4, 130, 40, -8, pal.b);

  return `<g transform="translate(0 ${L.dyPic})">${decorations(si, d.cy, pal, d.ry)}${picture(p, pal, d, ti * 31 + si * 7 + 3)}</g>`
    + pill(tag, 70, 56, pal.c)
    + tx(1010, 98, counter, 30, { anchor: 'end', rot: 3, opacity: 0.7 })
    + `<g transform="translate(0 ${L.dyText})">${head}${fact}${note}</g>`
    + extraBottom + footer(d.footY);
}

/* ---------------- public: posts ---------------- */

function postSvg(p, i, ti = 0) {
  const { paper } = look(ti, i);
  const body = cardBody(p, DIM.post, ti, i, p.tag, 'No. ' + String(i + 1).padStart(2, '0'));
  return doc(paper, DIM.post.H, 0, body);
}

/* ---------------- public: reel slides ---------------- */

function progress(idx) {
  const gap = 32;
  const x0 = 540 - ((TOTAL - 1) * gap) / 2;
  let out = '';
  for (let i = 0; i < TOTAL; i++) {
    out += i === idx
      ? `<circle cx="${x0 + i * gap}" cy="1262" r="10" fill="${INK}" ${sk(3)}/>`
      : `<circle cx="${x0 + i * gap}" cy="1262" r="7" fill="none" ${sk(3)} opacity="0.45"/>`;
  }
  return `<g filter="url(#wobS)">${out}</g>`;
}

function reelCardSvg(topic, p, si, ti) {
  const { paper } = look(ti, si);
  const body = cardBody(p, DIM.reel, ti, si, topic.tag, `${si} / 10`, progress(si));
  return doc(paper, REEL_H, YOFF, body);
}

function reelCoverSvg(topic, ti) {
  const { pal, paper } = look(ti, 0);
  const d = DIM.reel;
  const [l1, l2] = topic.cover.title;
  const s1 = Math.min(150, Math.floor(930 / (l1.length * 0.6)));
  const s2 = Math.min(150, Math.floor(900 / (l2.length * 0.6)));
  const y1 = 800;
  const y2 = y1 + Math.round(s2 * 1.02);
  const sub = wrapB(topic.cover.sub, 900, 36, K.body).slice(0, 2);
  const subY = y2 + 74;
  const swipeY = subY + (sub.length - 1) * 52 + 52;

  const l2w = Math.min(960, l2.length * s2 * 0.58 + 40);
  const body = `<g filter="url(#wob)">${dTape(190, 40, 150, 44, -16, pal.b)}</g>`
    + decorations(0, 400, pal, 232)
    + picture({ motif: topic.cover.motif }, pal, d, ti * 31 + 11, 400, 1.45, 275, 228)
    + pill(topic.tag, 70, 56, pal.c)
    + tx(1010, 98, topic.kind === 'comedy' ? '10 laughs' : '10 facts', 30, { anchor: 'end', rot: 3, opacity: 0.7 })
    + tx(70, y1, l1, s1) + `<g filter="url(#wobS)">${swash(52, y2 - s2 * 0.5, l2w, s2 * 0.56, pal.a, -1.2)}</g>` + tx(70, y2, l2, s2)
    + sub.map((t, k) => tx(70, subY + k * 52, t, 36, { font: BODY, opacity: 0.92 })).join('')
    + `<g transform="rotate(-2 220 ${swipeY + 36})"><g filter="url(#wobS)"><rect x="70" y="${swipeY}" width="300" height="74" rx="37" fill="${pal.b}" ${sk(5)}/></g>`
    + tx(190, swipeY + 52, 'swipe', 42, { anchor: 'middle' }) + `<g filter="url(#wobS)">${dArrow(268, swipeY + 38, 346, swipeY + 38, 0)}</g></g>`
    + progress(0) + footer(d.footY);
  return doc(paper, REEL_H, YOFF, body);
}

function reelCtaSvg(topic, ti) {
  const { pal, paper } = look(ti, 11);
  const d = DIM.reel;
  const head = topic.cta.head.map((t, k) => tx(70, 790 + k * 96, t, 86)).join('');
  const subY = 790 + (topic.cta.head.length - 1) * 96 + 72;
  const bw = Math.min(980, SITE.length * 26 + 110);
  const bx = 540 - bw / 2;
  const body = `<g filter="url(#wob)">${dTape(190, 40, 150, 44, -16, pal.b)}</g>`
    + decorations(1, 380, pal, 215)
    + picture({ motif: 'browser' }, pal, d, ti * 31 + 5, 380, 1.3, 250, 205)
    + pill('Elevven11 Studio', 70, 56, pal.c)
    + `<g filter="url(#wobS)">${swash(52, 790 + 96 * (topic.cta.head.length - 1) - 46, Math.min(960, topic.cta.head[topic.cta.head.length - 1].length * 86 * K.head + 30), 52, pal.a, -1)}</g>`
    + head + tx(70, subY, topic.cta.sub, 34, { font: BODY, opacity: 0.92 })
    + `<g transform="rotate(-1.5 540 1080)"><g filter="url(#wobS)"><rect x="${bx + 10}" y="1034" width="${bw}" height="108" rx="54" fill="${INK}" opacity="0.18"/><rect x="${bx}" y="1024" width="${bw}" height="108" rx="54" fill="${pal.b}" ${sk(6)}/></g>`
    + tx(540, 1094, SITE, 44, { anchor: 'middle' }) + '</g>'
    + tx(540, 1204, 'Follow for more', 34, { anchor: 'middle', opacity: 0.85 })
    + progress(11) + footer(d.footY);
  return doc(paper, REEL_H, YOFF, body);
}

module.exports = { postSvg, reelCardSvg, reelCoverSvg, reelCtaSvg, BAND, REEL_H, YOFF, W, TOTAL, SITE };
