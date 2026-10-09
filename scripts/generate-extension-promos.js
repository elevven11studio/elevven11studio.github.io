/**
 * Social promos for the four Chrome extensions, in each extension's own colour.
 *
 *   promo/extensions/<name>.png            1080x1080 post
 *   promo/extensions/stories/<name>.png    1080x1920 story
 *   promo/extensions/overview.png          all four, square
 *   promo/extensions/stories/overview.png
 *   promo/extensions/captions.md           copy to paste with each image
 *
 * The QR code points at the extension's page on this site, which carries the
 * Chrome Web Store button, with UTM tags so scans show up as promo traffic.
 * Claims on the images are taken from the extension pages themselves.
 *
 *   cd scripts && npm install && npm run extension-promos
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { SITE, DOT, esc, utm, fitSize, defs, backdrop, pills, rowsCard, codeCard, FORMATS, qrPng, render } = require('./promo-kit');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'promo/extensions');

const EXT = [
  {
    k: 'webinspect', n: 'WebInspect', id: 'mpeiggffhbfefciphcnabijnmiajcljk',
    a: { from: '#a78bfa', to: '#8b5cf6', glow: '#8b5cf6' },
    lines: ['Understand Any', 'Site At A Glance.'],
    sub: 'Open a site, press one key, get the report.',
    short: 'See the tech, SEO and security of any site.',
    pills: ['One keypress', 'Runs in browser', 'Free'],
    summary: ['What it checks'],
    rows: [['Technology', 'Frameworks and CMS'], ['SEO', 'Meta tags, headings'], ['Accessibility', 'Contrast and labels'],
      ['Security', 'HTTPS, mixed content']],
    hook: 'Press one key on any website and get a report on its technology, SEO, accessibility, performance and security.'
  },
  {
    k: 'webguard', n: 'WebGuard', id: 'hgckccgcmbclkjhdccnphbpbljlcdimd',
    a: { from: '#38bdf8', to: '#0ea5e9', glow: '#0ea5e9' },
    lines: ['Spot The Fake', 'Before You Type.'],
    sub: 'Phishing checks that run on your device.',
    short: 'Check a page for phishing before you type.',
    pills: ['Runs on device', 'Online checks off', 'Free'],
    summary: ['What it checks'],
    rows: [['Phishing', 'Lookalike domains'], ['Forms', 'Passwords over http'], ['Passwords', 'Private breach lookup'],
      ['Sensitive data', 'Keys, tokens, cards']],
    hook: 'Check the page you are on for the signs of phishing, and get a warning before you hand over sensitive details.'
  },
  {
    k: 'siteextract', n: 'SiteExtract', id: 'napeljfpcmnpphenaajmjpblidjnghfb',
    a: { from: '#fb923c', to: '#f97316', glow: '#f97316' },
    lines: ['Any Web Page,', 'As A Starter Project.'],
    sub: 'HTML, CSS, images, fonts and tokens in one ZIP.',
    short: 'Save a web page as a starter project.',
    pills: ['Runs on device', 'Nothing uploaded', 'Free'],
    code: [['example.com/', 0], ['  index.html', 0], ['  css/tokens.css', 0], ['  images/', 0], ['  fonts/', 0], ['  report.json', 0]],
    hook: 'Save any web page as clean HTML, CSS, images, fonts and design tokens in one ZIP you can open and edit.'
  },
  {
    k: 'shopinspect', n: 'ShopInspect', id: 'ldkkldeeepomlnpccmmjglopfoghhbjj',
    a: { from: '#2dd4bf', to: '#14b8a6', glow: '#14b8a6' },
    lines: ['Inspect A Product', 'Before You Buy It.'],
    sub: 'Price, reviews, seller and details.',
    short: 'Check a product listing before you buy.',
    pills: ['No account', 'No shopping history', 'Free'],
    summary: ['What it checks'],
    rows: [['Price', 'Is the discount real'], ['Reviews', 'Praise and complaints'], ['Seller', 'Who is selling it'],
      ['Verdict', 'Good Buy', true]],
    hook: 'Get a second opinion on a product listing: whether the discount adds up, what buyers complain about, and who is selling it.'
  }
];

const iconFile = (e) => path.join(ROOT, 'assets', e.k, 'icon-128.png');
const icon = (e, px) => sharp(iconFile(e)).resize(px, px).png().toBuffer();

async function extScene(e, fmt) {
  const f = FORMATS[fmt], W = f.W, H = f.H, M = f.margin;
  const story = fmt === 'story';
  const page = SITE + '/' + e.k + '/';
  const url = page + '?' + utm('ext-' + e.k + '-' + fmt);
  const tint = e.a.from;
  // Values are longer than on the tool cards, so the value text is a little smaller.
  if (e.rows && e.rows.length > 4) throw new Error(e.k + ': more than four rows will not fit the square layout');
  const k = { ...f.card, valFs: story ? 34 : 26, labelFs: story ? 34 : 28, mainFs: story ? 60 : 46 };

  let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">'
    + defs(e.a) + backdrop(W, H) + '<g font-family="Segoe UI, Arial, sans-serif">'
    + '<text x="' + M + '" y="' + f.wordY + '" fill="#f7f3ec" font-size="' + (story ? 30 : 28)
    + '" font-weight="700" letter-spacing="6">ELEVVEN11 STUDIO</text>'
    + '<text x="' + M + '" y="' + f.eyeY + '" fill="' + tint + '" font-size="' + (story ? 26 : 24)
    + '" font-weight="600" letter-spacing="4">CHROME EXTENSION ' + DOT + ' ' + esc(e.n.toUpperCase()) + '</text>';

  const size = Math.min(...e.lines.map((l) => fitSize(l, W - M * 2, f.headSize)));
  e.lines.forEach((l, i) => {
    svg += '<text x="' + M + '" y="' + (f.headY + i * f.headStep) + '" fill="'
      + (i === e.lines.length - 1 ? 'url(#accent)' : '#f7f3ec') + '" font-size="' + size + '" font-weight="700">' + esc(l) + '</text>';
  });
  let y = f.headY + (e.lines.length - 1) * f.headStep + (story ? 70 : 56);
  svg += '<text x="' + M + '" y="' + y + '" fill="#a79f95" font-size="' + fitSize(e.sub, W - M * 2, f.subSize, 22) + '">' + esc(e.sub) + '</text>';
  y += story ? 56 : 36;

  const cw = W - M * 2;
  const card = e.code ? codeCard({ lines: e.code }, M, y, cw, k) : rowsCard(e, M, y, cw, k);
  svg += card.svg;
  y += card.h + (story ? 44 : 30);
  svg += pills(e.pills, M, y, f.pill);

  const layers = [];
  const iconPx = story ? 120 : 92;
  layers.push({ input: await icon(e, iconPx), left: W - M - iconPx, top: story ? f.wordY - 78 : f.wordY - 62 });

  const qy = story ? 1290 : H - f.qr - 88;
  svg += '<rect x="' + (W - M - f.qr) + '" y="' + qy + '" width="' + f.qr + '" height="' + f.qr + '" rx="20" fill="#ffffff"/>';
  layers.push({ input: await qrPng(url, f.qr - (story ? 32 : 28)), left: W - M - f.qr + (story ? 16 : 14), top: qy + (story ? 16 : 14) });
  if (story) svg += '<text x="' + (W - M - f.qr / 2) + '" y="' + (qy + f.qr + 42) + '" fill="#a79f95" font-size="24" text-anchor="middle">Scan to install</text>';

  svg += '<text x="' + M + '" y="' + (story ? 1440 : H - 118) + '" fill="url(#accent)" font-size="' + f.ctaSize + '" font-weight="700">Add to Chrome.</text>'
    + '<text x="' + M + '" y="' + f.urlY + '" fill="#7a7268" font-size="' + (story ? 26 : 24) + '">elevven11studio.github.io/' + e.k + '</text>'
    + '</g></svg>';
  return { svg, layers };
}

async function overviewScene(fmt) {
  const f = FORMATS[fmt], W = f.W, H = f.H, M = f.margin;
  const story = fmt === 'story';
  const url = SITE + '/extensions/?' + utm('ext-overview-' + fmt);
  const lines = ['Free Chrome Extensions', 'That Stay On Your Machine.'];
  const size = Math.min(...lines.map((l) => fitSize(l, W - M * 2, f.headSize)));

  let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">'
    + defs() + backdrop(W, H) + '<g font-family="Segoe UI, Arial, sans-serif">'
    + '<text x="' + M + '" y="' + f.wordY + '" fill="#f7f3ec" font-size="28" font-weight="700" letter-spacing="6">ELEVVEN11 STUDIO</text>'
    + '<text x="' + M + '" y="' + f.eyeY + '" fill="#86efac" font-size="24" font-weight="600" letter-spacing="4">CHROME EXTENSIONS</text>'
    + '<text x="' + M + '" y="' + f.headY + '" fill="#f7f3ec" font-size="' + size + '" font-weight="700">' + esc(lines[0]) + '</text>'
    + '<text x="' + M + '" y="' + (f.headY + f.headStep) + '" fill="url(#accent)" font-size="' + size + '" font-weight="700">' + esc(lines[1]) + '</text>'
    + '<text x="' + M + '" y="' + (f.headY + f.headStep + (story ? 70 : 52)) + '" fill="#a79f95" font-size="' + f.subSize
    + '">No account, no server, nothing uploaded.</text>';

  const layers = [];
  const top = f.headY + f.headStep + (story ? 130 : 96);
  const rowH = story ? 128 : 100, ip = story ? 84 : 68, tx = M + ip + 28;
  for (let i = 0; i < EXT.length; i++) {
    const e = EXT[i], ry = top + i * rowH;
    layers.push({ input: await icon(e, ip), left: M, top: Math.round(ry - 4) });
    svg += '<text x="' + tx + '" y="' + (ry + ip * 0.42) + '" fill="#f7f3ec" font-size="' + (story ? 38 : 32) + '" font-weight="700">' + esc(e.n) + '</text>'
      + '<text x="' + tx + '" y="' + (ry + ip * 0.86) + '" fill="#a79f95" font-size="' + (story ? 28 : 24) + '">' + esc(e.short) + '</text>';
  }

  const qy = story ? 1290 : H - f.qr - 88;
  svg += '<rect x="' + (W - M - f.qr) + '" y="' + qy + '" width="' + f.qr + '" height="' + f.qr + '" rx="20" fill="#ffffff"/>';
  layers.push({ input: await qrPng(url, f.qr - (story ? 32 : 28)), left: W - M - f.qr + (story ? 16 : 14), top: qy + (story ? 16 : 14) });
  if (story) svg += '<text x="' + (W - M - f.qr / 2) + '" y="' + (qy + f.qr + 42) + '" fill="#a79f95" font-size="24" text-anchor="middle">Scan to browse</text>';
  svg += '<text x="' + M + '" y="' + (story ? 1440 : H - 118) + '" fill="url(#accent)" font-size="' + f.ctaSize + '" font-weight="700">Add them free.</text>'
    + '<text x="' + M + '" y="' + f.urlY + '" fill="#7a7268" font-size="' + (story ? 26 : 24) + '">elevven11studio.github.io/extensions</text>'
    + '</g></svg>';
  return { svg, layers };
}

function captions() {
  const link = (campaign, p) => SITE + p + '?utm_source=social&utm_medium=post&utm_campaign=' + campaign;
  const out = ['# Elevven11 extension captions', '',
    'Paste each caption with its image. The site link is tagged so visits show up as promo traffic, and that page has the Chrome Web Store button.', '',
    '## All extensions', '',
    'Four free Chrome extensions that run in your browser: WebInspect, WebGuard, SiteExtract and ShopInspect. No account, no server, nothing uploaded.', '',
    link('ext-overview', '/extensions/'), '', '`overview.png` (post) or `stories/overview.png` (story)', ''];
  for (const e of EXT) {
    out.push('## ' + e.n, '', e.hook + ' Free on the Chrome Web Store, and it runs in your browser.', '',
      link('ext-' + e.k, '/' + e.k + '/'), '',
      'Chrome Web Store: https://chromewebstore.google.com/detail/' + e.k + '-by-elevven11/' + e.id, '',
      '`' + e.k + '.png` (post) or `stories/' + e.k + '.png` (story)', '');
  }
  out.push('## Notes', '',
    '- WhatsApp Status and Stories: use the story image and paste the site link in the caption.',
    '- WebGuard and ShopInspect suit a general audience. WebInspect and SiteExtract suit developers, designers and agencies.',
    '- Post one extension at a time rather than all four together.', '');
  return out.join('\n');
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'stories'), { recursive: true });
  let n = 0;
  for (const e of EXT) {
    if (!fs.existsSync(iconFile(e))) throw new Error('missing icon for ' + e.k);
    await render(await extScene(e, 'square'), path.join(OUT, e.k + '.png')); n++;
    await render(await extScene(e, 'story'), path.join(OUT, 'stories', e.k + '.png')); n++;
  }
  await render(await overviewScene('square'), path.join(OUT, 'overview.png')); n++;
  await render(await overviewScene('story'), path.join(OUT, 'stories', 'overview.png')); n++;
  const text = captions();
  fs.writeFileSync(path.join(OUT, 'captions.md'), text, 'utf8');
  const total = [...fs.readdirSync(OUT).filter((x) => x.endsWith('.png')).map((x) => path.join(OUT, x)),
    ...fs.readdirSync(path.join(OUT, 'stories')).map((x) => path.join(OUT, 'stories', x))]
    .reduce((a, b) => a + fs.statSync(b).size, 0);
  console.log(n + ' images + captions.md, ' + (total / 1024 / 1024).toFixed(2) + ' MB');
  if (/—/.test(text)) { console.error('captions contain an em dash'); process.exitCode = 1; }
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
