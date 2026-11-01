/**
 * Drawing code shared by the social post generators: the palettes, the SVG
 * helpers and the MOTIFS pictures. generate-fact-posts.js (square posts) and
 * generate-reel-carousels.js (reel and feed slides) both build on this, so a
 * picture drawn once is available to both.
 *
 * MOTIFS are drawn around 0,0 and roughly 260 units wide. Changing a drawing
 * here changes it in every generator that uses it.
 */

const SITE = 'elevven11studio.github.io';
const FONT = 'Segoe UI, Arial, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------------- palettes ---------------- */

// line: outlines and the banner. pop and accent: the two loud colours.
const PALETTES = [
  { bg: '#ffd43b', text: '#14110f', line: '#14110f', paper: '#ffffff', accent: '#ff4d6d', pop: '#4dabf7', shadow: '#14110f' },
  { bg: '#ff6b9a', text: '#190a10', line: '#190a10', paper: '#ffffff', accent: '#ffd43b', pop: '#4cc9f0', shadow: '#190a10' },
  { bg: '#35d07f', text: '#06150c', line: '#06150c', paper: '#ffffff', accent: '#ffd43b', pop: '#ff6b9a', shadow: '#06150c' },
  { bg: '#4c8dff', text: '#04102b', line: '#04102b', paper: '#ffffff', accent: '#ffd43b', pop: '#ff6b9a', shadow: '#04102b' },
  { bg: '#ff8a2a', text: '#1f0e00', line: '#1f0e00', paper: '#ffffff', accent: '#ffe14d', pop: '#2ec4b6', shadow: '#1f0e00' },
  { bg: '#8b5cf6', text: '#ffffff', line: '#1a0b3a', paper: '#ffffff', accent: '#ffd43b', pop: '#5eead4', shadow: '#1a0b3a' },
  { bg: '#111016', text: '#f7f3ec', line: '#0a0a0e', paper: '#f7f3ec', accent: '#5ee08a', pop: '#ffd43b', shadow: '#5ee08a' },
  { bg: '#fff1d0', text: '#1a1208', line: '#1a1208', paper: '#ffffff', accent: '#ff7a1a', pop: '#3bc9a0', shadow: '#1a1208' },
];

/* ---------------- drawing helpers ---------------- */

const st = (c, w = 7) => `stroke="${c.line}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const rect = (c, x, y, w, h, r, fill, sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${st(c, sw)}/>`;
const circ = (c, x, y, r, fill, sw) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${st(c, sw)}/>`;
const path_ = (c, d, fill = 'none', sw) => `<path d="${d}" fill="${fill}" ${st(c, sw)}/>`;
const line_ = (c, x1, y1, x2, y2, sw) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${st(c, sw)}/>`;
const label = (x, y, s, size, fill) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="900" font-family="${FONT}" fill="${fill}">${esc(s)}</text>`;

function starPoints(cx, cy, R, r, n) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const rad = i % 2 ? r : R;
    pts.push((cx + rad * Math.cos(a)).toFixed(1) + ',' + (cy + rad * Math.sin(a)).toFixed(1));
  }
  return pts.join(' ');
}

const spark = (c, x, y, s, fill) =>
  `<path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z" fill="${fill}" ${st(c, 4)}/>`;

/* ---------------- motifs: drawn around 0,0, about 260 wide ---------------- */

