/**
 * Multi-image carousel promos, 1080x1080, five slides per set.
 *
 *   promo/carousel/main/1..5.png     the offer
 *   promo/carousel/agents/1..5.png   referral programme (gold)
 *   promo/carousel/share/1..5.png    follow & share
 *
 * Built as a sequence, not five variations of one card: slide 1 is a hook,
 * 2-4 carry the argument, 5 is the ask and holds the QR. Each slide shows its
 * position, so someone landing mid-swipe knows there is more.
 *
 * Post all five together as a single carousel/multi-image post.
 *
 *   cd scripts && npm install && npm run carousels
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');

const ROOT = path.resolve(__dirname, '..');
const PREVIEWS = path.join(ROOT, 'assets/previews');
const OUT = path.join(ROOT, 'promo/carousel');
const SITE = 'https://elevven11studio.github.io';
const S = 1080;

// Currency codes rather than the ₦ symbol, matching the site and what
// Paystack prints at checkout. The trailing space is part of it: every call
// site concatenates straight onto a figure.
const NAIRA = 'NGN ';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const utm = (c) => 'utm_source=promo&utm_medium=carousel&utm_campaign=' + c;

const THEMES = {
  dark: {
    bg: '#0b0a10', text: '#f7f3ec', muted: '#a79f95', faint: '#7a7268',
    dot: 'rgba(247,243,236,0.10)', line: 'rgba(247,243,236,0.16)',
    green: ['#86efac', '#22c55e'], gold: ['#f0c866', '#c99a2e'], blue: ['#60a5fa', '#3b82f6'],
  },
  light: {
    bg: '#f4f1ea', text: '#14121a', muted: '#5d564b', faint: '#8a8175',
    dot: 'rgba(20,18,26,0.10)', line: 'rgba(20,18,26,0.18)',
    green: ['#1f9d55', '#137a40'], gold: ['#9a6f16', '#7a560f'], blue: ['#1d4ed8', '#1e40af'],
  },
};

function wrapText(text, max) {
  const lines = [];
  let line = '';
  for (const w of String(text).split(' ')) {
    if ((line + ' ' + w).trim().length > max) { lines.push(line); line = w; } else line = (line + ' ' + w).trim();
  }
  if (line) lines.push(line);
  return lines;
}

function fit(text, maxWidth, start, min = 30) {
  let size = start;
  while (size > min && text.length * size * 0.55 > maxWidth) size -= 2;
  return size;
}

function defs(t, accent) {
  const ramp = t[accent] || t.green;
  return '<defs>'
    + '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="' + ramp[0] + '"/><stop offset="100%" stop-color="' + ramp[1] + '"/>'
    + '</linearGradient>'
    + '<pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">'
    + '<circle cx="2" cy="2" r="2" fill="' + t.dot + '"/></pattern>'
    + '<radialGradient id="glow" cx="80%" cy="12%" r="64%">'
    + '<stop offset="0%" stop-color="' + ramp[0] + '" stop-opacity="0.20"/>'
    + '<stop offset="100%" stop-color="' + ramp[0] + '" stop-opacity="0"/></radialGradient>'
    + '<filter id="drop" x="-25%" y="-25%" width="150%" height="150%">'
    + '<feDropShadow dx="0" dy="14" stdDeviation="22" flood-color="#000" flood-opacity="0.40"/>'
    + '</filter></defs>';
}

/* position indicator: a row of pills, current one filled */
function progress(t, index, total) {
  const w = 46, gap = 12, y = 946;
  const x0 = 80;
  let out = '';
  for (let i = 1; i <= total; i++) {
    const x = x0 + (i - 1) * (w + gap);
    out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="7" rx="3.5" fill="'
      + (i === index ? 'url(#accent)' : t.line) + '"/>';
  }
  return out;
}

