/**
 * Regenerates the Facebook, Facebook Group and LinkedIn cover images in branding/.
 *
 *   cover-facebook.png        1640x624  (2x of 820x312 - Facebook Page cover)
 *   cover-facebook-group.png  1640x856  (Facebook Group cover)
 *   cover-linkedin.png        1128x376
 *
 * All three show real demo screenshots (assets/previews) in browser frames
 * next to the studio name. Layout constraints worth keeping: both Facebook
 * covers centre-crop on mobile, so text stays inside the safe band; LinkedIn
 * overlays the company logo bottom-left, so that corner is left empty. The
 * Group cover reuses the Page cover's exact layout, shifted down 116px (half
 * of the extra 232px of height) so it stays vertically centred.
 *
 *   cd scripts && npm install && npm run covers
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'branding');

/* Real demo screenshots in browser chrome, as a staggered cluster. Positions
   are in a 570x452 reference box, scaled by k. */
const SHOTS = ['consultant', 'barber', 'fitness'];
const shotUri = {};

function frame(x, y, w, key) {
  const r = w / 400;
  const bar = 28 * r;
  const ih = w * 420 / 800;
  const h = bar + ih;
  const id = 'clip' + Math.round(x) + '_' + Math.round(y);
  return `
  <g filter="url(#shadow)">
    <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${10 * r}"/></clipPath>
    <g clip-path="url(#${id})">
      <rect x="${x}" y="${y}" width="${w}" height="${bar}" fill="#221d2e"/>
      <image href="${shotUri[key]}" x="${x}" y="${y + bar}" width="${w}" height="${ih}"/>
    </g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${10 * r}" fill="none" stroke="rgba(247,243,236,0.2)"/>
    <circle cx="${x + 14 * r}" cy="${y + bar / 2}" r="${4 * r}" fill="#ff5f57"/>
    <circle cx="${x + 27 * r}" cy="${y + bar / 2}" r="${4 * r}" fill="#febc2e"/>
    <circle cx="${x + 40 * r}" cy="${y + bar / 2}" r="${4 * r}" fill="#28c840"/>
    <rect x="${x + 58 * r}" y="${y + 6 * r}" width="${w - 76 * r}" height="${16 * r}" rx="${8 * r}" fill="rgba(11,10,16,0.65)"/>
  </g>`;
}

function browser(ox, oy, k) {
  return frame(ox, oy + 12 * k, 400 * k, SHOTS[0]) +
         frame(ox + 220 * k, oy + 50 * k, 350 * k, SHOTS[1]) +
         frame(ox + 80 * k, oy + 190 * k, 440 * k, SHOTS[2]);
}

const defs = `
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
    </filter>
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
const facebook = () => `<svg xmlns="http://www.w3.org/2000/svg" width="1640" height="624" viewBox="0 0 1640 624">
  ${defs}
  <rect width="1640" height="624" fill="#0b0a10"/>
  <rect width="1640" height="624" fill="url(#g1)"/>
  <rect width="1640" height="624" fill="url(#g2)"/>
  <rect width="1640" height="624" fill="url(#dots)"/>
  <rect width="1640" height="8" fill="url(#accent)"/>
  <g font-family="Segoe UI, Arial, sans-serif">
    <text x="190" y="175" fill="#f7f3ec" font-size="34" font-weight="700" letter-spacing="6">ELEVVEN11 STUDIO</text>
    <text x="190" y="278" fill="#f7f3ec" font-size="50" font-weight="700">Simple Websites.</text>
    <text x="190" y="338" fill="url(#accent)" font-size="50" font-weight="700">No Monthly Hosting Fee.</text>
    <text x="190" y="386" fill="#a79f95" font-size="24">For small businesses and freelancers in Nigeria.</text>
    ${pills(['42 live demos', '14 industries', 'From NGN 50,000'], 190, 414, 22, 20)}
    <text x="190" y="516" fill="#7a7268" font-size="22">elevven11studio.github.io</text>
    ${browser(880, 100, 1)}
  </g>