const MOTIFS = {
  globe: (c) => circ(c, 0, 0, 105, c.pop)
    + `<ellipse cx="0" cy="0" rx="46" ry="105" fill="none" ${st(c)}/>`
    + line_(c, -105, 0, 105, 0) + path_(c, 'M-92 -52 Q0 -32 92 -52') + path_(c, 'M-92 52 Q0 32 92 52'),

  snail: (c) => rect(c, -125, 50, 235, 36, 18, c.paper) + circ(c, 110, 38, 30, c.paper)
    + line_(c, 100, 15, 92, -40) + line_(c, 120, 15, 134, -35) + circ(c, 92, -44, 9, c.line, 4) + circ(c, 134, -39, 9, c.line, 4)
    + circ(c, -20, -5, 78, c.accent)
    + path_(c, 'M-20 -5 a8 8 0 0 1 16 0 a24 24 0 0 1 -48 0 a40 40 0 0 1 80 0 a56 56 0 0 1 -112 0', 'none', 6),

  magnifier: (c) => circ(c, -25, -25, 78, c.paper)
    + `<line x1="32" y1="32" x2="105" y2="105" stroke="${c.line}" stroke-width="34" stroke-linecap="round"/>`
    + `<line x1="32" y1="32" x2="105" y2="105" stroke="${c.accent}" stroke-width="18" stroke-linecap="round"/>`
    + `<path d="M-72 -42 Q-58 -74 -25 -80" fill="none" stroke="${c.pop}" stroke-width="10" stroke-linecap="round"/>`,

  coffee: (c) => path_(c, 'M-45 -62 Q-62 -82 -45 -102 Q-28 -122 -45 -142', 'none', 6)
    + path_(c, 'M10 -62 Q-7 -82 10 -102 Q27 -122 10 -142', 'none', 6)
    + path_(c, 'M-90 -35 H65 V25 Q65 88 -12 88 Q-90 88 -90 25 Z', c.paper)
    + `<ellipse cx="-12" cy="-35" rx="77" ry="12" fill="${c.accent}" ${st(c, 5)}/>`
    + path_(c, 'M65 -15 H95 Q122 -15 122 15 Q122 45 92 45 H60') + rect(c, -110, 92, 200, 20, 10, c.pop),

  moth: (c) => path_(c, 'M-10 -20 Q-110 -100 -120 -15 Q-115 55 -10 28 Z', c.paper)
    + path_(c, 'M10 -20 Q110 -100 120 -15 Q115 55 10 28 Z', c.paper)
    + circ(c, -80, -20, 16, c.accent, 5) + circ(c, 80, -20, 16, c.accent, 5)
    + `<ellipse cx="0" cy="5" rx="16" ry="62" fill="${c.line}"/>`
    + path_(c, 'M-6 -52 Q-25 -95 -48 -100', 'none', 5) + path_(c, 'M6 -52 Q25 -95 48 -100', 'none', 5),

  mouse: (c) => path_(c, 'M-62 -85 Q0 -112 62 -85 Q86 -10 64 62 Q0 108 -64 62 Q-86 -10 -62 -85 Z', c.accent)
    + line_(c, 0, -100, 0, -20, 6) + path_(c, 'M-76 -20 H76', 'none', 6)
    + path_(c, 'M-35 12 Q0 32 35 12', 'none', 4) + path_(c, 'M-40 42 Q0 64 40 42', 'none', 4)
    + path_(c, 'M0 -108 Q0 -140 30 -145', 'none', 6),

  phone: (c) => rect(c, -72, -122, 144, 244, 28, c.paper) + rect(c, -56, -96, 112, 176, 10, c.accent)
    + [0, 1, 2].map((r) => [0, 1, 2].map((k) => rect(c, -42 + k * 38, -80 + r * 40, 28, 28, 8, (r + k) % 2 ? c.paper : c.pop, 4)).join('')).join('')
    + circ(c, 0, 101, 10, c.pop, 5),

  box: (c) => path_(c, 'M-100 -45 L0 0 L0 110 L-100 65 Z', c.accent) + path_(c, 'M100 -45 L0 0 L0 110 L100 65 Z', c.pop)
    + path_(c, 'M0 -90 L100 -45 L0 0 L-100 -45 Z', c.paper) + path_(c, 'M-50 -68 L50 -22', 'none', 10)
    + path_(c, 'M25 62 Q52 86 80 50', 'none', 6),

  wifi: (c) => ['M-95 -15 Q0 -105 95 -15', 'M-62 18 Q0 -38 62 18', 'M-30 52 Q0 22 30 52'].map((d) =>
    `<path d="${d}" fill="none" stroke="${c.line}" stroke-width="24" stroke-linecap="round"/>`
    + `<path d="${d}" fill="none" stroke="${c.accent}" stroke-width="10" stroke-linecap="round"/>`).join('')
    + circ(c, 0, 82, 16, c.pop, 6),

  crown: (c) => path_(c, 'M-105 62 L-115 -55 L-52 0 L0 -75 L52 0 L115 -55 L105 62 Z', c.pop)
    + rect(c, -105, 62, 210, 30, 8, c.accent)
    + circ(c, -115, -60, 12, c.paper, 5) + circ(c, 0, -82, 12, c.paper, 5) + circ(c, 115, -60, 12, c.paper, 5)
    + circ(c, -50, 77, 8, c.paper, 4) + circ(c, 0, 77, 8, c.paper, 4) + circ(c, 50, 77, 8, c.paper, 4),

  mail: (c) => rect(c, -115, -75, 230, 150, 14, c.paper) + path_(c, 'M-115 -75 L0 22 L115 -75')
    + circ(c, 98, -72, 36, c.accent) + label(98, -56, '!', 52, c.paper),

  smiley: (c) => circ(c, 0, 0, 105, c.pop) + circ(c, -35, -28, 12, c.line, 4) + circ(c, 35, -28, 12, c.line, 4)
    + path_(c, 'M-55 22 Q0 88 55 22', 'none', 10) + circ(c, -62, 18, 14, c.accent, 0) + circ(c, 62, 18, 14, c.accent, 0),

  robot: (c) => line_(c, 0, -62, 0, -108) + circ(c, 0, -118, 13, c.accent, 5)
    + rect(c, -108, -18, 22, 54, 6, c.pop) + rect(c, 86, -18, 22, 54, 6, c.pop)
    + rect(c, -85, -62, 170, 132, 28, c.paper)
    + rect(c, -57, -28, 40, 40, 8, c.accent, 5) + rect(c, 17, -28, 40, 40, 8, c.pop, 5)
    + line_(c, -40, 42, 40, 42, 8),

  camera: (c) => rect(c, -40, -92, 80, 38, 8, c.paper) + rect(c, -110, -60, 220, 150, 24, c.paper)
    + circ(c, 0, 15, 54, c.accent) + circ(c, 0, 15, 26, c.paper, 6) + circ(c, 80, -30, 10, c.pop, 4),

  ghost: (c) => path_(c, 'M-80 90 V-20 Q-80 -100 0 -100 Q80 -100 80 -20 V90 L53 65 L27 90 L0 65 L-27 90 L-53 65 Z', c.paper)
    + circ(c, -28, -25, 13, c.line, 3) + circ(c, 28, -25, 13, c.line, 3)
    + `<ellipse cx="0" cy="22" rx="13" ry="19" fill="${c.line}"/>`,

  podium: (c) => rect(c, -135, 25, 90, 65, 0, c.accent) + rect(c, -45, -25, 90, 115, 0, c.pop) + rect(c, 45, 55, 90, 35, 0, c.paper)
    + label(-90, 72, '2', 44, c.line) + label(0, 40, '1', 62, c.line) + label(90, 84, '3', 30, c.line)
    + `<polygon points="${starPoints(0, -68, 34, 15, 5)}" fill="${c.accent}" ${st(c, 5)}/>`,

  key: (c) => rect(c, -10, -13, 140, 26, 8, c.pop) + rect(c, 85, 13, 18, 40, 4, c.pop) + rect(c, 115, 13, 18, 28, 4, c.pop)
    + circ(c, -60, 0, 52, c.pop) + circ(c, -60, 0, 20, c.paper, 5),

  qr: (c) => {
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="66" height="66" fill="${c.line}"/>`
      + `<rect x="${x + 14}" y="${y + 14}" width="38" height="38" fill="${c.paper}"/>`
      + `<rect x="${x + 24}" y="${y + 24}" width="18" height="18" fill="${c.line}"/>`;
    const dots = [[-8, -88], [14, -66], [-8, -44], [-88, -8], [-44, -8], [-10, -10], [30, -6], [52, 14], [74, -6], [-8, 36], [14, 58], [48, 44],
      [74, 62], [30, 80], [-22, 78], [-88, 40], [-60, 62], [-40, 40]];
    return rect(c, -108, -108, 216, 216, 16, c.paper)
      + finder(-90, -90) + finder(24, -90) + finder(-90, 24)
      + dots.map(([x, y]) => `<rect x="${x}" y="${y}" width="20" height="20" fill="${c.line}"/>`).join('');
  },

  disc: (c) => circ(c, 0, 0, 105, c.paper) + circ(c, 0, 0, 34, c.pop) + circ(c, 0, 0, 12, c.paper, 5)
    + `<path d="M-72 -46 Q-48 -84 0 -90" fill="none" stroke="${c.accent}" stroke-width="12" stroke-linecap="round"/>`,

  heart: (c) => path_(c, 'M0 92 C-135 -8 -92 -112 0 -52 C92 -112 135 -8 0 92 Z', c.accent)
    + path_(c, 'M-20 -22 L38 8 L-20 38 Z', c.paper, 6),

  lego: (c) => [[-110, -10, c.accent], [0, -10, c.pop], [-55, -80, c.paper]].map(([x, y, f]) =>
    rect(c, x, y, 110, 70, 8, f) + rect(c, x + 16, y - 16, 28, 18, 4, f, 5) + rect(c, x + 66, y - 16, 28, 18, 4, f, 5)).join('')
    + rect(c, -110, 60, 220, 46, 8, c.paper) + rect(c, -94, 44, 28, 18, 4, c.paper, 5) + rect(c, -14, 44, 28, 18, 4, c.paper, 5) + rect(c, 66, 44, 28, 18, 4, c.paper, 5),

  cloud: (c) => path_(c, 'M-90 50 Q-130 50 -125 10 Q-120 -25 -80 -25 Q-70 -85 0 -85 Q70 -85 80 -30 Q130 -30 130 20 Q130 50 90 50 Z', c.paper)
    + rect(c, -50, -10, 100, 14, 7, c.accent, 4) + rect(c, -50, 16, 100, 14, 7, c.pop, 4),

  card: (c) => `<g transform="rotate(-6)">` + rect(c, -120, -70, 240, 140, 14, c.paper)
    + circ(c, 78, -28, 24, c.pop, 5) + rect(c, -92, -34, 100, 16, 8, c.line, 0)
    + rect(c, -92, 2, 150, 12, 6, c.accent, 4) + rect(c, -92, 28, 90, 12, 6, c.accent, 4) + `</g>`,

  sign: (c) => rect(c, -9, 36, 18, 92, 0, c.line) + rect(c, -112, -112, 224, 152, 14, c.paper)
    + label(0, -48, 'FOR', 34, c.line) + label(0, 12, 'RENT', 56, c.line) + rect(c, -62, 20, 124, 12, 6, c.accent, 4)
    + circ(c, -92, -92, 7, c.line, 0) + circ(c, 92, -92, 7, c.line, 0),

  moon: (c) => path_(c, 'M30 -105 A105 105 0 1 0 105 45 A82 82 0 0 1 30 -105 Z', c.pop)
    + label(78, -48, 'Z', 62, c.line) + label(112, -88, 'z', 44, c.line) + label(138, -116, 'z', 32, c.line),

  bubbles: (c) => rect(c, -112, -104, 170, 62, 30, c.paper) + rect(c, -50, -24, 160, 62, 30, c.accent) + rect(c, -112, 56, 135, 52, 26, c.pop)
    + [-84, -64, -44].map((x) => circ(c, x, -73, 6, c.line, 0)).join('')
    + [26, 46, 66].map((x) => circ(c, x, 7, 6, c.line, 0)).join('')
    + [-86, -66, -46].map((x) => circ(c, x, 82, 5, c.line, 0)).join(''),

  clock: (c) => circ(c, 0, 0, 105, c.paper)
    + [...Array(12).keys()].map((i) => { const a = (i * Math.PI) / 6; return line_(c, (82 * Math.sin(a)).toFixed(1), (-82 * Math.cos(a)).toFixed(1), (94 * Math.sin(a)).toFixed(1), (-94 * Math.cos(a)).toFixed(1), 6); }).join('')
    + line_(c, 0, 0, 0, -62, 9) + line_(c, 0, 0, 46, 26, 9) + circ(c, 0, 0, 10, c.accent, 5),

  hourglass: (c) => path_(c, 'M-65 -92 H65 Q65 -20 12 0 Q65 20 65 92 H-65 Q-65 20 -12 0 Q-65 -20 -65 -92 Z', c.paper)
    + path_(c, 'M-42 -84 H42 Q40 -52 8 -28 H-8 Q-40 -52 -42 -84 Z', c.pop, 4) + path_(c, 'M-56 88 L0 38 L56 88 Z', c.pop, 4)
    + rect(c, -82, -112, 164, 20, 8, c.accent) + rect(c, -82, 92, 164, 20, 8, c.accent),

  cart: (c) => rect(c, -22, -96, 38, 48, 8, c.pop, 5) + rect(c, 30, -84, 38, 38, 8, c.paper, 5)
    + path_(c, 'M-70 -45 H105 L82 40 H-40 Z', c.accent) + path_(c, 'M-118 -88 H-82 L-40 40')
    + circ(c, -18, 76, 16, c.line, 0) + circ(c, 66, 76, 16, c.line, 0),

  pencil: (c) => `<g transform="rotate(40)">` + rect(c, -30, -100, 60, 160, 0, c.pop) + path_(c, 'M-30 60 L0 120 L30 60 Z', c.paper)
    + path_(c, 'M-11 96 L0 120 L11 96 Z', c.line, 3) + rect(c, -30, -134, 60, 34, 12, c.accent) + line_(c, -30, -92, 30, -92, 8) + `</g>`,

  calculator: (c) => rect(c, -80, -112, 160, 224, 20, c.paper) + rect(c, -62, -92, 124, 52, 8, c.line, 0)
    + `<text x="54" y="-54" text-anchor="end" font-size="34" font-weight="900" font-family="${FONT}" fill="${c.pop}">0.00</text>`
    + [0, 1, 2, 3].map((r) => [0, 1, 2].map((k) => rect(c, -58 + k * 42, -22 + r * 36, 34, 28, 8, (r + k) % 3 === 0 ? c.accent : (r + k) % 3 === 1 ? c.pop : c.paper, 4)).join('')).join(''),

  megaphone: (c) => rect(c, -72, 28, 40, 54, 8, c.pop) + path_(c, 'M-104 -30 L58 -92 V92 L-104 30 Z', c.accent) + rect(c, 58, -102, 26, 204, 13, c.pop)
    + `<path d="M108 -46 Q138 0 108 46" fill="none" stroke="${c.line}" stroke-width="10" stroke-linecap="round"/>`
    + `<path d="M128 -78 Q180 0 128 78" fill="none" stroke="${c.line}" stroke-width="10" stroke-linecap="round"/>`,
};

/* ---------------- text layout ---------------- */

// Width of a line is estimated as characters x size x k, where k is the average
// glyph width measured for Segoe UI: 0.444 regular, 0.459 bold, 0.544 black.
// The values below add a little headroom for capitals and wide letters.
const K = { head: 0.56, fact: 0.46, bubble: 0.48 };

function wrapW(text, maxW, size, k) {
  const lines = [];
  let cur = '';
  for (const w of text.split(' ')) {
    const t = cur ? cur + ' ' + w : w;
    if (t.length * size * k > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

/* ---------------- more motifs, used by the reel carousels ---------------- */

const ell = (c, cx, cy, rx, ry, fill, sw, extra = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${st(c, sw)} ${extra}/>`;
const raw = (d, stroke, w, fill = 'none') =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// Reaction faces. Each is a round face with its own eyes, brows and mouth.
const face = (c, base, body) => circ(c, 0, 0, 105, base) + body;
const FACES = {
  'face-laugh': (c) => face(c, c.pop,
    path_(c, 'M-58 -22 Q-38 -52 -18 -22', 'none', 9) + path_(c, 'M18 -22 Q38 -52 58 -22', 'none', 9)
    + path_(c, 'M-62 12 Q0 112 62 12 Z', c.line, 6) + `<ellipse cx="0" cy="62" rx="26" ry="14" fill="${c.accent}"/>`
    + circ(c, -84, -4, 9, c.paper, 3) + circ(c, 84, -4, 9, c.paper, 3)),
  'face-shock': (c) => face(c, c.pop,
    circ(c, -36, -26, 24, c.paper, 5) + circ(c, 36, -26, 24, c.paper, 5) + circ(c, -36, -26, 9, c.line, 0) + circ(c, 36, -26, 9, c.line, 0)
    + path_(c, 'M-64 -68 Q-36 -86 -10 -70', 'none', 7) + path_(c, 'M10 -70 Q36 -86 64 -68', 'none', 7)
    + `<ellipse cx="0" cy="50" rx="20" ry="28" fill="${c.line}"/>`),
  'face-eye': (c) => face(c, c.pop,
    circ(c, -36, -16, 22, c.paper, 5) + circ(c, 36, -16, 22, c.paper, 5) + circ(c, -24, -16, 9, c.line, 0) + circ(c, 48, -16, 9, c.line, 0)
    + path_(c, 'M-62 -32 H-10', 'none', 10) + path_(c, 'M10 -32 H62', 'none', 10) + path_(c, 'M-36 58 Q0 48 36 56', 'none', 9)),
  'face-cry': (c) => face(c, c.pop,
    path_(c, 'M-58 -20 Q-38 -4 -18 -20', 'none', 8) + path_(c, 'M18 -20 Q38 -4 58 -20', 'none', 8)
    + path_(c, 'M-40 -6 Q-56 22 -40 40 Q-24 22 -40 -6 Z', '#7dd3fc', 4) + path_(c, 'M40 -6 Q24 22 40 40 Q56 22 40 -6 Z', '#7dd3fc', 4)
    + path_(c, 'M-40 64 Q0 30 40 64', 'none', 9)),
  'face-think': (c) => face(c, c.pop,
    circ(c, -34, -22, 12, c.line, 0) + circ(c, 34, -22, 12, c.line, 0)
    + path_(c, 'M-58 -54 Q-34 -68 -12 -54', 'none', 7) + path_(c, 'M14 -46 Q34 -50 56 -44', 'none', 7)
    + path_(c, 'M-26 56 Q10 40 36 54', 'none', 8) + label(92, -62, '?', 72, c.line)),
  'face-sleep': (c) => face(c, c.pop,
    path_(c, 'M-58 -16 Q-38 2 -18 -16', 'none', 8) + path_(c, 'M18 -16 Q38 2 58 -16', 'none', 8)
    + `<ellipse cx="0" cy="52" rx="14" ry="10" fill="${c.line}"/>` + label(86, -64, 'Z', 56, c.line) + label(116, -98, 'z', 40, c.line)),
  'face-cool': (c) => face(c, c.pop,
    rect(c, -78, -46, 68, 42, 12, c.line, 0) + rect(c, 10, -46, 68, 42, 12, c.line, 0) + line_(c, -10, -32, 10, -32, 7)
    + raw('M-62 -36 L-40 -36', c.paper, 5) + raw('M26 -36 L48 -36', c.paper, 5) + path_(c, 'M-48 36 Q0 82 48 36', 'none', 9)),
  'face-angry': (c) => face(c, c.accent,
    path_(c, 'M-66 -50 L-16 -28', 'none', 10) + path_(c, 'M66 -50 L16 -28', 'none', 10)
    + circ(c, -34, -10, 10, c.line, 0) + circ(c, 34, -10, 10, c.line, 0) + path_(c, 'M-40 64 Q0 34 40 64', 'none', 10)
    + circ(c, -98, -92, 12, c.paper, 4) + circ(c, 98, -92, 12, c.paper, 4)),
  'face-mind': (c) => `<polygon points="${starPoints(0, -82, 74, 36, 10)}" fill="${c.accent}" ${st(c, 6)}/>`
    + circ(c, 0, 20, 92, c.pop) + circ(c, -32, -2, 22, c.paper, 5) + circ(c, 32, -2, 22, c.paper, 5)
    + circ(c, -32, -2, 7, c.line, 0) + circ(c, 32, -2, 7, c.line, 0) + `<ellipse cx="0" cy="56" rx="16" ry="20" fill="${c.line}"/>`,
  'face-sweat': (c) => face(c, c.pop,
    circ(c, -34, -12, 12, c.line, 0) + circ(c, 34, -12, 12, c.line, 0)
    + path_(c, 'M-58 -42 Q-36 -58 -14 -44', 'none', 7) + path_(c, 'M14 -44 Q36 -58 58 -42', 'none', 7)
    + path_(c, 'M-44 54 Q-22 38 0 54 Q22 70 44 54', 'none', 8) + path_(c, 'M82 -48 Q64 -12 82 6 Q100 -12 82 -48 Z', '#7dd3fc', 5)),
};

Object.assign(MOTIFS, FACES, {
  browser: (c) => rect(c, -125, -95, 250, 190, 16, c.paper) + rect(c, -125, -95, 250, 42, 16, c.accent)
    + circ(c, -98, -74, 7, c.paper, 3) + circ(c, -76, -74, 7, c.paper, 3) + circ(c, -54, -74, 7, c.paper, 3)
    + label(0, 30, 'www', 74, c.line) + rect(c, -95, 52, 190, 12, 6, c.pop, 4),

  checkbox: (c) => rect(c, -125, -62, 250, 124, 20, c.paper) + rect(c, -98, -34, 68, 68, 12, c.paper)
    + raw('M-88 0 L-70 20 L-40 -24', c.accent, 14) + label(50, 8, 'not a bot', 26, c.line),

  cookie: (c) => circ(c, 0, 0, 100, '#e8b36b')
    + [[-35, -40], [30, -50], [50, 10], [-50, 15], [0, 45], [12, -4], [-8, -70], [60, 55]].map(([x, y]) => circ(c, x, y, 11, '#5b3a1e', 0)).join(''),

  link: (c) => `<g transform="rotate(-35)">`
    + [-125, -25].map((x) => `<rect x="${x}" y="-40" width="150" height="80" rx="40" fill="none" stroke="${c.line}" stroke-width="30"/>`).join('')
    + [-125, -25].map((x) => `<rect x="${x}" y="-40" width="150" height="80" rx="40" fill="none" stroke="${c.accent}" stroke-width="14"/>`).join('')
    + `</g>`,

  note: (c) => line_(c, -30, 55, -30, -70, 9) + line_(c, 85, 30, 85, -95, 9)
    + path_(c, 'M-30 -70 L85 -95 V-62 L-30 -37 Z', c.accent) + ell(c, -58, 62, 32, 24, c.pop, 7, 'transform="rotate(-20 -58 62)"')
    + ell(c, 57, 37, 32, 24, c.pop, 7, 'transform="rotate(-20 57 37)"'),

  plate: (c) => circ(c, 0, 0, 88, c.paper) + `<circle cx="0" cy="0" r="56" fill="none" ${st(c, 5)}/>` + circ(c, 0, 0, 22, c.accent, 5)
    + path_(c, 'M-138 -80 V-34 Q-138 -12 -122 -12 Q-106 -12 -106 -34 V-80', 'none', 7) + line_(c, -122, -12, -122, 92, 9)
    + path_(c, 'M110 -84 Q142 -32 118 14 H110 Z', c.paper) + line_(c, 114, 14, 114, 92, 10),

  bottle: (c) => path_(c, 'M-45 -40 Q-62 -40 -62 -10 V90 Q-62 114 -36 114 H36 Q62 114 62 90 V-10 Q62 -40 45 -40 Z', '#e63946')
    + path_(c, 'M-22 -40 L-15 -82 H15 L22 -40 Z', c.paper) + rect(c, -11, -112, 22, 32, 6, c.paper) + rect(c, -38, 6, 76, 62, 8, c.paper, 5),

  honey: (c) => rect(c, -82, -38, 164, 150, 28, '#f2b630') + rect(c, -72, -78, 144, 42, 10, c.paper)
    + path_(c, 'M-32 -38 V4 Q-32 24 -19 24 Q-6 24 -6 4 V-38', '#f2b630', 6) + rect(c, -48, 28, 96, 58, 10, c.paper, 5),

  banana: (c) => path_(c, 'M-90 -75 Q-102 95 100 70 Q114 66 120 48 Q-20 72 -50 -75 Z', '#ffd43b') + rect(c, -100, -102, 30, 32, 6, '#8a5a2b'),

  flower: (c) => [0, 1, 2, 3, 4, 5].map((i) => ell(c, 0, -52, 26, 54, '#a06cd5', 6, `transform="rotate(${i * 60})"`)).join('')
    + raw('M0 0 L-10 -44', '#e63946', 9) + raw('M0 0 L2 -52', '#e63946', 9) + raw('M0 0 L14 -42', '#e63946', 9) + circ(c, 0, 0, 14, c.pop, 5),

  peanut: (c) => `<g transform="rotate(-30)">`
    + path_(c, 'M-100 0 Q-100 -48 -50 -48 Q-20 -48 -20 -24 Q-20 -10 0 -10 Q20 -10 20 -24 Q20 -48 50 -48 Q100 -48 100 0 Q100 48 50 48 Q20 48 20 24 Q20 10 0 10 Q-20 10 -20 24 Q-20 48 -50 48 Q-100 48 -100 0 Z', '#d9a45b')
    + [[-60, -10], [-40, 14], [-70, 18], [60, -12], [42, 16], [72, 14]].map(([x, y]) => circ(c, x, y, 4, '#8a5a2b', 0)).join('') + `</g>`,

  bean: (c) => ell(c, 0, 0, 72, 104, '#6f4e37', 7, 'transform="rotate(28)"') + `<g transform="rotate(28)">` + raw('M-8 -94 Q34 -10 -8 94', '#f1e4d3', 11) + `</g>`,

  pot: (c) => line_(c, -40, -108, -40, -80, 6) + path_(c, 'M-100 -20 H100 V50 Q100 106 0 106 Q-100 106 -100 50 Z', c.accent)
    + path_(c, 'M-114 -20 Q0 -92 114 -20 Z', c.paper) + circ(c, 0, -76, 11, c.pop, 5)
    + rect(c, -130, -4, 30, 18, 8, c.pop, 5) + rect(c, 100, -4, 30, 18, 8, c.pop, 5)
    + path_(c, 'M-24 -112 Q-38 -128 -22 -142', 'none', 6) + path_(c, 'M30 -108 Q16 -126 32 -140', 'none', 6),

  dress: (c) => path_(c, 'M-30 -104 L-62 -22 L-112 108 H112 L62 -22 L30 -104 Q0 -72 -30 -104 Z', c.accent) + rect(c, -64, -26, 128, 20, 6, c.pop, 6)
    + path_(c, 'M-30 -104 L-34 -128', 'none', 6) + path_(c, 'M30 -104 L34 -128', 'none', 6),

  heel: (c) => path_(c, 'M-112 -62 Q-112 -88 -88 -82 L-62 4 Q20 40 105 45 Q128 48 128 66 L128 78 H-112 Z', c.accent)
    + path_(c, 'M-112 78 H-80 L-94 130 H-110 Z', c.pop) + line_(c, -80, 78, 128, 78, 8),

  fabric: (c) => rect(c, -112, -88, 224, 176, 14, c.pop)
    + [[-60, -34, 38], [50, 30, 38], [-30, 52, 22], [64, -50, 22]].map(([x, y, r]) => circ(c, x, y, r, c.accent, 5) + circ(c, x, y, r * 0.55, c.paper, 4) + circ(c, x, y, r * 0.2, c.line, 0)).join(''),

  velcro: (c) => rect(c, -112, -88, 224, 74, 10, c.paper) + rect(c, -112, 14, 224, 74, 10, c.accent)
    + [-84, -56, -28, 0, 28, 56, 84].map((x) => raw('M' + x + ' -50 V-30 Q' + x + ' -22 ' + (x + 12) + ' -30', c.line, 5)).join('')
    + [-84, -56, -28, 0, 28, 56, 84].map((x) => circ(c, x, 50, 11, c.paper, 4)).join(''),

  tie: (c) => path_(c, 'M-28 -108 H28 L38 -62 H-38 Z', c.accent) + path_(c, 'M-38 -62 H38 L66 92 L0 122 L-66 92 Z', c.accent)
    + raw('M-30 -20 L30 -4', c.paper, 12) + raw('M-42 28 L42 48', c.paper, 12),

  bag: (c) => path_(c, 'M-46 -52 V-84 Q-46 -112 0 -112 Q46 -112 46 -84 V-52', 'none', 8) + rect(c, -92, -52, 184, 156, 12, c.accent)
    + raw('M-36 24 Q0 60 36 24', c.paper, 10),

  dumbbell: (c) => rect(c, -92, -10, 184, 20, 4, c.paper) + rect(c, -128, -66, 36, 132, 10, c.accent) + rect(c, -92, -46, 26, 92, 6, c.pop)
    + rect(c, 92, -66, 36, 132, 10, c.accent) + rect(c, 66, -46, 26, 92, 6, c.pop),

  plane: (c) => path_(c, 'M-100 8 L-26 -10 L-72 -86 L-40 -86 L44 -16 L112 -36 Q138 -42 138 -20 Q138 2 112 6 L44 22 L-40 92 L-72 92 L-26 20 L-100 38 Z', c.accent)
    + raw('M-135 -30 H-112', c.line, 7) + raw('M-130 -8 H-96', c.line, 7) + raw('M-132 50 H-104', c.line, 7),

  mountain: (c) => path_(c, 'M-128 92 L-48 -62 L0 12 L48 -92 L128 92 Z', c.pop) + path_(c, 'M26 -60 L48 -92 L70 -60 L56 -68 L48 -54 L38 -68 Z', c.paper, 5)
    + circ(c, -84, -78, 24, c.accent, 6),

  eye: (c) => path_(c, 'M-122 0 Q0 -104 122 0 Q0 104 -122 0 Z', c.paper) + circ(c, 0, 0, 50, c.accent) + circ(c, 0, 0, 22, c.line, 0) + circ(c, 14, -14, 8, c.paper, 0),

  planet: (c) => circ(c, 0, 0, 72, c.accent)
    + `<ellipse cx="0" cy="0" rx="136" ry="34" fill="none" stroke="${c.line}" stroke-width="22" transform="rotate(-20)"/>`
    + `<ellipse cx="0" cy="0" rx="136" ry="34" fill="none" stroke="${c.pop}" stroke-width="10" transform="rotate(-20)"/>`,

  rocket: (c) => path_(c, 'M-24 40 Q0 138 24 40 Z', '#ff9f1c') + path_(c, 'M-42 24 L-86 80 L-42 66 Z', c.accent) + path_(c, 'M42 24 L86 80 L42 66 Z', c.accent)
    + path_(c, 'M0 -128 Q54 -62 44 44 H-44 Q-54 -62 0 -128 Z', c.paper) + circ(c, 0, -42, 22, c.pop, 6) + rect(c, -44, 22, 88, 14, 4, c.accent, 5),

  paw: (c) => ell(c, 0, 46, 58, 48, c.accent, 7) + circ(c, -68, -12, 26, c.accent) + circ(c, -26, -62, 26, c.accent)
    + circ(c, 26, -62, 26, c.accent) + circ(c, 68, -12, 26, c.accent),

  bee: (c) => ell(c, -22, -64, 34, 52, c.paper, 5, 'transform="rotate(-25 -22 -64)"') + ell(c, 28, -64, 34, 52, c.paper, 5, 'transform="rotate(25 28 -64)"')
    + ell(c, 0, 22, 84, 56, c.pop) + raw('M-14 -33 Q-22 22 -14 77', c.line, 18) + raw('M34 -29 Q28 22 34 73', c.line, 18)
    + circ(c, -92, 18, 28, c.accent, 6) + circ(c, -100, 12, 5, c.line, 0) + raw('M-100 -8 Q-112 -42 -128 -46', c.line, 5)
    + path_(c, 'M80 8 L118 22 L80 34 Z', c.line, 4),

  crab: (c) => [-1, 1].map((s) => [0, 1, 2].map((k) => line_(c, s * 70, 30 + k * 22, s * 126, 52 + k * 30, 8)).join('') + line_(c, s * 66, -4, s * 104, -50, 10)).join('')
    + ell(c, 0, 16, 92, 62, c.accent) + line_(c, -26, -34, -26, -68, 7) + line_(c, 26, -34, 26, -68, 7)
    + circ(c, -26, -78, 13, c.paper, 5) + circ(c, 26, -78, 13, c.paper, 5) + circ(c, -26, -78, 4, c.line, 0) + circ(c, 26, -78, 4, c.line, 0)
    + circ(c, -116, -70, 34, c.accent) + circ(c, 116, -70, 34, c.accent) + path_(c, 'M-116 -70 L-132 -108', 'none', 7) + path_(c, 'M116 -70 L132 -108', 'none', 7)
    + path_(c, 'M-22 42 Q0 60 22 42', 'none', 6),
});

module.exports = { SITE, FONT, esc, PALETTES, st, rect, circ, path_, line_, label, starPoints, spark, MOTIFS, K, wrapW };
