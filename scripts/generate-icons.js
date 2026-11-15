/**
 * Site and brand icons, all drawn from the 11:11 mark in brand-mark.js.
 *
 *   node scripts/generate-icons.js
 *
 * Writes:
 *   assets/favicon.svg             browser tab icon, round variant (every page links it)
 *   branding/logo-icon.svg         512px, the logo in the home page's structured data
 *   branding/profile-picture.svg   1000px social profile picture, mark inside the circle-crop safe zone
 *   branding/logo-horizontal.svg   mark + ELEVVEN11 STUDIO wordmark
 */
const fs = require('fs');
const path = require('path');
const { markShapes, iconSvg, roundIconSvg, GRADIENT } = require('./brand-mark');

const ROOT = path.join(__dirname, '..');
const out = (rel) => path.join(ROOT, rel);

// Profile pictures get circle-cropped by Facebook, Instagram and WhatsApp. A
// 600px mark keeps its rounded corners about 370px from the centre, inside
// the ~430px safe radius.
const profilePicture = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    ${GRADIENT}
    <radialGradient id="glow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1000" height="1000" fill="#0b0a10"/>
  <circle cx="500" cy="500" r="500" fill="url(#glow)"/>
  <g transform="translate(200 200) scale(${600 / 512})">${markShapes('url(#mark)', 14)}</g>
</svg>
`;

// Name variant: stacked wordmark only, centred in the same safe zone.
const profilePictureName = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <style>text { font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; }</style>
    ${GRADIENT}
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0c866"/><stop offset="100%" stop-color="#c99a2e"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="60%">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1000" height="1000" fill="#0b0a10"/>
  <circle cx="500" cy="500" r="500" fill="url(#glow)"/>
  <text x="500" y="472" text-anchor="middle" font-weight="800" font-size="118" letter-spacing="2" fill="url(#mark)">ELEVVEN11</text>
  <text x="500" y="580" text-anchor="middle" font-weight="700" font-size="72" letter-spacing="18" fill="url(#gold)">STUDIO</text>
</svg>
`;

// Icon-only profile pictures in alternate colours: [name, light stop, dark stop, glow].
const PALETTES = [
  ['gold', '#f0c866', '#c99a2e', '#c99a2e'],
  ['white', '#ffffff', '#cfd2dc', '#ffffff'],
  ['blue', '#93c5fd', '#3b82f6', '#3b82f6'],
  ['purple', '#d8b4fe', '#9333ea', '#9333ea'],
  ['coral', '#fdba74', '#f43f5e', '#f43f5e'],
];
const colourPicture = ([, a, b, glow]) => profilePicture
  .replace('<stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#22c55e"/>', `<stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/>`)
  .replace(/stop-color="#22c55e"/g, `stop-color="${glow}"`);

const logoHorizontal =`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 220" width="900" height="220">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&amp;display=swap');
      text { font-family: 'Outfit', 'Segoe UI', sans-serif; }
    </style>
    ${GRADIENT}
  </defs>

  <!-- Icon mark: 11:11 -->
  <g transform="translate(20 20) scale(${180 / 512})">
    <rect width="512" height="512" rx="116" fill="#0b0a10"/>
    ${markShapes('url(#mark)', 16)}
  </g>

  <!-- Wordmark -->
  <text x="240" y="130" font-weight="800" font-size="64" letter-spacing="0.5" fill="url(#mark)">ELEVVEN11</text>
  <text x="242" y="180" font-weight="700" font-size="34" letter-spacing="6" fill="#a79f95">STUDIO</text>
</svg>
`;

fs.writeFileSync(out('assets/favicon.svg'), roundIconSvg());
fs.writeFileSync(out('branding/logo-icon.svg'), iconSvg(512));
fs.writeFileSync(out('branding/profile-picture.svg'), profilePicture);
for (const pal of PALETTES) fs.writeFileSync(out(`branding/profile-picture-${pal[0]}.svg`), colourPicture(pal));
fs.writeFileSync(out('branding/profile-picture-name.svg'), profilePictureName);
fs.writeFileSync(out('branding/logo-horizontal.svg'), logoHorizontal);
console.log('icons written');
