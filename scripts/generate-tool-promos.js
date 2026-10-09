/**
 * Social promos for Elevven11 Tools, one set per tool plus an overview.
 *
 *   promo/tools/<id>.png            1080x1080 post
 *   promo/tools/stories/<id>.png    1080x1920 story (WhatsApp Status, Instagram, Facebook)
 *   promo/tools/overview.png        all tools, square
 *   promo/tools/stories/overview.png
 *   promo/tools/captions.md         copy to paste with each image
 *
 * Tool names, headlines and links come from the tool registry, so a new tool
 * needs only an entry in PROMO below. Every image carries a QR code to the tool
 * page with UTM tags, so scans show up in analytics as promo traffic.
 *
 *   cd scripts && npm install && npm run tool-promos
 */
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { tools } = require('./tools-src/registry');
const kit = require('./promo-kit');
const { SITE, DOT, esc, utm, fitSize, defs, backdrop, pills, cardFrame, rowsCard, codeCard, FORMATS, qrPng, render } = kit;

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'promo/tools');

// What each promo shows. Every number is the worked example on the tool's own
// page, so the image and the page agree.
const PROMO = {
  'profit-calculator': {
    summary: ['Cost 60', 'Price 100', '10 units'],
    rows: [['Profit', '400', true], ['Profit margin', '40%'], ['Markup', '66.67%'], ['Revenue', '1,000']],
    hook: 'Know your real profit, margin and markup in seconds.'
  },
  'markup-calculator': {
    summary: ['Cost 80', 'Markup 25%'],
    rows: [['Selling price', '100', true], ['Markup amount', '20'], ['Profit margin', '20%']],
    hook: 'Set a price from a markup, or check the markup behind a price you already use.'
  },
  'discount-calculator': {
    summary: ['Original 200', 'Discount 15%'],
    rows: [['Final price', '170', true], ['Amount saved', '30']],
    hook: 'See the sale price and exactly what the discount saves.'
  },
  'break-even-calculator': {
    summary: ['Fixed costs 5,000', 'Cost 6', 'Price 10'],
    rows: [['Break-even units', '1,250', true], ['Break-even revenue', '12,500'], ['Profit per unit', '4']],
    hook: 'How many sales until your costs are covered?'
  },
  'vat-calculator': {
    summary: ['Price 1,000', 'VAT 7.5%'],
    rows: [['Price with VAT', '1,075', true], ['VAT amount', '75'], ['Price before VAT', '1,000']],
    hook: 'Add VAT to a price or take it out. It starts at the Nigerian rate of 7.5%.'
  },
  'invoice-generator': {
    summary: ['Two items', '10% off', '7.5% tax'],
    rows: [['Subtotal', '1,500'], ['Discount', '-150'], ['Tax', '101.25'], ['Total', '1,451.25', true]],
    hook: 'Make a clean invoice and save it as a PDF. No account needed.'
  },
  'percentage-calculator': {
    summary: ['Four common questions'],
    rows: [['15% of 200', '30', true], ['30 is what % of 200', '15%'], ['50 to 75', '+50%'], ['200 plus 10%', '220']],
    hook: 'Percent of, percent change, increase and decrease, all on one page.'
  },
  'word-counter': {
    summary: ['A 1,000 word article'],
    rows: [['Reading time', '4 min 12 sec', true], ['Speaking time', '6 min 40 sec'], ['Words', '1,000']],
    hook: 'Count words and see reading time as you type.'
  },
  'qr-code-generator': {
    type: 'qr',
    tabs: ['Link', 'Text', 'Email', 'Phone', 'Wi-Fi'],
    hook: 'Make a QR code for a link, Wi-Fi, email or phone number. Download it as PNG or SVG.'
  },
  'json-formatter': {
    type: 'code',
    lines: [['{', 0], ['  "a": 1,', 0], ['  "b": }', 1]],
    status: "Line 3, column 7: Unexpected character '}'.",
    hook: 'Format and check JSON. It shows the line and column of any error.'
  }
};

