/**
 * Drawing helpers shared by the tool and extension promo generators:
 * backdrop, pills, cards and the two output formats. Everything returns SVG
 * strings, except qrPng, which returns a PNG buffer to composite on top.
 */
const fs = require('fs');
const sharp = require('sharp');
const QRCode = require('qrcode');

const SITE = 'https://elevven11studio.github.io';
const DOT = '·';

const NEON = { from: '#86efac', to: '#22c55e', glow: '#2dd4bf' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const utm = (campaign) => 'utm_source=promo&utm_medium=qr&utm_campaign=' + campaign;
const fitSize = (text, maxWidth, start, min = 28) => {
  let size = start;
  while (size > min && text.length * size * 0.55 > maxWidth) size -= 2;
  return size;
};

function defs(a = NEON) {
  return '<defs>'
    + '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="' + a.from + '"/><stop offset="100%" stop-color="' + a.to + '"/></linearGradient>'
    + '<radialGradient id="g1" cx="10%" cy="14%" r="60%"><stop offset="0%" stop-color="' + a.from + '" stop-opacity="0.18"/>'
    + '<stop offset="100%" stop-color="' + a.from + '" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="g2" cx="92%" cy="90%" r="58%"><stop offset="0%" stop-color="' + a.glow + '" stop-opacity="0.15"/>'
    + '<stop offset="100%" stop-color="' + a.glow + '" stop-opacity="0"/></radialGradient>'
    + '<pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">'
    + '<circle cx="2" cy="2" r="1.4" fill="rgba(247,243,236,0.09)"/></pattern>'
    + '</defs>';
}

// Faint 11:11 mark bleeding off the top-right corner, same treatment as the
// social cards in branding/og.
const watermark = (W) => '<g transform="translate(' + (W - 330) + ' -110) scale(0.8)" opacity="0.06" '
  + 'font-family="Segoe UI, Arial, sans-serif">'
  + '<rect x="6" y="6" width="500" height="500" rx="110" fill="none" stroke="url(#accent)" stroke-width="12"/>'
  + '<text x="226" y="324" text-anchor="end" font-weight="800" font-size="171" fill="url(#accent)">11</text>'
  + '<text x="286" y="324" font-weight="800" font-size="171" fill="url(#accent)">11</text>'
  + '<circle cx="256" cy="209" r="13" fill="url(#accent)"/><circle cx="256" cy="303" r="13" fill="url(#accent)"/></g>';

const backdrop = (W, H) => '<rect width="' + W + '" height="' + H + '" fill="#0b0a10"/>'
  + '<rect width="' + W + '" height="' + H + '" fill="url(#g1)"/>'
  + '<rect width="' + W + '" height="' + H + '" fill="url(#g2)"/>'
  + '<rect width="' + W + '" height="' + H + '" fill="url(#dots)"/>'
  + watermark(W)
  + '<rect width="' + W + '" height="10" fill="url(#accent)"/>';

function pills(labels, x, y, fs) {
  return labels.map((t) => {
    const w = Math.round(t.length * fs * 0.56 + 48);
    const g = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (fs * 2.2) + '" rx="' + (fs * 1.1)
      + '" fill="rgba(247,243,236,0.06)" stroke="rgba(247,243,236,0.17)"/>'
      + '<text x="' + (x + w / 2) + '" y="' + (y + fs * 1.48) + '" fill="#f7f3ec" font-size="' + fs
      + '" text-anchor="middle">' + esc(t) + '</text>';
    x += w + fs * 0.6;
    return g;
  }).join('');
}

const cardFrame = (x, y, w, h) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h
  + '" rx="26" fill="#15121d" stroke="rgba(247,243,236,0.16)"/>'
  + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="5" rx="2.5" fill="url(#accent)"/>';

// Card builders return { svg, h, layers } for a card placed at (x, y).
function rowsCard(p, x, y, w, k) {
  const pad = k.pad, rowH = k.rowH;
  const sum = p.summary.join('  ' + DOT + '  ');
  const h = pad * 2 + k.sumFs * 1.7 + p.rows.length * rowH;
  let svg = cardFrame(x, y, w, h)
    + '<text x="' + (x + pad) + '" y="' + (y + pad + k.sumFs) + '" fill="#8a8175" font-size="' + k.sumFs
    + '" letter-spacing="1">' + esc(sum.toUpperCase()) + '</text>';
  let cy = y + pad + k.sumFs * 1.7;
  p.rows.forEach(([label, value, main], i) => {
    const base = cy + rowH * 0.66;
    if (i > 0) svg += '<line x1="' + (x + pad) + '" y1="' + cy + '" x2="' + (x + w - pad) + '" y2="' + cy
      + '" stroke="rgba(247,243,236,0.12)"/>';
    svg += '<text x="' + (x + pad) + '" y="' + base + '" fill="' + (main ? '#f7f3ec' : '#a79f95') + '" font-size="'
      + (main ? k.mainFs * 0.62 : k.labelFs) + '" font-weight="' + (main ? 700 : 400) + '">' + esc(label) + '</text>'
      + '<text x="' + (x + w - pad) + '" y="' + base + '" fill="' + (main ? 'url(#accent)' : '#f7f3ec')
      + '" font-size="' + (main ? k.mainFs : k.valFs) + '" font-weight="700" text-anchor="end">' + esc(value) + '</text>';
    cy += rowH;
  });
  return { svg, h, layers: [] };
}

// Monospace lines. A line flagged 1 is drawn as an error; `status` is optional.
function codeCard(p, x, y, w, k) {
  const pad = k.pad, lh = k.rowH * 0.72, fs = k.valFs;
  const h = pad * 2 + p.lines.length * lh + (p.status ? k.sumFs * 3.2 : 0);
  let svg = cardFrame(x, y, w, h);
  p.lines.forEach(([t, bad], i) => {
    const ly = y + pad + lh * (i + 0.75);
    if (bad) svg += '<rect x="' + (x + pad / 2) + '" y="' + (ly - lh * 0.72) + '" width="' + (w - pad) + '" height="' + lh
      + '" rx="8" fill="rgba(248,113,113,0.14)"/>';
    svg += '<text x="' + (x + pad) + '" y="' + ly + '" fill="' + (bad ? '#f87171' : '#f7f3ec')
      + '" font-size="' + fs + '" font-family="Consolas, Courier New, monospace" xml:space="preserve">' + esc(t) + '</text>';
  });
  if (p.status) {
    const sy = y + h - pad - k.sumFs * 0.4;
    svg += '<text x="' + (x + pad) + '" y="' + sy + '" fill="#f87171" font-size="' + (k.sumFs * 1.15)
      + '" font-weight="600">' + esc(p.status) + '</text>';
  }
  return { svg, h, layers: [] };
}

const FORMATS = {
  square: {
    W: 1080, H: 1080, margin: 72, wordY: 108, eyeY: 166, headY: 262, headStep: 92, headSize: 84, subSize: 30,
    card: { pad: 34, rowH: 62, sumFs: 20, labelFs: 28, valFs: 30, mainFs: 50, qrDemo: 200 },
    pill: 26, ctaSize: 56, qr: 190, urlY: 1030
  },
  story: {
    W: 1080, H: 1920, margin: 80, wordY: 300, eyeY: 366, headY: 500, headStep: 104, headSize: 92, subSize: 34,
    card: { pad: 44, rowH: 92, sumFs: 24, labelFs: 36, valFs: 40, mainFs: 66, qrDemo: 360 },
    pill: 24, ctaSize: 64, qr: 280, urlY: 1625
  }
};

const qrPng = (url, px) => QRCode.toBuffer(url, {
  type: 'png', width: px, margin: 0, errorCorrectionLevel: 'M',
  color: { dark: '#0b0a10ff', light: '#ffffffff' }
});

async function render(scene, file) {
  const buf = await sharp(Buffer.from(scene.svg)).composite(scene.layers).png({ compressionLevel: 9 }).toBuffer();
  // Windows file-sync tools briefly lock freshly written PNGs, so retry the write.
  for (let i = 0; ; i++) {
    try { return fs.writeFileSync(file, buf); } catch (e) {
      if (i >= 5) throw e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
}

module.exports = {
  SITE, DOT, NEON, esc, utm, fitSize, defs, backdrop, pills, cardFrame, rowsCard, codeCard, FORMATS, qrPng, render
};