function frame(o, body) {
  const t = THEMES[o.theme];
  const ramp = t[o.accent] || t.green;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S + '" viewBox="0 0 '
    + S + ' ' + S + '">' + defs(t, o.accent)
    + '<rect width="' + S + '" height="' + S + '" fill="' + t.bg + '"/>'
    + '<rect width="' + S + '" height="' + S + '" fill="url(#dots)"/>'
    + '<rect width="' + S + '" height="' + S + '" fill="url(#glow)"/>'
    + '<g transform="translate(540 500) scale(0.9)" opacity="0.06" font-family="Segoe UI, Arial, sans-serif">'
    + '<rect x="6" y="6" width="500" height="500" rx="110" fill="none" stroke="url(#accent)" stroke-width="12"/>'
    + '<text x="226" y="324" text-anchor="end" font-weight="800" font-size="171" fill="url(#accent)">11</text>'
    + '<text x="286" y="324" font-weight="800" font-size="171" fill="url(#accent)">11</text>'
    + '<circle cx="256" cy="209" r="13" fill="url(#accent)"/><circle cx="256" cy="303" r="13" fill="url(#accent)"/></g>'
    + '<g font-family="Segoe UI, Arial, sans-serif">'
    + '<text x="80" y="96" fill="' + t.text + '" font-size="24" font-weight="700" letter-spacing="5" '
    + 'opacity="0.9">ELEVVEN11 STUDIO</text>'
    + '<text x="1000" y="96" fill="' + t.faint + '" font-size="24" text-anchor="end">'
    + o.index + ' / ' + o.total + '</text>'
    + body(t, ramp)
    + progress(t, o.index, o.total)
    + '<text x="80" y="1012" fill="' + t.faint + '" font-size="22">elevven11studio.github.io</text>'
    + '</g></svg>';
}

/* ---------------- visuals ---------------- */

function chips(t, items, y, accentFill) {
  let x = 80;
  return items.map((label) => {
    const w = Math.round(label.length * 17 + 60);
    const g = '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="76" rx="18" fill="'
      + (accentFill ? 'rgba(240,200,102,0.10)' : 'rgba(247,243,236,0.06)') + '" stroke="' + t.line + '"/>'
      + '<text x="' + (x + w / 2) + '" y="' + (y + 49) + '" fill="' + t.text
      + '" font-size="30" font-weight="700" text-anchor="middle">' + esc(label) + '</text></g>';
    x += w + 18;
    return g;
  }).join('');
}

/* ---------------- slide sets ---------------- */

const SETS = {
  main: {
    accent: 'neon',
    slides: [
      { theme: 'dark', head: ['Your customer', 'just asked what', 'you do.'],
        sub: 'How many messages does it take to answer?' },
      { theme: 'light', head: ['Photos. Prices.', 'Location. Hours.'],
        sub: 'Six messages later, they have stopped replying.' },
      { theme: 'dark', head: ['One link.', 'Everything', 'they need.'],
        sub: 'Send it once. They read it at their own pace.' },
      { theme: 'light', head: ['42 live demos.', '14 industries.'],
        sub: 'Open them on your phone before you decide.', visual: 'grid' },
      { theme: 'dark', head: ['From ' + NAIRA + '50,000.', 'One-time.'],
        sub: 'No monthly hosting fee on eligible sites.',
        qr: SITE + '/?' + utm('carousel-main'), qrCaption: 'Scan to visit' },
    ],
  },

  agents: {
    accent: 'gold',
    slides: [
      { theme: 'dark', head: ['Know someone', 'who needs a', 'website?'],
        sub: 'You do not need to build anything.' },
      { theme: 'light', head: ['Send them', 'your link.'],
        sub: 'You get a referral code. It travels with the link.' },
      { theme: 'dark', head: ['We do', 'the work.'],
        sub: 'Design, build, deployment and support. All of it.' },
      { theme: 'light', head: ['You get paid.'],
        sub: 'Commission lands once their payment clears.',
        visual: 'commission' },
      { theme: 'dark', head: ['Become', 'an agent.'],
        sub: 'Two minutes to apply. WhatsApp or Google Form.',
        qr: SITE + '/agents/?' + utm('carousel-agents'), qrCaption: 'Scan to join' },
    ],
  },

  share: {
    accent: 'neon',
    slides: [
      { theme: 'dark', head: ['Someone you', 'know needs', 'a website.'],
        sub: 'They just have not got round to it.' },
      { theme: 'light', head: ['A barber.', 'A caterer.', 'A tutor.'],
        sub: 'Anyone still explaining their business one chat at a time.' },
      { theme: 'dark', head: ['Send them', 'this page.'],
        sub: 'That is the whole favour. It takes ten seconds.',
        visual: 'grid' },
      { theme: 'light', head: ['Costs you', 'nothing.'],
        sub: 'Helps a small business get found.' },
      { theme: 'dark', head: ['Follow', 'and share.'],
        sub: 'facebook.com/Elevven11Studio', sub2: 'linkedin.com/company/elevven11-studio',
        qr: SITE + '/?' + utm('carousel-share'), qrCaption: 'Scan to visit' },
    ],
  },
};

