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
 *   cd scripts && npm install && npm run stories
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
// Currency codes rather than the ₦ symbol, matching the site and what
// Paystack prints at checkout. The trailing space is part of it: every call
// site concatenates straight onto a figure.
const NAIRA = 'NGN ';
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
  // Faint 11:11 mark bleeding off the top-right, as on the social cards.
  + '<g transform="translate(' + (W - 400) + ' -60) scale(0.9)" opacity="0.06" font-family="Segoe UI, Arial, sans-serif">'
  + '<rect x="6" y="6" width="500" height="500" rx="110" fill="none" stroke="url(#accent)" stroke-width="12"/>'
  + '<text x="226" y="324" text-anchor="end" font-weight="800" font-size="171" fill="url(#accent)">11</text>'
  + '<text x="286" y="324" font-weight="800" font-size="171" fill="url(#accent)">11</text>'
  + '<circle cx="256" cy="209" r="13" fill="url(#accent)"/><circle cx="256" cy="303" r="13" fill="url(#accent)"/></g>'
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

/* ---- page story visuals ---- */

// Feature list in the free area under the pills, left of the QR code.
function featureList(items, tint) {
  return items.map((t, i) => {
    const y = 1130 + i * 92;
    return '<g><circle cx="' + (MARGIN + 18) + '" cy="' + (y - 12) + '" r="18" fill="' + tint + '" opacity="0.16"/>'
      + '<path d="M' + (MARGIN + 9) + ' ' + (y - 12) + ' l7 7 l12 -14" fill="none" stroke="' + tint
      + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<text x="' + (MARGIN + 60) + '" y="' + y + '" fill="#d9d2c7" font-size="34">' + esc(t) + '</text></g>';
  }).join('');
}

// Three phone tops, fading toward the footer, in the same area.
const MOBILE_DIR = path.join(PREVIEWS, 'mobile');
async function phoneFan(slugs) {
  const layers = [];
  const w = 190, bz = 9, gap = 20;
  for (const [k, slug] of slugs.slice(0, 3).entries()) {
    const shot = path.join(MOBILE_DIR, slug + '.jpg');
    const m = await sharp(shot).metadata();
    const sw = w - bz * 2, sh = Math.round(sw * (m.height - 92) / m.width), h = sh + bz * 2;
    const screen = await sharp(shot)
      .extract({ left: 0, top: 92, width: m.width, height: m.height - 92 })
      .resize({ width: sw, height: sh }).png().toBuffer();
    const round = Buffer.from('<svg width="' + sw + '" height="' + sh + '"><rect width="' + sw + '" height="' + sh + '" rx="22" fill="#fff"/></svg>');
    const rounded = await sharp(screen).composite([{ input: round, blend: 'dest-in' }]).png().toBuffer();
    const body = Buffer.from('<svg width="' + w + '" height="' + h + '"><rect x="1" y="1" width="' + (w - 2) + '" height="' + (h + 40)
      + '" rx="30" fill="#0a0910" stroke="rgba(247,243,236,0.25)" stroke-width="1.5"/></svg>');
    const mask = Buffer.from('<svg width="' + w + '" height="' + h + '"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0.5" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'
      + '<rect width="' + w + '" height="' + h + '" fill="url(#f)"/></svg>');
    const phone = await sharp(body).composite([{ input: rounded, left: bz, top: bz }, { input: mask, blend: 'dest-in' }]).png().toBuffer();
    layers.push({ input: phone, left: MARGIN + k * (w + gap), top: [1140, 1090, 1140][k] });
  }
  return layers;
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
    + (o.list ? featureList(o.list, tint) : '')
    + qr
    + footerUrl(1615)
    + '</g></svg>';
}

/* ---- demo story ---- */

const FRAME = { x: MARGIN, y: 620, w: 920, bar: 54 };
const IMG = { w: 918, h: 482 };
const RIBBON = 48;
// Phone render of the same template overlapping the browser's bottom-right
// corner: the desktop frame alone left the lower half of the story empty and
// said nothing about mobile. Screen size follows the portrait capture
// (500x1000, minus the 92px studio ribbon, see generate-promos.js).
const PHONE = { x: 718, y: 880, w: 262, bezel: 11 };
const PHONE_SCREEN = { w: PHONE.w - PHONE.bezel * 2 };
PHONE_SCREEN.h = Math.round(PHONE_SCREEN.w * (1000 - 92) / 500);
const MOBILE = path.join(PREVIEWS, 'mobile');