// Card builders are in promo-kit.js; the QR demo card is specific to the QR tool.
async function qrCard(p, x, y, w, k, url) {
  const pad = k.pad, qr = Math.round(k.qrDemo);
  const tabsFs = k.sumFs * 1.05;
  const h = pad * 2 + tabsFs * 2.6 + qr + 10;
  let svg = cardFrame(x, y, w, h);
  let tx = x + pad;
  p.tabs.forEach((t, i) => {
    const tw = Math.round(t.length * tabsFs * 0.58 + 36);
    svg += '<rect x="' + tx + '" y="' + (y + pad) + '" width="' + tw + '" height="' + (tabsFs * 2) + '" rx="' + tabsFs
      + '" fill="' + (i === 0 ? 'rgba(134,239,172,0.16)' : 'rgba(247,243,236,0.05)') + '" stroke="'
      + (i === 0 ? '#86efac' : 'rgba(247,243,236,0.16)') + '"/>'
      + '<text x="' + (tx + tw / 2) + '" y="' + (y + pad + tabsFs * 1.38) + '" fill="#f7f3ec" font-size="' + tabsFs
      + '" text-anchor="middle">' + esc(t) + '</text>';
    tx += tw + 10;
  });
  const qx = x + (w - qr) / 2, qy = y + pad + tabsFs * 2.6;
  svg += '<rect x="' + qx + '" y="' + qy + '" width="' + qr + '" height="' + qr + '" rx="18" fill="#ffffff"/>';
  const layer = {
    input: await QRCode.toBuffer(url, { type: 'png', width: qr - 28, margin: 0, errorCorrectionLevel: 'M',
      color: { dark: '#0b0a10ff', light: '#ffffffff' } }),
    left: Math.round(qx + 14), top: Math.round(qy + 14)
  };
  return { svg, h, layers: [layer] };
}

// ---- scenes ----
async function toolScene(t, fmt) {
  const f = FORMATS[fmt], W = f.W, H = f.H, M = f.margin;
  const p = PROMO[t.id];
  const page = SITE + t.path;
  const campaign = 'tool-' + t.id + '-' + fmt;
  const url = page + '?' + utm(campaign);

  const eyebrow = 'FREE TOOL ' + DOT + ' ' + t.name.toUpperCase();
  let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">'
    + defs() + backdrop(W, H) + '<g font-family="Segoe UI, Arial, sans-serif">'
    + '<text x="' + M + '" y="' + f.wordY + '" fill="#f7f3ec" font-size="' + (fmt === 'story' ? 30 : 28)
    + '" font-weight="700" letter-spacing="6">ELEVVEN11 STUDIO</text>'
    + '<text x="' + M + '" y="' + f.eyeY + '" fill="#86efac" font-size="' + (fmt === 'story' ? 26 : 24)
    + '" font-weight="600" letter-spacing="4">' + esc(eyebrow) + '</text>';

  t.og.lines.forEach((l, i) => {
    svg += '<text x="' + M + '" y="' + (f.headY + i * f.headStep) + '" fill="'
      + (i === t.og.lines.length - 1 ? 'url(#accent)' : '#f7f3ec') + '" font-size="' + fitSize(l, W - M * 2, f.headSize)
      + '" font-weight="700">' + esc(l) + '</text>';
  });
  let y = f.headY + (t.og.lines.length - 1) * f.headStep + (fmt === 'story' ? 70 : 56);
  svg += '<text x="' + M + '" y="' + y + '" fill="#a79f95" font-size="' + fitSize(t.og.sub, W - M * 2, f.subSize, 22)
    + '">' + esc(t.og.sub) + '</text>';
  y += fmt === 'story' ? 56 : 36;

  const cw = W - M * 2;
  const card = p.type === 'qr' ? await qrCard(p, M, y, cw, f.card, url)
    : p.type === 'code' ? codeCard(p, M, y, cw, f.card)
      : rowsCard(p, M, y, cw, f.card);
  svg += card.svg;
  y += card.h + (fmt === 'story' ? 44 : 30);

  svg += pills(['Free', 'No account', 'Nothing uploaded'], M, y, f.pill);

  const layers = card.layers.slice();
  const showQr = p.type !== 'qr';
  if (fmt === 'square') {
    const qy = H - f.qr - 88;
    if (showQr) {
      svg += '<rect x="' + (W - M - f.qr) + '" y="' + qy + '" width="' + f.qr + '" height="' + f.qr + '" rx="20" fill="#ffffff"/>';
      layers.push({ input: await QRCode.toBuffer(url, { type: 'png', width: f.qr - 28, margin: 0, errorCorrectionLevel: 'M',
        color: { dark: '#0b0a10ff', light: '#ffffffff' } }), left: W - M - f.qr + 14, top: qy + 14 });
    }
    svg += '<text x="' + M + '" y="' + (H - 118) + '" fill="url(#accent)" font-size="' + f.ctaSize + '" font-weight="700">Try it free.</text>';
  } else {
    const qy = 1290;
    if (showQr) {
      svg += '<rect x="' + (W - M - f.qr) + '" y="' + qy + '" width="' + f.qr + '" height="' + f.qr + '" rx="22" fill="#ffffff"/>'
        + '<text x="' + (W - M - f.qr / 2) + '" y="' + (qy + f.qr + 42) + '" fill="#a79f95" font-size="24" text-anchor="middle">Scan to try it</text>';
      layers.push({ input: await QRCode.toBuffer(url, { type: 'png', width: f.qr - 32, margin: 0, errorCorrectionLevel: 'M',
        color: { dark: '#0b0a10ff', light: '#ffffffff' } }), left: W - M - f.qr + 16, top: qy + 16 });
    }
    svg += '<text x="' + M + '" y="1440" fill="url(#accent)" font-size="' + f.ctaSize + '" font-weight="700">Try it free.</text>';
  }
  svg += '<text x="' + M + '" y="' + f.urlY + '" fill="#7a7268" font-size="' + (fmt === 'story' ? 26 : 24)
    + '">elevven11studio.github.io/tools</text></g></svg>';
  return { svg, layers };
}