SETS.pricing = {
  accent: 'neon', peek: true,
  slides: [
    { theme: 'dark', head: ['What does a', 'website really', 'cost?'],
      sub: 'Most quotes hide a monthly fee. Ours do not.' },
    { theme: 'light', head: ['Starter.', NAIRA + '50,000.'],
      sub: 'A clean, mobile-friendly site for one business.',
      chips: ['One-time', 'Free updates'] },
    { theme: 'dark', head: ['Plus.', NAIRA + '80,000.'],
      sub: 'More pages and more room to grow.',
      chips: ['One-time', 'Free updates'] },
    { theme: 'light', head: ['Custom.', 'From ' + NAIRA + '120,000.'],
      sub: 'Built around what your business needs.', chips: ['Quoted first', 'No surprises'] },
    { theme: 'dark', head: ['Pay once.', 'Own the site.'],
      sub: 'See every package and what it includes.',
      qr: SITE + '/pricing/?' + utm('carousel-pricing'), qrCaption: 'Scan to see pricing' },
  ],
};

SETS.process = {
  accent: 'neon', peek: true,
  slides: [
    { theme: 'dark', head: ['Getting a website', 'is simpler', 'than you think.'],
      sub: 'Ten clear steps, from first message to live website.' },
    { theme: 'light', head: ['1. Choose', 'a package.'],
      sub: 'Starter, Plus or Custom, based on what you need.' },
    { theme: 'dark', head: ['2. We build it.'],
      sub: 'You send your details and content. We build the site from our template system.' },
    { theme: 'light', head: ['3. You review,', 'then go live.'],
      sub: 'Request revisions. We publish it and your free update period begins.' },
    { theme: 'dark', head: ['Ready', 'when you are.'],
      sub: 'Tell us what you need and we take it from there.',
      qr: SITE + '/get-started/?' + utm('carousel-process'), qrCaption: 'Scan to start' },
  ],
};

SETS.tools = {
  accent: 'neon', peek: false,
  slides: [
    { theme: 'dark', head: ['Free tools', 'for work and', 'everyday life.'],
      sub: 'They run in your browser. Nothing is uploaded.',
      chips: ['No account', 'Free'] },
    { theme: 'light', head: ['Pricing and', 'profit.'],
      sub: 'Work out margins before you quote.',
      chips: ['Profit', 'Markup', 'Discount'] },
    { theme: 'dark', head: ['Tax and', 'break-even.'],
      sub: 'Know your numbers before you commit.',
      chips: ['VAT', 'Break-even', 'Percentage'] },
    { theme: 'light', head: ['Documents', 'and text.'],
      sub: 'Make an invoice, count words, format JSON.',
      chips: ['Invoice', 'Words', 'JSON'] },
    { theme: 'dark', head: ['Try them', 'free.'],
      sub: 'Ten tools. No sign-up.',
      qr: SITE + '/tools/?' + utm('carousel-tools'), qrCaption: 'Scan to open' },
  ],
};