</svg>`;

/* ---- Facebook Group: 1640x856. Same layout as the Page cover above,
   shifted down 116px (half of the 232px height difference) to stay
   vertically centred, with a mirrored accent bar along the bottom edge. ---- */
const facebookGroup = () => `<svg xmlns="http://www.w3.org/2000/svg" width="1640" height="856" viewBox="0 0 1640 856">
  ${defs}
  <rect width="1640" height="856" fill="#0b0a10"/>
  <rect width="1640" height="856" fill="url(#g1)"/>
  <rect width="1640" height="856" fill="url(#g2)"/>
  <rect width="1640" height="856" fill="url(#dots)"/>
  <rect width="1640" height="8" fill="url(#accent)"/>
  <rect y="848" width="1640" height="8" fill="url(#accent)"/>
  <g font-family="Segoe UI, Arial, sans-serif">
    <text x="190" y="291" fill="#f7f3ec" font-size="34" font-weight="700" letter-spacing="6">FACEBOOK GROUP</text>
    <text x="190" y="394" fill="#f7f3ec" font-size="42" font-weight="700">I need a Simple website /</text>
    <text x="190" y="454" fill="url(#accent)" font-size="42" font-weight="700">Elevven11 Studio</text>
    <text x="190" y="502" fill="#a79f95" font-size="24">Get your website built. Meet other owners.</text>
    ${pills(['Website help', 'Networking', 'Member offers'], 190, 530, 22, 20)}
    <text x="190" y="632" fill="#7a7268" font-size="22">elevven11studio.github.io</text>
    ${browser(880, 216, 1)}
  </g>
</svg>`;

/* ---- LinkedIn: 1128x376. Bottom-left is reserved for the company logo
   overlay, so the text block starts further right. ---- */
const linkedin = () => `<svg xmlns="http://www.w3.org/2000/svg" width="1128" height="376" viewBox="0 0 1128 376">
  ${defs}
  <rect width="1128" height="376" fill="#0b0a10"/>
  <rect width="1128" height="376" fill="url(#g1)"/>
  <rect width="1128" height="376" fill="url(#g2)"/>
  <rect width="1128" height="376" fill="url(#dots)"/>
  <rect width="1128" height="6" fill="url(#accent)"/>
  <g font-family="Segoe UI, Arial, sans-serif">
    <text x="262" y="102" fill="#f7f3ec" font-size="24" font-weight="700" letter-spacing="5">ELEVVEN11 STUDIO</text>
    <text x="262" y="164" fill="#f7f3ec" font-size="35" font-weight="700">Simple Websites.</text>
    <text x="262" y="208" fill="url(#accent)" font-size="35" font-weight="700">No Monthly Hosting Fee.</text>
    <text x="262" y="248" fill="#a79f95" font-size="18">For small businesses and freelancers in Nigeria.</text>
    ${pills(['42 live demos', '14 industries', 'From NGN 50,000'], 262, 270, 14, 12)}
    <text x="262" y="348" fill="#7a7268" font-size="16">elevven11studio.github.io</text>
    ${browser(730, 40, 0.62)}
  </g>
</svg>`;

(async () => {
  for (const k of SHOTS) {
    const jpg = await sharp(path.join(ROOT, 'assets/previews', k + '.webp')).jpeg({ quality: 82 }).toBuffer();
    shotUri[k] = 'data:image/jpeg;base64,' + jpg.toString('base64');
  }
  for (const [name, svg] of [['cover-facebook', facebook()], ['cover-facebook-group', facebookGroup()], ['cover-linkedin', linkedin()]]) {
    const f = path.join(OUT, name + '.png');
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(f);
    fs.writeFileSync(path.join(OUT, name + '.svg'), svg);
    const m = await sharp(f).metadata();
    console.log(name.padEnd(18), m.width + 'x' + m.height, (fs.statSync(f).size / 1024).toFixed(0) + 'K');
  }
})();
