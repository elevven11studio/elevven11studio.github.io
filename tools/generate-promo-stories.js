/**
 * Story-format promos (1080x1920) for WhatsApp Status, Instagram/Facebook
 * Stories - the vertical counterpart to the 1080x1080 squares in promo/.
 *
 *   promo/stories/main.png
 *   promo/stories/agents.png
 *   promo/stories/examples.png
 *   promo/stories/demos/<slug>.png
 *
 * Content is kept inside the middle band: platforms overlay their own UI over
 * roughly the top and bottom 250px, and WhatsApp Status puts the caption and
 * reply box there too.
 *
 *   cd tools && npm install && npm run stories
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');

const ROOT = path.resolve(__dirname, '..');
const PREVIEWS = path.join(ROOT, 'assets/previews');
const OUT = path.join(ROOT, 'promo/stories');
const SITE = 'https://elevven11studio.github.io';

const W = 1080, H = 1920;
const SAFE_TOP = 300, MARGIN = 80;
const NAIRA = '₦';
const MIDDOT = '·';
const EMDASH = '—';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const utm = (c) => 'utm_source=promo&utm_medium=qr&utm_campaign=' + c;

function fitSize(text, maxWidth, start, min = 28) {
  let size = start;
  while (size > min && text.length * size * 0.55 > maxWidth) size -= 2;
  return size;
}

function wrap(text, maxChars, maxLines) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars) {
      lines.push(line.trim());
      line = w;
      if (lines.length === maxLines) break;
    } else line = (line + ' ' + w).trim();
  }
  if (lines.length < maxLines && line) lines.push(line.trim());
  return lines;
}

function defs(accent) {
  const grad = accent === 'gold'
    ? '<stop offset="0%" stop-color="#f0c866"/><stop offset="100%" stop-color="#c99a2e"/>'
    : '<stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#22c55e"/>';
  const tint = accent === 'gold' ? '#f0c866' : '#86efac';
  return '<defs>'
    + '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">' + grad + '</linearGradient>'
    + '<radialGradient id="g1" cx="10%" cy="14%" r="60%">'
    + '<stop offset="0%" stop-color="' + tint + '" stop-opacity="0.18"/>'
    + '<stop offset="100%" stop-color="' + tint + '" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="g2" cx="92%" cy="90%" r="58%">'
    + '<stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.15"/>'
    + '<stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/></radialGradient>'
    + '</defs>';
}

const backdrop = '<rect width="' + W + '" height="' + H + '" fill="#0b0a10"/>'
  + '<rect width="' + W + '" height="' + H + '" fill="url(#g1)"/>'
  + '<rect width="' + W + '" height="' + H + '" fill="url(#g2)"/>'
  + '<rect width="' + W + '" height="10" fill="url(#accent)"/>';

const wordmark = (y) => '<text x="' + MARGIN + '" y="' + y + '" fill="#f7f3ec" font-size="30" '
  + 'font-weight="700" letter-spacing="6">ELEVVEN11 STUDIO</text>';

const footerUrl = (y) => '<text x="' + MARGIN + '" y="' + y + '" fill="#7a7268" font-size="26">'
  + 'elevven11studio.github.io</text>';

function pills(labels, y, fs) {
  fs = fs || 28;
  let x = MARGIN;
  return labels.map((t) => {
    const w = Math.round(t.length * fs * 0.56 + 48);
    const g = '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (fs * 2.2)
      + '" rx="' + (fs * 1.1) + '" fill="rgba(247,243,236,0.06)" stroke="rgba(247,243,236,0.17)"/>'
      + '<text x="' + (x + w / 2) + '" y="' + (y + fs * 1.48) + '" fill="#f7f3ec" font-size="' + fs
      + '" text-anchor="middle">' + esc(t) + '</text></g>';
    x += w + fs * 0.6;
    return g;
  }).join('');
}

/* ---- page story (main / agents / examples) ---- */

const QR_BOX = { x: 700, y: 1250, size: 300, pad: 30 };
const QR_PX = QR_BOX.size - QR_BOX.pad * 2;