SETS.extensions = {
  accent: 'neon', peek: false,
  slides: [
    { theme: 'dark', head: ['Small tools', 'that stay on', 'your machine.'],
      sub: 'Free Chrome extensions from Elevven11 Studio.',
      chips: ['No account', 'No server'] },
    { theme: 'light', head: ['WebGuard.', 'Spot the fake.'],
      sub: 'Phishing checks that run on your device.', chips: ['Phishing', 'Passwords'] },
    { theme: 'dark', head: ['WebInspect.', 'Understand any site.'],
      sub: 'Tech, SEO, accessibility, performance and security.', chips: ['One keypress'] },
    { theme: 'light', head: ['ShopInspect.', 'Check before', 'you buy.'],
      sub: 'Price, reviews and seller, checked in your browser.', chips: ['No shopping history'] },
    { theme: 'dark', head: ['Add them', 'to Chrome.'],
      sub: 'Free, and nothing leaves your browser.',
      qr: SITE + '/extensions/?' + utm('carousel-extensions'), qrCaption: 'Scan to browse' },
  ],
};

Object.assign(SETS, require('./carousel-sets-extra'));

const QR = { x: 760, y: 690, size: 200, pad: 22 };

// Slides with no grid or QR used to leave the lower half empty. They now show
// the tops of four real phone renders, fading out toward the footer.
const PEEK = { x: 80, y: 650, w: 210, h: 270, gap: 20, n: 4 };
const MOBILE = path.join(PREVIEWS, 'mobile');
const PEEK_POOL = ['barber', 'fashion', 'church', 'restaurant', 'photographer', 'fitness', 'consultant', 'events',
  'real-estate', 'logistics', 'freelancer', 'salon'];

async function peekLayers(seed) {
  const pool = PEEK_POOL.filter((n) => fs.existsSync(path.join(MOBILE, n + '.jpg')));
  const layers = [];
  for (let k = 0; k < PEEK.n; k++) {
    const slug = pool[(seed * 3 + k) % pool.length];
    const m = await sharp(path.join(MOBILE, slug + '.jpg')).metadata();
    const crop = await sharp(path.join(MOBILE, slug + '.jpg'))
      .extract({ left: 0, top: 92, width: m.width, height: Math.round(PEEK.h * m.width / PEEK.w) })
      .resize(PEEK.w, PEEK.h).png().toBuffer();
    const mask = Buffer.from('<svg width="' + PEEK.w + '" height="' + PEEK.h + '">'
      + '<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0.45" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'
      + '<path d="M0 ' + PEEK.h + ' V28 a28 28 0 0 1 28 -28 H' + (PEEK.w - 28) + ' a28 28 0 0 1 28 28 V' + PEEK.h
      + ' Z" fill="url(#f)"/></svg>');
    layers.push({
      input: await sharp(crop).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer(),
      left: PEEK.x + k * (PEEK.w + PEEK.gap), top: PEEK.y,
    });
  }
  return layers;
}

