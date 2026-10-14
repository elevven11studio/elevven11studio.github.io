/**
 * Store branding for the Elevven11 Chrome Web Store presence: a storefront
 * icon and a banner. New artwork only; nothing on the site references these.
 *
 *   branding/store/icon.svg / icon-512.png / icon-128.png
 *   branding/store/banner.svg / banner-1400x560.png   (marquee promo size)
 *
 * The icon is a green tile with a dark awning and shopfront carrying the
 * brand's 11:11, so it reads as "store" at 128px and still belongs to the
 * dark 11:11 app icon. The banner shows the four extensions by their own
 * icons and accent colours.
 *
 *   cd scripts && npm run store-brand
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
// Same 11:11 geometry as brand-mark.js (which does not export its digits helper).
const STEMS = [72, 171, 329, 428];
const one = (x) => '<path d="M' + (x + 5) + ' 202H' + (x + 26) + 'V323H' + x + 'V229L' + (x - 25) + ' 243V219Z"/>';
const digits = (fill) => '<g fill="' + fill + '">' + STEMS.map(one).join('') + '<circle cx="256" cy="209" r="13"/><circle cx="256" cy="303" r="13"/></g>';

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'branding/store');
fs.mkdirSync(OUT, { recursive: true });

const INK = '#0b0a10';

/* ---------------- icon ---------------- */

function iconSvg() {
  // Awning: five scallops across the top of the shopfront.
  const x0 = 96, x1 = 416, y0 = 120, yEdge = 214, r = (x1 - x0) / 10;
  let scallops = '';
  for (let i = 0; i < 5; i++) {
    const cx = x0 + r + i * r * 2;
    scallops += `<circle cx="${cx}" cy="${yEdge}" r="${r}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#22c55e"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#g)"/>
  <g fill="${INK}">
    <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${yEdge - y0}" rx="14"/>
    ${scallops}
    <rect x="124" y="270" width="264" height="150" rx="12"/>
  </g>
  <g transform="translate(106 187) scale(0.6)">${digits('url(#g)')}</g>
</svg>
`;
}

/* ---------------- banner ---------------- */

const EXT = [
  { k: 'webguard', n: 'WebGuard', t: 'Spot the fake', c: '#38bdf8' },
  { k: 'webinspect', n: 'WebInspect', t: 'Understand any site', c: '#a78bfa' },
  { k: 'shopinspect', n: 'ShopInspect', t: 'Check before you buy', c: '#2dd4bf' },
  { k: 'siteextract', n: 'SiteExtract', t: 'Page to starter project', c: '#fb923c' },
];

function bannerSvg() {
  const W = 1400, H = 560;
  const uri = (k) => 'data:image/png;base64,'
    + fs.readFileSync(path.join(ROOT, 'assets', k, 'icon-128.png')).toString('base64');

  // 2x2 grid of extension cards on the right.
  const cw = 300, ch = 170, gx = 20, gy = 20, x0 = 720, y0 = 110;
  const cards = EXT.map((e, i) => {
    const x = x0 + (i % 2) * (cw + gx), y = y0 + Math.floor(i / 2) * (ch + gy);
    return `<g>
      <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="22" fill="#15121d" stroke="rgba(247,243,236,0.14)"/>
      <rect x="${x}" y="${y}" width="${cw}" height="5" rx="2.5" fill="${e.c}"/>
      <image href="${uri(e.k)}" x="${x + 24}" y="${y + 30}" width="68" height="68"/>
      <text x="${x + 24}" y="${y + 132}" fill="#f7f3ec" font-size="26" font-weight="700">${e.n}</text>
      <text x="${x + 24}" y="${y + 158}" fill="#a79f95" font-size="19">${e.t}</text>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#22c55e"/>
    </linearGradient>
    <radialGradient id="g1" cx="8%" cy="10%" r="60%">
      <stop offset="0%" stop-color="#86efac" stop-opacity="0.17"/><stop offset="100%" stop-color="#86efac" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="96%" cy="96%" r="58%">
      <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.15"/><stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.6" fill="rgba(247,243,236,0.09)"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#g1)"/>
  <rect width="${W}" height="${H}" fill="url(#g2)"/>
  <rect width="${W}" height="8" fill="url(#accent)"/>
  <g font-family="Segoe UI, Arial, sans-serif">
    <g transform="translate(90 112) scale(0.19)">${iconInner()}</g>
    <text x="206" y="150" fill="#f7f3ec" font-size="32" font-weight="700" letter-spacing="6">ELEVVEN11</text>
    <text x="90" y="290" fill="#f7f3ec" font-size="72" font-weight="700" letter-spacing="-1">Free Chrome</text>
    <text x="90" y="372" fill="url(#accent)" font-size="72" font-weight="700" letter-spacing="-1">Extensions.</text>
    <text x="90" y="430" fill="#a79f95" font-size="28">No account. Nothing uploaded.</text>
    ${cards}
  </g>
</svg>
`;
}

// The icon's artwork without its own <svg> wrapper, for placing inside the banner.
function iconInner() {
  return iconSvg().replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    .replace('id="g"', 'id="gi"').replace(/url\(#g\)/g, 'url(#gi)');
}

(async () => {
  const icon = iconSvg();
  fs.writeFileSync(path.join(OUT, 'icon.svg'), icon);
  for (const size of [512, 128]) {
    await sharp(Buffer.from(icon), { density: 72 * size / 512 }).resize(size, size)
      .png({ compressionLevel: 9 }).toFile(path.join(OUT, `icon-${size}.png`));
  }
  const banner = bannerSvg();
  fs.writeFileSync(path.join(OUT, 'banner.svg'), banner);
  await sharp(Buffer.from(banner)).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'banner-1400x560.png'));
  console.log('wrote icon (svg, 512, 128) and banner (svg, 1400x560) to branding/store/');
})().catch((e) => { console.error(e); process.exitCode = 1; });