async function overviewScene(fmt) {
  const f = FORMATS[fmt], W = f.W, H = f.H, M = f.margin;
  const url = SITE + '/tools/?' + utm('tools-overview-' + fmt);
  const story = fmt === 'story';
  let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">'
    + defs() + backdrop(W, H) + '<g font-family="Segoe UI, Arial, sans-serif">'
    + '<text x="' + M + '" y="' + f.wordY + '" fill="#f7f3ec" font-size="28" font-weight="700" letter-spacing="6">ELEVVEN11 STUDIO</text>'
    + '<text x="' + M + '" y="' + f.eyeY + '" fill="#86efac" font-size="24" font-weight="600" letter-spacing="4">ELEVVEN11 TOOLS</text>'
    + '<text x="' + M + '" y="' + f.headY + '" fill="#f7f3ec" font-size="' + f.headSize + '" font-weight="700">' + tools.length + ' Free Tools</text>'
    + '<text x="' + M + '" y="' + (f.headY + f.headStep) + '" fill="url(#accent)" font-size="' + f.headSize + '" font-weight="700">For Work And Life.</text>'
    + '<text x="' + M + '" y="' + (f.headY + f.headStep + (story ? 70 : 52)) + '" fill="#a79f95" font-size="' + f.subSize
    + '">Calculators and utilities that run in your browser.</text>';

  // Tool list in two columns.
  const top = f.headY + f.headStep + (story ? 140 : 108);
  const colW = (W - M * 2) / 2, rowH = story ? 84 : 58, fs = story ? 34 : 27;
  const perCol = Math.ceil(tools.length / 2);
  tools.forEach((t, i) => {
    const col = Math.floor(i / perCol), r = i % perCol;
    const x = M + col * colW, y = top + r * rowH;
    svg += '<circle cx="' + (x + 8) + '" cy="' + (y - fs * 0.3) + '" r="7" fill="url(#accent)"/>'
      + '<text x="' + (x + 30) + '" y="' + y + '" fill="#f7f3ec" font-size="' + fs + '">' + esc(t.name) + '</text>';
  });
  const listBottom = top + perCol * rowH;
  const py = listBottom + (story ? 20 : 4);
  svg += pills(['Free', 'No account', 'Nothing uploaded'], M, py, f.pill);

  const layers = [];
  const qy = story ? 1290 : H - f.qr - 88;
  svg += '<rect x="' + (W - M - f.qr) + '" y="' + qy + '" width="' + f.qr + '" height="' + f.qr + '" rx="20" fill="#ffffff"/>';
  layers.push({ input: await QRCode.toBuffer(url, { type: 'png', width: f.qr - 30, margin: 0, errorCorrectionLevel: 'M',
    color: { dark: '#0b0a10ff', light: '#ffffffff' } }), left: W - M - f.qr + 15, top: qy + 15 });
  if (story) svg += '<text x="' + (W - M - f.qr / 2) + '" y="' + (qy + f.qr + 42) + '" fill="#a79f95" font-size="24" text-anchor="middle">Scan to browse</text>';
  svg += '<text x="' + M + '" y="' + (story ? 1440 : H - 150) + '" fill="url(#accent)" font-size="' + f.ctaSize + '" font-weight="700">Try them free.</text>'
    + '<text x="' + M + '" y="' + (story ? 1496 : H - 100) + '" fill="#a79f95" font-size="' + (story ? 30 : 28) + '">elevven11studio.github.io/tools</text>'
    + '</g></svg>';
  return { svg, layers };
}