(async () => {
  const gridPicks = ['restaurant', 'fashion', 'barber', 'real-estate', 'church', 'photographer'];
  let made = 0;

  for (const [name, set] of Object.entries(SETS)) {
    const dir = path.join(OUT, name);
    fs.mkdirSync(dir, { recursive: true });

    for (const [i, sl] of set.slides.entries()) {
      const index = i + 1;
      const total = set.slides.length;

      const svg = frame({ theme: sl.theme, accent: set.accent, index, total }, (t, ramp) => {
        const size = fit(sl.head[0], 900, 94, 46);
        let out = '<rect x="80" y="168" width="96" height="5" rx="2.5" fill="url(#accent)"/>';
        out += sl.head.map((l, j) =>
          '<text x="80" y="' + (286 + j * 104) + '" fill="'
          + (j === sl.head.length - 1 ? 'url(#accent)' : t.text) + '" font-size="' + size
          + '" font-weight="700" letter-spacing="-1">' + esc(l) + '</text>').join('');
        const subY = 286 + sl.head.length * 104 + 6;
        // Long subtitles wrap at ~50 characters; everything below shifts down with them.
        const subLines = wrapText(sl.sub, 50).concat(sl.sub2 ? [sl.sub2] : []);
        subLines.forEach((line, j) => {
          out += '<text x="80" y="' + (subY + j * 44) + '" fill="' + t.muted + '" font-size="31">' + esc(line) + '</text>';
        });
        const belowY = subY + (subLines.length - 1) * 44 + 40;
        if (sl.chips) out += chips(t, sl.chips, belowY, false);
        if (sl.visual === 'commission') {
          out += chips(t, ['Starter ' + NAIRA + '10,000', 'Plus ' + NAIRA + '15,000'], belowY, true);
        }
        if (sl.qr) {
          out += '<rect x="' + QR.x + '" y="' + QR.y + '" width="' + QR.size + '" height="' + QR.size
            + '" rx="20" fill="#ffffff"/>'
            + '<text x="' + (QR.x + QR.size / 2) + '" y="' + (QR.y + QR.size + 32) + '" fill="' + t.faint
            + '" font-size="21" text-anchor="middle">' + esc(sl.qrCaption) + '</text>';
        }
        return out;
      });

      const layers = [];

      if (sl.visual === 'grid') {
        const picks = sl.picks || gridPicks;
        const wide = picks.length <= 3;
        const gw = wide ? 284 : 268, gh = wide ? 330 : 141, gap = wide ? 24 : 18, gx = 80, gy = wide ? 520 : 610;
        for (let k = 0; k < picks.length; k++) {
          const src = path.join(PREVIEWS, picks[k] + '-og.jpg');
          if (!fs.existsSync(src)) continue;
          // og jpgs are cropped ribbon-free at capture time now.
          const buf = await sharp(src)
            .resize(gw, gh, { fit: 'cover', position: 'top' }).png().toBuffer();
          const rounded = await sharp(buf).composite([{
            input: Buffer.from('<svg width="' + gw + '" height="' + gh + '"><rect width="' + gw
              + '" height="' + gh + '" rx="12" fill="#fff"/></svg>'),
            blend: 'dest-in',
          }]).png().toBuffer();
          layers.push({ input: rounded, left: gx + (k % 3) * (gw + gap), top: gy + Math.floor(k / 3) * (gh + gap) });
        }
      }

      if (set.peek !== false && !sl.visual && !sl.qr && !sl.sub2 && !sl.chips) layers.push(...await peekLayers(index + name.length));

      if (sl.qr) {
        layers.push({
          input: await QRCode.toBuffer(sl.qr, {
            type: 'png', width: QR.size - QR.pad * 2, margin: 1,
            errorCorrectionLevel: 'M', color: { dark: '#0b0a10ff', light: '#ffffffff' },
          }),
          left: QR.x + QR.pad, top: QR.y + QR.pad,
        });
      }

      let img = sharp(Buffer.from(svg));
      if (layers.length) img = img.composite(layers);
      await img.png({ compressionLevel: 9 }).toFile(path.join(dir, index + '.png'));
      made++;
    }
    console.log(name.padEnd(9) + set.slides.length + ' slides');
  }

  const bytes = Object.keys(SETS).reduce((a, n) =>
    a + fs.readdirSync(path.join(OUT, n)).reduce((b, f) =>
      b + fs.statSync(path.join(OUT, n, f)).size, 0), 0);
  console.log('\nwrote ' + made + ' carousel slides, ' + (bytes / 1024 / 1024).toFixed(2) + ' MB');
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
