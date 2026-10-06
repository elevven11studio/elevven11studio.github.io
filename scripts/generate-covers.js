/**
 * Regenerates the Facebook, Facebook Group and LinkedIn cover images in branding/.
 *
 *   cover-facebook.png        1640x624  (2x of 820x312 - Facebook Page cover)
 *   cover-facebook-group.png  1640x856  (Facebook Group cover)
 *   cover-linkedin.png        1128x376
 *
 * All three render the site as a browser mockup. Layout constraints worth
 * keeping: both Facebook covers centre-crop on mobile, so text stays inside
 * the safe band; LinkedIn overlays the company logo bottom-left, so that
 * corner is left empty. The Group cover reuses the Page cover's exact layout,
 * shifted down 116px (half of the extra 232px of height) so it stays
 * vertically centred rather than just padding the bottom.
 *
 *   cd tools && npm install && npm run covers
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'branding');

/* A miniature of the site rendered inside browser chrome. All internals are
   proportional to w so the same component works at cover and banner scale. */
function browser(x, y, w, h) {
  const r = w / 570;                    // scale factor against the reference width
  const bar = 40 * r;
  const pad = 22 * r;
  const cw = w - pad * 2;               // inner content width
  const top = y + bar;

  const dot = (i, c) => `<circle cx="${x + 20 * r + i * 17 * r}" cy="${y + bar / 2}" r="${5 * r}" fill="${c}"/>`;
  const bary = (ty, bw, fill, bh = 13 * r) =>
    `<rect x="${x + pad}" y="${ty}" width="${cw * bw}" height="${bh}" rx="${bh / 2}" fill="${fill}"/>`;

  const cardW = (cw - 16 * r * 2) / 3;
  const cards = [0, 1, 2].map(i => `
    <rect x="${x + pad + i * (cardW + 16 * r)}" y="${top + 176 * r}" width="${cardW}" height="${74 * r}" rx="${8 * r}"
          fill="rgba(247,243,236,0.05)" stroke="rgba(247,243,236,0.10)"/>
    <rect x="${x + pad + i * (cardW + 16 * r) + 12 * r}" y="${top + 192 * r}" width="${cardW * 0.5}" height="${8 * r}" rx="${4 * r}" fill="#86efac" opacity="0.75"/>
    <rect x="${x + pad + i * (cardW + 16 * r) + 12 * r}" y="${top + 210 * r}" width="${cardW * 0.78}" height="${6 * r}" rx="${3 * r}" fill="rgba(247,243,236,0.22)"/>
    <rect x="${x + pad + i * (cardW + 16 * r) + 12 * r}" y="${top + 224 * r}" width="${cardW * 0.6}" height="${6 * r}" rx="${3 * r}" fill="rgba(247,243,236,0.16)"/>`).join('');

  // nav dashes
  const nav = [0, 1, 2, 3].map(i =>
    `<rect x="${x + cw - 20 * r - (4 - i) * 42 * r}" y="${top + 22 * r}" width="${30 * r}" height="${7 * r}" rx="${3.5 * r}" fill="rgba(247,243,236,0.28)"/>`).join('');

  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${14 * r}" fill="#15121d" stroke="rgba(247,243,236,0.14)"/>
    <path d="M${x} ${y + 14 * r} a${14 * r} ${14 * r} 0 0 1 ${14 * r} ${-14 * r} h${w - 28 * r} a${14 * r} ${14 * r} 0 0 1 ${14 * r} ${14 * r} v${bar - 14 * r} h${-w} z" fill="#221d2e"/>
    ${dot(0, '#ff5f57')}${dot(1, '#febc2e')}${dot(2, '#28c840')}
    <rect x="${x + 82 * r}" y="${y + 9 * r}" width="${w - 104 * r}" height="${22 * r}" rx="${11 * r}" fill="rgba(11,10,16,0.65)"/>
    <text x="${x + 96 * r}" y="${y + 25 * r}" font-size="${12 * r}" fill="#8f877c">elevven11studio.github.io</text>

    <rect x="${x + 1}" y="${top}" width="${w - 2}" height="${h - bar - 1}" fill="#0b0a10"/>
    <rect x="${x + 1}" y="${top}" width="${w - 2}" height="${3 * r}" fill="url(#accent)"/>

    <rect x="${x + pad}" y="${top + 20 * r}" width="${58 * r}" height="${10 * r}" rx="${5 * r}" fill="#f7f3ec" opacity="0.9"/>
    ${nav}

    ${bary(top + 62 * r, 0.62, '#f7f3ec', 17 * r)}
    ${bary(top + 88 * r, 0.78, 'url(#accent)', 17 * r)}
    ${bary(top + 118 * r, 0.52, 'rgba(247,243,236,0.20)', 8 * r)}
    ${bary(top + 132 * r, 0.40, 'rgba(247,243,236,0.14)', 8 * r)}

    <rect x="${x + pad}" y="${top + 150 * r}" width="${104 * r}" height="${20 * r}" rx="${10 * r}" fill="url(#accent)"/>
    <rect x="${x + pad + 116 * r}" y="${top + 150 * r}" width="${92 * r}" height="${20 * r}" rx="${10 * r}"
          fill="none" stroke="rgba(247,243,236,0.28)"/>
    ${cards}
  </g>`;
}

const defs = `
  <defs>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#22c55e"/>
    </linearGradient>
    <radialGradient id="g1" cx="6%" cy="10%" r="62%">
      <stop offset="0%" stop-color="#86efac" stop-opacity="0.17"/><stop offset="100%" stop-color="#86efac" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="96%" cy="96%" r="60%">
      <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.15"/><stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/>
    </radialGradient>
    <!-- Matches the site's own section::before dot-grid background-image
         (style.css): 1.5px radius dots on a 28x28 grid. -->
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="rgba(247,243,236,0.09)"/>
    </pattern>
  </defs>`;

const pills = (labels, x0, y, fs, padX) => {
  let x = x0;
  return labels.map(t => {
    const w = Math.round(t.length * fs * 0.56 + padX * 2);
    const g = `<g><rect x="${x}" y="${y}" width="${w}" height="${fs * 2.1}" rx="${fs * 1.05}"
        fill="rgba(247,243,236,0.06)" stroke="rgba(247,243,236,0.17)"/>
      <text x="${x + w / 2}" y="${y + fs * 1.42}" fill="#f7f3ec" font-size="${fs}" text-anchor="middle">${t}</text></g>`;
    x += w + fs * 0.7;
    return g;
  }).join('');
};

/* ---- Facebook: 1640x624 (2x of 820x312). Keeps content inside the band that
   survives Facebook's mobile centre-crop. ---- */
const facebook = `<svg xmlns="http://www.w3.org/2000/svg" width="1640" height="624" viewBox="0 0 1640 624">
  ${defs}
  <rect width="1640" height="624" fill="#0b0a10"/>
  <rect width="1640" height="624" fill="url(#g1)"/>
  <rect width="1640" height="624" fill="url(#g2)"/>
  <rect width="1640" height="8" fill="url(#accent)"/>
  <g font-family="Segoe UI, Arial, sans-serif">
    <text x="190" y="190" fill="#f7f3ec" font-size="34" font-weight="700" letter-spacing="6">ELEVVEN11 STUDIO</text>
    <text x="190" y="278" fill="#f7f3ec" font-size="50" font-weight="700">Simple Websites.</text>
    <text x="190" y="338" fill="url(#accent)" font-size="50" font-weight="700">No Monthly Hosting Fee.</text>
    <text x="190" y="386" fill="#a79f95" font-size="24">For small businesses and freelancers in Nigeria.</text>
    ${pills(['42 live demos', '14 industries', 'From NGN 50,000'], 190, 414, 22, 20)}
    <text x="190" y="516" fill="#7a7268" font-size="22">elevven11studio.github.io</text>
  </g>
  ${browser(880, 152, 570, 320)}
</svg>`;

/* ---- Facebook Group: 1640x856. Same layout as the Page cover above,
   shifted down 116px (half of the 232px height difference) to stay
   vertically centred, with a mirrored accent bar along the bottom edge. ---- */
const facebookGroup = `<svg xmlns="http://www.w3.org/2000/svg" width="1640" height="856" viewBox="0 0 1640 856">
  ${defs}
  <rect width="1640" height="856" fill="#0b0a10"/>
  <rect width="1640" height="856" fill="url(#g1)"/>
  <rect width="1640" height="856" fill="url(#g2)"/>
  <rect width="1640" height="856" fill="url(#dots)"/>
  <rect width="1640" height="8" fill="url(#accent)"/>
  <rect y="848" width="1640" height="8" fill="url(#accent)"/>
  <g font-family="Segoe UI, Arial, sans-serif">
    <text x="190" y="306" fill="#f7f3ec" font-size="34" font-weight="700" letter-spacing="6">FACEBOOK GROUP</text>
    <text x="190" y="394" fill="#f7f3ec" font-size="42" font-weight="700">I need a Simple website /</text>
    <text x="190" y="454" fill="url(#accent)" font-size="42" font-weight="700">Elevven11 Studio</text>
    <text x="190" y="502" fill="#a79f95" font-size="24">Get your website built. Meet other owners.</text>
    ${pills(['Website help', 'Networking', 'Member offers'], 190, 530, 22, 20)}
    <text x="190" y="632" fill="#7a7268" font-size="22">elevven11studio.github.io</text>
  </g>
  ${browser(880, 268, 570, 320)}
</svg>`;

/* ---- LinkedIn: 1128x376. Bottom-left is reserved for the company logo
   overlay, so the text block starts further right. ---- */
const linkedin = `<svg xmlns="http://www.w3.org/2000/svg" width="1128" height="376" viewBox="0 0 1128 376">
  ${defs}
  <rect width="1128" height="376" fill="#0b0a10"/>
  <rect width="1128" height="376" fill="url(#g1)"/>
  <rect width="1128" height="376" fill="url(#g2)"/>
  <rect width="1128" height="6" fill="url(#accent)"/>
  <g font-family="Segoe UI, Arial, sans-serif">
    <text x="262" y="108" fill="#f7f3ec" font-size="24" font-weight="700" letter-spacing="5">ELEVVEN11 STUDIO</text>
    <text x="262" y="164" fill="#f7f3ec" font-size="35" font-weight="700">Simple Websites.</text>
    <text x="262" y="208" fill="url(#accent)" font-size="35" font-weight="700">No Monthly Hosting Fee.</text>
    <text x="262" y="248" fill="#a79f95" font-size="18">For small businesses and freelancers in Nigeria.</text>
    ${pills(['42 live demos', '14 industries', 'From NGN 50,000'], 262, 270, 16, 15)}
    <text x="262" y="348" fill="#7a7268" font-size="16">elevven11studio.github.io</text>
  </g>
  ${browser(726, 62, 356, 252)}
</svg>`;

(async () => {
  for (const [name, svg] of [['cover-facebook', facebook], ['cover-facebook-group', facebookGroup], ['cover-linkedin', linkedin]]) {
    const f = path.join(OUT, name + '.png');
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(f);
    fs.writeFileSync(path.join(OUT, name + '.svg'), svg);
    const m = await sharp(f).metadata();
    console.log(name.padEnd(18), m.width + 'x' + m.height, (fs.statSync(f).size / 1024).toFixed(0) + 'K');
  }
})();