function captions() {
  const lines = ['# Elevven11 Tools captions', '',
    'Paste each caption with its image. The link in each one is tagged so visits show up as promo traffic.', ''];
  const link = (campaign, path) => SITE + path + '?utm_source=social&utm_medium=post&utm_campaign=' + campaign;
  lines.push('## All tools', '',
    tools.length + ' free tools for work and everyday life. Calculate profit, add VAT, make an invoice, build a QR code and more. No account, nothing uploaded.',
    '', link('tools-overview', '/tools/'), '', '`overview.png` (post) or `stories/overview.png` (story)', '');
  for (const t of tools) {
    const p = PROMO[t.id];
    lines.push('## ' + t.name, '', p.hook + ' Free, no account, and it runs in your browser.', '',
      link('tool-' + t.id, t.path), '',
      '`' + t.id + '.png` (post) or `stories/' + t.id + '.png` (story)', '');
  }
  lines.push('## Notes', '',
    '- WhatsApp Status and Stories: use the story image and paste the link in the caption, since links are not clickable in the image.',
    '- LinkedIn and Facebook: use the square image. Add the link as the first comment if reach drops.',
    '- Post one tool at a time over a few weeks rather than all at once.', '');
  return lines.join('\n');
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'stories'), { recursive: true });
  let n = 0;
  for (const t of tools) {
    if (!PROMO[t.id]) throw new Error('no promo entry for ' + t.id + ' in generate-tool-promos.js');
    await render(await toolScene(t, 'square'), path.join(OUT, t.id + '.png')); n++;
    await render(await toolScene(t, 'story'), path.join(OUT, 'stories', t.id + '.png')); n++;
  }
  await render(await overviewScene('square'), path.join(OUT, 'overview.png')); n++;
  await render(await overviewScene('story'), path.join(OUT, 'stories', 'overview.png')); n++;
  fs.writeFileSync(path.join(OUT, 'captions.md'), captions(), 'utf8');

  const total = [...fs.readdirSync(OUT).filter((x) => x.endsWith('.png')).map((x) => path.join(OUT, x)),
    ...fs.readdirSync(path.join(OUT, 'stories')).map((x) => path.join(OUT, 'stories', x))]
    .reduce((a, b) => a + fs.statSync(b).size, 0);
  console.log(n + ' images + captions.md, ' + (total / 1024 / 1024).toFixed(2) + ' MB');
  if (/—/.test(captions())) { console.error('captions contain an em dash'); process.exitCode = 1; }
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
