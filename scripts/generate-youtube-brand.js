/**
 * YouTube channel art in branding/youtube/.
 *
 *   banner.png      2560x1440  channel banner
 *   avatar.png      800x800    channel picture (mark only, circle-crop safe)
 *   watermark.png   150x150    video watermark, transparent
 *
 * YouTube shows different crops of the banner: TV gets all of it, desktop a
 * 2560x423 band, mobile only the centre 1546x423. Everything that matters stays
 * inside that centre box (x 507-2053, y 508-931); the sides are decoration only.
 *
 *   cd scripts && npm install && npm run youtube
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { markShapes, watermark, GRADIENT } = require('./brand-mark');

const OUT = path.join(__dirname, '..', 'branding', 'youtube');
fs.mkdirSync(OUT, { recursive: true });

const FONT = 'Segoe UI, Arial, sans-serif';

const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1440" viewBox="0 0 2560 1440">
  <defs>
    ${GRADIENT}
    <radialGradient id="g1" cx="12%" cy="15%" r="60%">
      <stop offset="0%" stop-color="#86efac" stop-opacity="0.16"/><stop offset="100%" stop-color="#86efac" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="92%" cy="90%" r="55%">
      <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.14"/><stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="rgba(247,243,236,0.08)"/>
    </pattern>
  </defs>
  <rect width="2560" height="1440" fill="#0b0a10"/>
  <rect width="2560" height="1440" fill="url(#g1)"/>
  <rect width="2560" height="1440" fill="url(#g2)"/>
  <rect width="2560" height="1440" fill="url(#dots)"/>
  ${watermark(-200, 430, 1.1, '#86efac', 0.07)}
  ${watermark(2230, 430, 1.1, '#86efac', 0.07)}
  <g transform="translate(560 548) scale(${340 / 512})">${markShapes('url(#mark)', 16)}</g>
  <g font-family="${FONT}">
    <text x="950" y="660" fill="#f7f3ec" font-size="92" font-weight="800" letter-spacing="8">ELEVVEN11 STUDIO</text>
    <text x="950" y="755" fill="url(#mark)" font-size="50" font-weight="700">Simple Websites. No Monthly Hosting Fee.</text>
    <text x="950" y="832" fill="#a79f95" font-size="40">Websites for small businesses in Nigeria</text>
    <text x="950" y="896" fill="#7a7268" font-size="34">elevven11studio.github.io</text>
  </g>
</svg>`;

const avatar = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 1000 1000">
  <defs>
    ${GRADIENT}
    <radialGradient id="glow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.22"/><stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1000" height="1000" fill="#0b0a10"/>
  <circle cx="500" cy="500" r="500" fill="url(#glow)"/>
  <g transform="translate(200 200) scale(${600 / 512})">${markShapes('url(#mark)', 14)}</g>
</svg>`;

const mark150 = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 512 512">
  <g>${markShapes('#ffffff', 28)}</g>
</svg>`;

(async () => {
  const jobs = [['banner', banner], ['avatar', avatar], ['watermark', mark150]];
  for (const [name, svg] of jobs) {
    const f = path.join(OUT, name + '.png');
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(f);
    const m = await sharp(f).metadata();
    console.log(name.padEnd(10), m.width + 'x' + m.height, (fs.statSync(f).size / 1024).toFixed(0) + 'K');
  }
})();