function pageStory(o) {
  const tint = o.accent === 'gold' ? '#f0c866' : '#86efac';
  const head = o.lines.map((l, i) =>
    '<text x="' + MARGIN + '" y="' + (SAFE_TOP + 260 + i * 100) + '" fill="'
    + (i === o.lines.length - 1 ? 'url(#accent)' : '#f7f3ec') + '" font-size="'
    + fitSize(l, 920, 82) + '" font-weight="700">' + esc(l) + '</text>').join('');
  const subY = SAFE_TOP + 260 + o.lines.length * 100 + 30;

  const qr = o.qr
    ? '<rect x="' + QR_BOX.x + '" y="' + QR_BOX.y + '" width="' + QR_BOX.size + '" height="'
      + QR_BOX.size + '" rx="22" fill="#ffffff"/>'
      + '<text x="' + (QR_BOX.x + QR_BOX.size / 2) + '" y="' + (QR_BOX.y + QR_BOX.size + 40)
      + '" fill="#a79f95" font-size="24" text-anchor="middle">' + esc(o.qrCaption) + '</text>'
    : '';

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H
    + '" viewBox="0 0 ' + W + ' ' + H + '">' + defs(o.accent) + backdrop
    + '<g font-family="Segoe UI, Arial, sans-serif">'
    + wordmark(SAFE_TOP)
    + '<text x="' + MARGIN + '" y="' + (SAFE_TOP + 70) + '" fill="' + tint
    + '" font-size="26" font-weight="600" letter-spacing="4">' + esc(o.eyebrow) + '</text>'
    + head
    + '<text x="' + MARGIN + '" y="' + subY + '" fill="#a79f95" font-size="32">' + esc(o.sub) + '</text>'
    + pills(o.pillLabels, subY + 46)
    + qr
    + footerUrl(1615)
    + '</g></svg>';
}

/* ---- demo story ---- */

const FRAME = { x: MARGIN, y: 620, w: 920, bar: 54 };
const IMG = { w: 918, h: 482 };
const RIBBON = 48;

function demoStory(o) {
  const nameLines = wrap(o.business, 24, 2);
  const nameSize = fitSize(nameLines[0], 920, 66, 34);
  const label = (o.industry + ' ' + MIDDOT + ' ' + o.style).toUpperCase();
  const fx = FRAME.x, fy = FRAME.y, fw = FRAME.w;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H
    + '" viewBox="0 0 ' + W + ' ' + H + '">' + defs('neon') + backdrop
    + '<g font-family="Segoe UI, Arial, sans-serif">'
    + wordmark(SAFE_TOP)
    + '<text x="' + MARGIN + '" y="' + (SAFE_TOP + 70) + '" fill="#86efac" font-size="25" '
    + 'font-weight="600" letter-spacing="4">' + esc(label) + '</text>'
    + nameLines.map((l, i) =>
      '<text x="' + MARGIN + '" y="' + (SAFE_TOP + 180 + i * 82) + '" fill="#f7f3ec" font-size="'
      + nameSize + '" font-weight="700">' + esc(l) + '</text>').join('')
    + '<rect x="' + fx + '" y="' + fy + '" width="' + fw + '" height="' + (FRAME.bar + IMG.h)
    + '" rx="18" fill="#15121d" stroke="rgba(247,243,236,0.16)"/>'
    + '<path d="M' + fx + ' ' + (fy + 18) + ' a18 18 0 0 1 18 -18 h' + (fw - 36)
    + ' a18 18 0 0 1 18 18 v' + (FRAME.bar - 18) + ' h' + (-fw) + ' z" fill="#221d2e"/>'
    + '<circle cx="' + (fx + 30) + '" cy="' + (fy + 27) + '" r="7" fill="#ff5f57"/>'
    + '<circle cx="' + (fx + 54) + '" cy="' + (fy + 27) + '" r="7" fill="#febc2e"/>'
    + '<circle cx="' + (fx + 78) + '" cy="' + (fy + 27) + '" r="7" fill="#28c840"/>'
    + '<rect x="' + (fx + 106) + '" y="' + (fy + 14) + '" width="' + (fw - 132)
    + '" height="26" rx="13" fill="rgba(11,10,16,0.6)"/>'
    + '<text x="' + MARGIN + '" y="1300" fill="url(#accent)" font-size="54" font-weight="700">Get a website like this.</text>'
    + '<text x="' + MARGIN + '" y="1364" fill="#a79f95" font-size="31">From ' + NAIRA
    + '50,000 one-time ' + MIDDOT + ' no monthly fee.</text>'
    + footerUrl(1615)
    + '</g></svg>';
}

