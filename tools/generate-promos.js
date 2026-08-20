/**
 * Builds square (1080x1080) promo graphics for social posts, matching the
 * existing hand-drawn promos in promo/*.svg.
 *
 *   promo/main.png            homepage / general offer
 *   promo/agents.png          referral programme (gold accent, per the brand
 *                             rule that gold marks money/earnings moments)
 *   promo/examples.png        template library, with a real 6-up demo grid
 *   promo/demos/<slug>.png    one per demo, showing that demo's own screenshot
 *
 * The examples grid and the per-demo promos reuse assets/previews/<slug>-og.jpg,
 * so run `npm run previews` first if any template changed.
 *
 *   cd tools && npm install && npm run promos
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');

const ROOT = path.resolve(__dirname, '..');
const PREVIEWS = path.join(ROOT, 'assets/previews');
const OUT = path.join(ROOT, 'promo');
const S = 1080;
const SITE = 'https://elevven11studio.github.io';

// Tag QR scans so they are separable from ordinary traffic in GA4
// (Acquisition -> Traffic acquisition, session_medium = qr).
const utm = (campaign) => 'utm_source=promo&utm_medium=qr&utm_campaign=' + campaign;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const NAIRA = '₦';
const MIDDOT = '·';
const EMDASH = '—';

// Segoe UI bold averages ~0.55em per glyph; shrink a headline until it fits.
function fitSize(text, maxWidth, start, min = 26) {
  let size = start;
  while (size > min && text.length * size * 0.55 > maxWidth) size -= 2;
  return size;
}

function defs(accent) {
  const grad = accent === 'gold'
    ? '<stop offset="0%" stop-color="#f0c866"/><stop offset="100%" stop-color="#c99a2e"/>'
    : '<stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#22c55e"/>';
  const tint = accent === 'gold' ? '#f0c866' : '#86efac';
  return '<defs>'
    + '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">' + grad + '</linearGradient>'
    + '<radialGradient id="g1" cx="8%" cy="8%" r="65%">'
    + '<stop offset="0%" stop-color="' + tint + '" stop-opacity="0.18"/>'
    + '<stop offset="100%" stop-color="' + tint + '" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="g2" cx="94%" cy="96%" r="62%">'
    + '<stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.16"/>'
    + '<stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/></radialGradient>'
    + '</defs>';
}

const backdrop = '<rect width="' + S + '" height="' + S + '" fill="#0b0a10"/>'
  + '<rect width="' + S + '" height="' + S + '" fill="url(#g1)"/>'
  + '<rect width="' + S + '" height="' + S + '" fill="url(#g2)"/>'
  + '<rect width="' + S + '" height="9" fill="url(#accent)"/>';

const wordmark = (y) => '<text x="90" y="' + (y || 104) + '" fill="#f7f3ec" font-size="27" '
  + 'font-weight="700" letter-spacing="5">ELEVVEN11 STUDIO</text>';

const footerUrl = (y) => '<text x="90" y="' + (y || 1014) + '" fill="#7a7268" '
  + 'font-size="24">elevven11studio.github.io</text>';

function pills(labels, x0, y, fs, padX) {
  fs = fs || 26; padX = padX || 24;
  let x = x0;
  return labels.map((t) => {
    const w = Math.round(t.length * fs * 0.56 + padX * 2);
    const g = '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (fs * 2.2)
      + '" rx="' + (fs * 1.1) + '" fill="rgba(247,243,236,0.06)" stroke="rgba(247,243,236,0.17)"/>'
      + '<text x="' + (x + w / 2) + '" y="' + (y + fs * 1.48) + '" fill="#f7f3ec" font-size="' + fs
      + '" text-anchor="middle">' + esc(t) + '</text></g>';
    x += w + fs * 0.6;
    return g;
  }).join('');
}

async function render(svg, file) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file);
  return fs.statSync(file).size;
}

/* Rounds only the bottom corners, so the image sits flush under the chrome bar. */
async function roundedBottom(buf, w, h, r) {
  const mask = Buffer.from('<svg width="' + w + '" height="' + h + '">'
    + '<path d="M0 0 H' + w + ' V' + (h - r) + ' a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + r
    + ' H' + r + ' a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + (-r) + ' Z" fill="#fff"/></svg>');
  return sharp(buf).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
}

/* ---------------- QR code ---------------- */

// A QR sits bottom-right on the page promos so a printed or shared graphic is
// actionable. Dark-on-white with a generous quiet zone: scanners are far more
// reliable that way than with an inverted code on the dark brand background.
const QR_BOX = { x: 750, y: 750, size: 240, pad: 26 };
const QR_PX = QR_BOX.size - QR_BOX.pad * 2;

function qrCard(caption) {
  return '<rect x="' + QR_BOX.x + '" y="' + QR_BOX.y + '" width="' + QR_BOX.size
    + '" height="' + QR_BOX.size + '" rx="18" fill="#ffffff"/>'
    + '<text x="' + (QR_BOX.x + QR_BOX.size / 2) + '" y="1012" fill="#a79f95" font-size="21" '
    + 'text-anchor="middle">' + esc(caption) + '</text>';
}

async function renderWithQr(svg, file, url) {
  const qr = await QRCode.toBuffer(url, {
    type: 'png',
    width: QR_PX,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#0b0a10ff', light: '#ffffffff' },
  });
  await sharp(Buffer.from(svg))
    .composite([{ input: qr, left: QR_BOX.x + QR_BOX.pad, top: QR_BOX.y + QR_BOX.pad }])
    .png({ compressionLevel: 9 })
    .toFile(file);
  return fs.statSync(file).size;
}


/* ---------------- social row ---------------- */

const FB_PATH = 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-6.93h-2.4v-2.87h2.4'
  + 'v-2.19c0-2.39 1.44-3.72 3.62-3.72 1.05 0 2.15.19 2.15.19v2.36h-1.21c-1.19 0-1.56.74-1.56 1.5v1.86'
  + 'h2.66l-.43 2.87h-2.23v6.93c4.56-.93 8-4.96 8-9.8z';
const LI_PATH = 'M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5z'
  + 'm-11 19h-3v-11h3v11zm-1.5-12.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75'
  + '-.78 1.75-1.75 1.75zm13.5 12.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7'
  + 'h-3v-11h2.88v1.5h.04c.4-.76 1.38-1.56 2.84-1.56 3.03 0 3.6 2 3.6 4.59v6.47z';

/** One "icon + handle" line. scale 24px glyph up to `size`. */
function socialRow(pathD, handle, x, y, size, fontSize) {
  const s = size / 24;
  return '<g><path d="' + pathD + '" fill="#f7f3ec" opacity="0.85" transform="translate('
    + x + ',' + y + ') scale(' + s.toFixed(3) + ')"/>'
    + '<text x="' + (x + size + 22) + '" y="' + (y + size * 0.78) + '" fill="#f7f3ec" font-size="'
    + fontSize + '">' + esc(handle) + '</text></g>';
}

/* ---------------- page promos ---------------- */

function pagePromo(o) {
  const tint = o.accent === 'gold' ? '#f0c866' : '#86efac';
  const head = o.lines.map((l, i) =>
    '<text x="90" y="' + (330 + i * 92) + '" fill="'
    + (i === o.lines.length - 1 ? 'url(#accent)' : '#f7f3ec') + '" font-size="'
    + fitSize(l, 900, 76) + '" font-weight="700">' + esc(l) + '</text>').join('');
  const subY = 330 + o.lines.length * 92 + 20;
  const ctaW = Math.round(o.cta.length * 20 + 90);
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S
    + '" viewBox="0 0 ' + S + ' ' + S + '">' + defs(o.accent) + backdrop
    + '<g font-family="Segoe UI, Arial, sans-serif">'
    + wordmark()
    + '<text x="90" y="176" fill="' + tint + '" font-size="24" font-weight="600" letter-spacing="4">'
    + esc(o.eyebrow) + '</text>'
    + head
    + '<text x="90" y="' + subY + '" fill="#a79f95" font-size="30">' + esc(o.sub) + '</text>'
    + (o.extra ? o.extra(subY) : pills(o.pillLabels, 90, subY + 40))
    + '<rect x="90" y="900" width="' + ctaW + '" height="72" rx="36" fill="url(#accent)"/>'
    + '<text x="' + (90 + ctaW / 2) + '" y="947" fill="#0b0a10" font-size="30" font-weight="700" '
    + 'text-anchor="middle">' + esc(o.cta) + '</text>'
    + (o.qrCaption ? qrCard(o.qrCaption) : '')
    + footerUrl()
    + '</g></svg>';
}

/* ---------------- per-demo promo ---------------- */

const FRAME = { x: 90, y: 300, w: 900, bar: 52 };
const IMG = { w: 898, h: 471 };

// Demo pages carry a studio ribbon across the top ('Get a website like this').
// Inside a promo that duplicates the promo's own CTA and puts our branding where
// the customer's site should be, so trim it: it is the top ~48px of the 1200x630
// preview.
const RIBBON = 48;
const previewBody = (src) => sharp(src).extract({ left: 0, top: RIBBON, width: 1200, height: 630 - RIBBON });

function demoPromo(o) {
  const nameSize = fitSize(o.business, 900, 56, 30);
  const label = (o.style ? o.industry + ' ' + MIDDOT + ' ' + o.style : o.industry).toUpperCase();
  const frameH = FRAME.bar + IMG.h;
  const fx = FRAME.x, fy = FRAME.y, fw = FRAME.w;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S
    + '" viewBox="0 0 ' + S + ' ' + S + '">' + defs('neon') + backdrop
    + '<g font-family="Segoe UI, Arial, sans-serif">'
    + wordmark()
    + '<text x="90" y="166" fill="#86efac" font-size="23" font-weight="600" letter-spacing="4">'
    + esc(label) + '</text>'
    + '<text x="90" y="244" fill="#f7f3ec" font-size="' + nameSize + '" font-weight="700">'
    + esc(o.business) + '</text>'
    + '<rect x="' + fx + '" y="' + fy + '" width="' + fw + '" height="' + frameH
    + '" rx="16" fill="#15121d" stroke="rgba(247,243,236,0.16)"/>'
    + '<path d="M' + fx + ' ' + (fy + 16) + ' a16 16 0 0 1 16 -16 h' + (fw - 32)
    + ' a16 16 0 0 1 16 16 v' + (FRAME.bar - 16) + ' h' + (-fw) + ' z" fill="#221d2e"/>'
    + '<circle cx="' + (fx + 28) + '" cy="' + (fy + 26) + '" r="7" fill="#ff5f57"/>'
    + '<circle cx="' + (fx + 52) + '" cy="' + (fy + 26) + '" r="7" fill="#febc2e"/>'
    + '<circle cx="' + (fx + 76) + '" cy="' + (fy + 26) + '" r="7" fill="#28c840"/>'
    + '<rect x="' + (fx + 104) + '" y="' + (fy + 13) + '" width="' + (fw - 130)
    + '" height="26" rx="13" fill="rgba(11,10,16,0.6)"/>'
    + '<text x="90" y="895" fill="url(#accent)" font-size="46" font-weight="700">Get a website like this.</text>'
    + '<text x="90" y="944" fill="#a79f95" font-size="28">From ' + NAIRA + '50,000 one-time '
    + MIDDOT + ' no monthly hosting fee.</text>'
    + footerUrl()
    + '</g></svg>';
}

/* ---------------- run ---------------- */

(async () => {
  fs.mkdirSync(path.join(OUT, 'demos'), { recursive: true });
  let count = 0;
  const PAGE_PROMOS = 4; // main, agents, examples, follow-share

  await renderWithQr(pagePromo({
    eyebrow: 'WEBSITE DESIGN IN NIGERIA', accent: 'neon',
    lines: ['Simple Websites.', 'No Monthly', 'Hosting Fee.'],
    sub: 'For small businesses, freelancers and creators.',
    pillLabels: ['42 live demos', '14 industries', 'From ' + NAIRA + '50,000'],
    cta: 'See the examples',
    qrCaption: 'Scan to visit',
  }), path.join(OUT, 'main.png'), SITE + '/?' + utm('main'));
  count++;

  await renderWithQr(pagePromo({
    eyebrow: 'REFERRAL PROGRAMME', accent: 'gold',
    lines: ['Refer Someone.', 'Earn a', 'Commission.'],
    sub: 'No website skills needed. Get paid when they buy.',
    pillLabels: ['Starter ' + NAIRA + '10,000', 'Plus ' + NAIRA + '15,000'],
    cta: 'Become an agent',
    qrCaption: 'Scan to join',
  }), path.join(OUT, 'agents.png'), SITE + '/agents/?' + utm('agents'));
  count++;

  // examples: same frame language, but a real 6-up grid of demo screenshots
  const picks = ['restaurant', 'fashion', 'barber', 'real-estate', 'church', 'photographer'];
  const gx = 90, gy = 470, gw = 290, gh = 152, gap = 20;
  const gridSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S
    + '" viewBox="0 0 ' + S + ' ' + S + '">' + defs('neon') + backdrop
    + '<g font-family="Segoe UI, Arial, sans-serif">'
    + wordmark()
    + '<text x="90" y="176" fill="#86efac" font-size="24" font-weight="600" letter-spacing="4">TEMPLATE LIBRARY</text>'
    + '<text x="90" y="286" fill="#f7f3ec" font-size="76" font-weight="700">42 Live Demos.</text>'
    + '<text x="90" y="378" fill="url(#accent)" font-size="76" font-weight="700">14 Industries.</text>'
    + '<text x="90" y="432" fill="#a79f95" font-size="28">Restaurants, salons, churches, schools, and more.</text>'
    + '<text x="90" y="895" fill="#f7f3ec" font-size="34" font-weight="700">Three style options per industry.</text>'
    + '<text x="90" y="944" fill="#a79f95" font-size="28">Browse them all, then pick a starting point.</text>'
    + footerUrl()
    + '</g></svg>';

  const gridTiles = [];
  for (let i = 0; i < picks.length; i++) {
    const src = path.join(PREVIEWS, picks[i] + '-og.jpg');
    if (!fs.existsSync(src)) continue;
    const buf = await previewBody(src).resize(gw, gh, { fit: 'cover', position: 'top' }).png().toBuffer();
    const rounded = await sharp(buf).composite([{
      input: Buffer.from('<svg width="' + gw + '" height="' + gh + '"><rect width="' + gw
        + '" height="' + gh + '" rx="10" fill="#fff"/></svg>'),
      blend: 'dest-in',
    }]).png().toBuffer();
    gridTiles.push({
      input: rounded,
      left: gx + (i % 3) * (gw + gap),
      top: gy + Math.floor(i / 3) * (gh + gap),
    });
  }
  await sharp(Buffer.from(gridSvg)).composite(gridTiles).png({ compressionLevel: 9 })
    .toFile(path.join(OUT, 'examples.png'));
  count++;
  await renderWithQr(pagePromo({
    eyebrow: 'FOLLOW & SHARE', accent: 'neon',
    lines: ['Like the work?', 'Follow us and', 'share the link.'],
    sub: 'It costs nothing and helps a small business get found.',
    cta: 'Follow Elevven11 Studio',
    qrCaption: 'Scan to visit',
    extra: (subY) => socialRow(FB_PATH, 'facebook.com/Elevven11Studio', 90, subY + 34, 44, 28)
      + socialRow(LI_PATH, 'linkedin.com/company/elevven11-studio', 90, subY + 108, 44, 28),
  }), path.join(OUT, 'follow-share.png'), SITE + '/?' + utm('follow-share'));
  count++;

  console.log('page promos: main, agents, examples, follow-share');

  const slugs = fs.readdirSync(path.join(ROOT, 'examples'), { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name);

  const missing = [];
  for (const slug of slugs) {
    const shot = path.join(PREVIEWS, slug + '-og.jpg');
    if (!fs.existsSync(shot)) { missing.push(slug); continue; }

    const html = fs.readFileSync(path.join(ROOT, 'examples', slug, 'index.html'), 'utf8');
    const title = (html.match(/<title>([^<]*)<\/title>/) || [, ''])[1];
    const desc = (html.match(/name="description" content="([^"]*)"/) || [, ''])[1];
    const business = title.split(EMDASH)[0].trim() || slug;
    const styleMatch = desc.match(/\(Style ([ABC])\)/);
    let industry = (desc.split(/\s+template demo/i)[0] || '').trim() || 'Website';
    industry = industry.replace(/\s*\(Style [ABC]\)/, '');

    const img = await previewBody(shot).resize(IMG.w, IMG.h, { fit: 'cover', position: 'top' }).png().toBuffer();
    const rounded = await roundedBottom(img, IMG.w, IMG.h, 15);

    await sharp(Buffer.from(demoPromo({
      business: business,
      industry: industry,
      style: 'Style ' + (styleMatch ? styleMatch[1] : 'A'),
    })))
      .composite([{ input: rounded, left: FRAME.x + 1, top: FRAME.y + FRAME.bar }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT, 'demos', slug + '.png'));
    count++;
  }

  const sizeOf = (p) => fs.statSync(p).size;
  const bytes = ['main.png', 'agents.png', 'examples.png'].map((f) => sizeOf(path.join(OUT, f)))
    .concat(fs.readdirSync(path.join(OUT, 'demos')).map((f) => sizeOf(path.join(OUT, 'demos', f))))
    .reduce((a, b) => a + b, 0);

  console.log('demo promos: ' + (count - PAGE_PROMOS));
  console.log('\nwrote ' + count + ' promos at 1080x1080');
  console.log('total ' + (bytes / 1024 / 1024).toFixed(2) + ' MB');
  if (missing.length) {
    console.error('missing preview for: ' + missing.join(', ') + ' - run npm run previews first');
  }
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
