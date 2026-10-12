/**
 * Site and brand icons, all drawn from the 11:11 mark in brand-mark.js.
 *
 *   node scripts/generate-icons.js
 *
 * Writes:
 *   assets/favicon.svg             browser tab icon (every page links it)
 *   branding/logo-icon.svg         512px, the logo in the home page's structured data
 *   branding/profile-picture.svg   1000px social profile picture, mark inside the circle-crop safe zone
 *   branding/logo-horizontal.svg   mark + ELEVVEN11 STUDIO wordmark
 */
const fs = require('fs');
const path = require('path');
const { markShapes, iconSvg, GRADIENT } = require('./brand-mark');

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

const logoHorizontal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 220" width="900" height="220">
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

fs.writeFileSync(out('assets/favicon.svg'), iconSvg());
fs.writeFileSync(out('branding/logo-icon.svg'), iconSvg(512));
fs.writeFileSync(out('branding/profile-picture.svg'), profilePicture);
fs.writeFileSync(out('branding/logo-horizontal.svg'), logoHorizontal);
console.log('icons written');