async function roundedBottom(buf, w, h, r) {
  const mask = Buffer.from('<svg width="' + w + '" height="' + h + '">'
    + '<path d="M0 0 H' + w + ' V' + (h - r) + ' a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + r
    + ' H' + r + ' a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + (-r) + ' Z" fill="#fff"/></svg>');
  return sharp(buf).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'demos'), { recursive: true });
  let count = 0;

  const pages = [
    {
      name: 'main', accent: 'neon', qr: true, qrCaption: 'Scan to visit',
      url: SITE + '/?' + utm('story-main'),
      eyebrow: 'WEBSITE DESIGN IN NIGERIA',
      lines: ['Simple Websites.', 'No Monthly', 'Hosting Fee.'],
      sub: 'For small businesses and freelancers.',
      pillLabels: ['42 live demos', 'From ' + NAIRA + '50,000'],
    },
    {
      name: 'agents', accent: 'gold', qr: true, qrCaption: 'Scan to join',
      url: SITE + '/agents/?' + utm('story-agents'),
      eyebrow: 'REFERRAL PROGRAMME',
      lines: ['Refer Someone.', 'Earn a', 'Commission.'],
      sub: 'No website skills needed.',
      pillLabels: ['Starter ' + NAIRA + '10,000', 'Plus ' + NAIRA + '15,000'],
    },
    {
      name: 'examples', accent: 'neon', qr: true, qrCaption: 'Scan to browse',
      url: SITE + '/examples/?' + utm('story-examples'),
      eyebrow: 'TEMPLATE LIBRARY',
      lines: ['42 Live Demos.', '14 Industries.'],
      sub: 'Restaurants, salons, churches, schools.',
      pillLabels: ['Mobile friendly', '3 styles each'],
    },
    {
      name: 'follow-share', accent: 'neon', qr: true, qrCaption: 'Scan to visit',
      url: SITE + '/?' + utm('story-follow-share'),
      eyebrow: 'FOLLOW & SHARE',
      lines: ['Like the work?', 'Follow us and', 'share the link.'],
      sub: 'It costs nothing and helps a small business.',
      pillLabels: ['Facebook', 'LinkedIn'],
    },
  ];

  for (const p of pages) {
    const svg = pageStory(p);
    const file = path.join(OUT, p.name + '.png');
    const layers = [];
    if (p.qr) {
      layers.push({
        input: await QRCode.toBuffer(p.url, {
          type: 'png', width: QR_PX, margin: 1, errorCorrectionLevel: 'M',
          color: { dark: '#0b0a10ff', light: '#ffffffff' },
        }),
        left: QR_BOX.x + QR_BOX.pad, top: QR_BOX.y + QR_BOX.pad,
      });
    }
    await sharp(Buffer.from(svg)).composite(layers).png({ compressionLevel: 9 }).toFile(file);
    count++;
  }
  console.log('page stories: main, agents, examples, follow-share');

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
    const industry = (desc.split(/\s+template demo/i)[0] || 'Website').replace(/\s*\(Style [ABC]\)/, '').trim();

    const img = await sharp(shot)
      .extract({ left: 0, top: RIBBON, width: 1200, height: 630 - RIBBON })
      .resize(IMG.w, IMG.h, { fit: 'cover', position: 'top' }).png().toBuffer();

    await sharp(Buffer.from(demoStory({
      business, industry, style: 'Style ' + (styleMatch ? styleMatch[1] : 'A'),
    })))
      .composite([{ input: await roundedBottom(img, IMG.w, IMG.h, 17), left: FRAME.x + 1, top: FRAME.y + FRAME.bar }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT, 'demos', slug + '.png'));
    count++;
  }

  const sizeOf = (p) => fs.statSync(p).size;
  const bytes = pages.map((p) => sizeOf(path.join(OUT, p.name + '.png')))
    .concat(fs.readdirSync(path.join(OUT, 'demos')).map((f) => sizeOf(path.join(OUT, 'demos', f))))
    .reduce((a, b) => a + b, 0);

  console.log('demo stories: ' + (count - pages.length));
  console.log('\n' + count + ' stories at ' + W + 'x' + H + ', ' + (bytes / 1024 / 1024).toFixed(2) + ' MB');
  if (missing.length) console.error('missing preview for: ' + missing.join(', '));
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