function phoneFrame() {
  const h = PHONE_SCREEN.h + PHONE.bezel * 2;
  return '<defs><filter id="pdrop" x="-30%" y="-20%" width="160%" height="150%">'
    + '<feDropShadow dx="0" dy="20" stdDeviation="24" flood-color="#000" flood-opacity="0.6"/></filter></defs>'
    + '<g filter="url(#pdrop)"><rect x="' + PHONE.x + '" y="' + PHONE.y + '" width="' + PHONE.w + '" height="' + h
    + '" rx="38" fill="#0a0910"/><rect x="' + (PHONE.x + 1.5) + '" y="' + (PHONE.y + 1.5) + '" width="' + (PHONE.w - 3)
    + '" height="' + (h - 3) + '" rx="36.5" fill="none" stroke="rgba(247,243,236,0.25)" stroke-width="1.5"/></g>';
}

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
    + phoneFrame()
    + '<text x="' + MARGIN + '" y="1480" fill="url(#accent)" font-size="54" font-weight="700">Get a website like this.</text>'
    + '<text x="' + MARGIN + '" y="1544" fill="#a79f95" font-size="31">From ' + NAIRA
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

async function phoneScreen(slug) {
  const shot = path.join(MOBILE, slug + '.jpg');
  const m = await sharp(shot).metadata();
  const buf = await sharp(shot)
    .extract({ left: 0, top: 92, width: m.width, height: m.height - 92 })
    .resize(PHONE_SCREEN.w, PHONE_SCREEN.h, { fit: 'cover', position: 'top' }).png().toBuffer();
  const mask = Buffer.from('<svg width="' + PHONE_SCREEN.w + '" height="' + PHONE_SCREEN.h
    + '"><rect width="' + PHONE_SCREEN.w + '" height="' + PHONE_SCREEN.h + '" rx="27" fill="#fff"/></svg>');
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
      fan: ['barber', 'fashion', 'fitness'],
    },
    {
      name: 'agents', accent: 'gold', qr: true, qrCaption: 'Scan to join',
      url: SITE + '/agents/?' + utm('story-agents'),
      eyebrow: 'REFERRAL PROGRAMME',
      lines: ['Refer Someone.', 'Earn a', 'Commission.'],
      sub: 'No website skills needed.',
      pillLabels: ['Starter ' + NAIRA + '10,000', 'Plus ' + NAIRA + '15,000'],
      list: ['Apply in about two minutes', 'Get a referral code of your own', 'Share your link anywhere', 'Paid once their payment clears'],
    },
    {
      name: 'examples', accent: 'neon', qr: true, qrCaption: 'Scan to browse',
      url: SITE + '/examples/?' + utm('story-examples'),
      eyebrow: 'TEMPLATE LIBRARY',
      lines: ['42 Live Demos.', '14 Industries.'],
      sub: 'Restaurants, salons, churches, schools.',
      pillLabels: ['Mobile friendly', '3 styles each'],
      fan: ['church', 'restaurant', 'consultant'],
    },
    {
      name: 'follow-share', accent: 'neon', qr: true, qrCaption: 'Scan to visit',
      url: SITE + '/?' + utm('story-follow-share'),
      eyebrow: 'FOLLOW & SHARE',
      lines: ['Like the work?', 'Follow us and', 'share the link.'],
      sub: 'It costs nothing and helps a small business.',
      pillLabels: ['Facebook', 'LinkedIn'],
      fan: ['photographer', 'events', 'logistics'],
    },
    {
      name: 'pricing', accent: 'neon', qr: true, qrCaption: 'Scan to see pricing',
      url: SITE + '/pricing/?' + utm('story-pricing'),
      eyebrow: 'PRICING', lines: ['One-Time Pricing.', 'No Monthly Fees.'],
      sub: 'Every package includes a free update period.',
      pillLabels: ['From ' + NAIRA + '50,000', 'One-time'],
      list: ['Starter ' + NAIRA + '50,000', 'Plus ' + NAIRA + '80,000', 'Custom from ' + NAIRA + '120,000', 'Hosting and setup handled'],
    },
    {
      name: 'process', accent: 'neon', qr: true, qrCaption: 'Scan to start',
      url: SITE + '/get-started/?' + utm('story-process'),
      eyebrow: 'HOW IT WORKS', lines: ['From First Message', 'To Live Website.'],
      sub: 'Ten clear steps. You always know what is next.',
      pillLabels: ['10 steps', 'Revisions included'],
      list: ['Choose Starter, Plus or Custom', 'Send your details and content', 'You review it and request changes', 'We publish it and updates begin'],
    },
    {
      name: 'hosting', accent: 'neon', qr: true, qrCaption: 'Scan to read the FAQ',
      url: SITE + '/faq/?' + utm('story-hosting'),
      eyebrow: 'HOSTING', lines: ['No Monthly', 'Hosting Fee.'],
      sub: 'On our website packages.',
      pillLabels: ['Free hosting', 'Setup included'],
      list: ['Free GitHub Pages hosting', 'Use the default URL or your own', 'Domain registration is separate', 'We can help set it up'],
    },
    {
      name: 'updates', accent: 'neon', qr: true, qrCaption: 'Scan to read the FAQ',
      url: SITE + '/faq/?' + utm('story-updates'),
      eyebrow: 'AFTER YOU GO LIVE', lines: ['Free Updates', 'Included.'],
      sub: 'Every package has a free update period.',
      pillLabels: ['Text', 'Photos', 'Contact details'],
      list: ['Change your text', 'Swap your images', 'Update phone and WhatsApp', 'Bigger changes are quoted first'],
    },
    {
      name: 'tools', accent: 'neon', qr: true, qrCaption: 'Scan to open',
      url: SITE + '/tools/?' + utm('story-tools'),
      eyebrow: 'ELEVVEN11 TOOLS', lines: ['Free Tools.', 'Nothing Uploaded.'],
      sub: 'They run in your browser.',
      pillLabels: ['10 tools', 'No account'],
      list: ['Profit, markup and discount', 'VAT, break-even and percentage', 'Invoice generator and word counter', 'QR code generator and JSON formatter'],
    },
    {
      name: 'extensions', accent: 'neon', qr: true, qrCaption: 'Scan to browse',
      url: SITE + '/extensions/?' + utm('story-extensions'),
      eyebrow: 'CHROME EXTENSIONS', lines: ['Small Tools.', 'Stay On Your Machine.'],
      sub: 'Free, with no account.',
      pillLabels: ['Free', 'On device'],
      list: ['WebGuard spots phishing', 'WebInspect reports on any site', 'ShopInspect checks before you buy', 'SiteExtract builds a starter project'],
    },
    {
      name: 'support', accent: 'gold', qr: true, qrCaption: 'Scan to chip in',
      url: SITE + '/support/?' + utm('story-support'),
      eyebrow: 'SUPPORT THE STUDIO', lines: ['Pay What', 'You Like.'],
      sub: 'Optional, and it buys nothing.',
      pillLabels: ['NGN or USD', 'No account'],
      list: ['Card, transfer or USSD', 'Secured by Paystack', 'Any amount you choose', 'One payment, nothing recurring'],
    },
    {
      name: 'counterbook', accent: 'neon', qr: true, qrCaption: 'Scan to learn more',
      url: SITE + '/counterbook/?' + utm('story-counterbook'),
      eyebrow: 'COUNTERBOOK / POINT OF SALE', lines: ['Run Your Shop', 'From One App.'],
      sub: 'Free, and coming soon.',
      pillLabels: ['Works offline', 'No account'],
      list: ['Sales, stock, customers and cash', 'Windows and Android', 'Works offline at the counter', 'Free to use'],
    },
    {
      name: 'apps', accent: 'neon', qr: true, qrCaption: 'Scan to read more',
      url: SITE + '/app-development/?' + utm('story-apps'),
      eyebrow: 'MOBILE APPS', lines: ['One Codebase.', 'Both App Stores.'],
      sub: 'Flutter apps, quoted per project.',
      pillLabels: ['Android', 'iPhone'],
      list: ['One build for both platforms', 'Scoped and quoted first', 'Your own store account', 'We handle the submission'],
    },
    {
      name: 'contact', accent: 'neon', qr: true, qrCaption: 'Scan to message us',
      url: SITE + '/contact/?' + utm('story-contact'),
      eyebrow: 'CONTACT', lines: ["Let's Talk.", 'Ask Anything.'],
      sub: 'WhatsApp or email. We reply quickly.',
      pillLabels: ['WhatsApp', 'Email'],
      list: ['A new website', 'Pricing questions', 'The referral programme', 'Extensions and Counterbook'],
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
    if (p.fan) layers.push(...await phoneFan(p.fan));
    await sharp(Buffer.from(svg)).composite(layers).png({ compressionLevel: 9 }).toFile(file);
    count++;
  }
  console.log('page stories: ' + pages.map((x) => x.name).join(', '));

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

    // og jpgs are cropped ribbon-free at capture time now.
    const img = await sharp(shot)
      .resize(IMG.w, IMG.h, { fit: 'cover', position: 'top' }).png().toBuffer();

    await sharp(Buffer.from(demoStory({
      business, industry, style: 'Style ' + (styleMatch ? styleMatch[1] : 'A'),
    })))
      .composite([
        { input: await roundedBottom(img, IMG.w, IMG.h, 17), left: FRAME.x + 1, top: FRAME.y + FRAME.bar },
        { input: await phoneScreen(slug), left: PHONE.x + PHONE.bezel, top: PHONE.y + PHONE.bezel },
      ])
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
