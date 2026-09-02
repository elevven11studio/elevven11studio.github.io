/**
 * Builds the picture-slider images used on the agents, how-it-works, faq and
 * contact pages.
 *
 *   assets/slides/agents/1..5.{png,webp}          how to become a referral agent
 *   assets/slides/how-it-works/1..N.{png,webp}    the delivery process
 *   assets/slides/faq/1..N.{png,webp}             common questions
 *   assets/slides/contact/1..N.{png,webp}         ways to reach us
 *
 * Each slide is written twice. The pages load the .webp, which is about half
 * the bytes; the .png is kept as the master the contact sheet and the flat
 * singles/ copies are built from, and as something that opens anywhere.
 *
 * Everything except the agents set is PARSED OUT OF THE LIVE PAGES, so the
 * slides cannot drift from the copy they illustrate. Edit the page, re-run
 * this, and the slider follows. The agents set is authored here because the
 * signup journey is a narrative that is not written out step-by-step on the
 * page itself.
 *
 *   cd tools && npm install && npm run slides
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets/slides');
const W = 1200, H = 675;

const GOLD = '#f0c866';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const NAIRA = '₦';

function decode(s) {
  return s.replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&middot;/g, '·')
    .replace(/&mdash;/g, '—').replace(/&rsquo;|&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();
}

/* Filename-safe slug from a slide title. */
function slugify(text) {
  return text.toLowerCase()
    .replace(/['"’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function fitSize(text, maxWidth, start, min = 28) {
  let size = start;
  while (size > min && text.length * size * 0.55 > maxWidth) size -= 2;
  return size;
}

/* Greedy wrap, capped at maxLines; the last line gets an ellipsis if cut. */
function wrap(text, maxChars, maxLines) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars) {
      lines.push(line.trim());
      line = w;
      if (lines.length === maxLines) break;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (lines.length < maxLines && line) lines.push(line.trim());
  if (lines.length === maxLines) {
    const used = lines.join(' ').length;
    if (used < text.length - 1) lines[maxLines - 1] = lines[maxLines - 1].replace(/[.,;:]$/, '') + '…';
  }
  return lines;
}

function defs(accent) {
  const grad = accent === 'gold'
    ? '<stop offset="0%" stop-color="#f0c866"/><stop offset="100%" stop-color="#c99a2e"/>'
    : '<stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#22c55e"/>';
  const tint = accent === 'gold' ? '#f0c866' : '#86efac';
  return '<defs>'
    + '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">' + grad + '</linearGradient>'
    + '<linearGradient id="green" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#22c55e"/></linearGradient>'
    + '<radialGradient id="g1" cx="6%" cy="10%" r="62%">'
    + '<stop offset="0%" stop-color="' + tint + '" stop-opacity="0.15"/>'
    + '<stop offset="100%" stop-color="' + tint + '" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="g2" cx="96%" cy="94%" r="60%">'
    + '<stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.12"/>'
    + '<stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/></radialGradient>'
    + '</defs>';
}

/**
 * One slide. When `motif` is absent the text column runs the full width, which
 * suits the FAQ set where the answer is the content.
 */
function slide(o) {
  const accent = o.accent || 'neon';
  const tint = accent === 'gold' ? GOLD : '#86efac';
  const colW = o.motif ? 520 : 1060;
  const titleSize = fitSize(o.title, colW, o.motif ? 60 : 64, 30);
  const bodySize = o.motif ? 31 : 33;
  const bodyY = 268 + Math.ceil(o.title.length * titleSize * 0.55 / colW) * 0 + 78;

  const body = o.body.map((l, i) =>
    '<text x="70" y="' + (bodyY + i * (bodySize + 15)) + '" fill="#a79f95" font-size="' + bodySize + '">'
    + esc(l) + '</text>').join('');

  const barY = bodyY + o.body.length * (bodySize + 15) + 18;
  const unit = Math.min(44, Math.floor(420 / o.total));
  const bar = '<rect x="70" y="' + barY + '" width="' + (o.total * unit) + '" height="8" rx="4" '
    + 'fill="rgba(247,243,236,0.12)"/>'
    + '<rect x="70" y="' + barY + '" width="' + (o.index * unit) + '" height="8" rx="4" fill="url(#accent)"/>';

  const ghost = o.ghost === false ? '' :
    '<text x="640" y="640" fill="rgba(247,243,236,0.05)" font-size="300" font-weight="700" '
    + 'text-anchor="end">' + o.index + '</text>';

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H
    + '" viewBox="0 0 ' + W + ' ' + H + '">' + defs(accent)
    + '<rect width="' + W + '" height="' + H + '" fill="#0b0a10"/>'
    + '<rect width="' + W + '" height="' + H + '" fill="url(#g1)"/>'
    + '<rect width="' + W + '" height="' + H + '" fill="url(#g2)"/>'
    + '<rect width="' + W + '" height="7" fill="url(#accent)"/>'
    + '<g font-family="Segoe UI, Arial, sans-serif">'
    + ghost
    + '<text x="70" y="104" fill="#f7f3ec" font-size="24" font-weight="700" letter-spacing="5">ELEVVEN11 STUDIO</text>'
    + '<text x="70" y="172" fill="' + tint + '" font-size="24" font-weight="600" letter-spacing="4">'
    + esc(o.eyebrow) + '</text>'
    + '<text x="70" y="266" fill="#f7f3ec" font-size="' + titleSize + '" font-weight="700">'
    + esc(o.title) + '</text>'
    + body + bar + (o.motif || '')
    + '</g></svg>';
}

/* ---------------- motifs ---------------- */

const M = {
  apply: `
    <rect x="700" y="250" width="300" height="76" rx="38" fill="url(#green)"/>
    <text x="850" y="299" fill="#0b0a10" font-size="30" font-weight="700" text-anchor="middle">WhatsApp</text>
    <rect x="700" y="352" width="300" height="76" rx="38" fill="none" stroke="rgba(247,243,236,0.35)" stroke-width="2"/>
    <text x="850" y="401" fill="#f7f3ec" font-size="30" text-anchor="middle">Google Form</text>
    <text x="850" y="470" fill="#7a7268" font-size="23" text-anchor="middle">either one reaches us</text>`,

  code: `
    <rect x="680" y="255" width="440" height="170" rx="18" fill="rgba(247,243,236,0.05)" stroke="rgba(240,200,102,0.4)" stroke-width="2"/>
    <text x="900" y="315" fill="#a79f95" font-size="21" text-anchor="middle" letter-spacing="3">YOUR REFERRAL CODE</text>
    <text x="900" y="385" fill="url(#accent)" font-size="56" font-weight="700" text-anchor="middle" font-family="Consolas, monospace">ADA-01</text>
    <text x="900" y="468" fill="#7a7268" font-size="22" text-anchor="middle">unique to you</text>`,

  link: `
    <rect x="660" y="290" width="480" height="72" rx="14" fill="#15121d" stroke="rgba(247,243,236,0.18)"/>
    <text x="684" y="326" fill="#a79f95" font-size="19" font-family="Consolas, monospace">/get-started/?ref=</text>
    <text x="898" y="326" fill="${GOLD}" font-size="19" font-weight="700" font-family="Consolas, monospace">ADA-01</text>
    <rect x="660" y="392" width="230" height="60" rx="30" fill="url(#accent)"/>
    <text x="775" y="431" fill="#0b0a10" font-size="24" font-weight="700" text-anchor="middle">Copy link</text>
    <text x="660" y="500" fill="#7a7268" font-size="21">the code rides along automatically</text>`,

  build: `
    <rect x="680" y="235" width="440" height="250" rx="14" fill="#15121d" stroke="rgba(247,243,236,0.16)"/>
    <path d="M680 249 a14 14 0 0 1 14 -14 h412 a14 14 0 0 1 14 14 v20 h-440 z" fill="#221d2e"/>
    <circle cx="702" cy="252" r="5" fill="#ff5f57"/><circle cx="718" cy="252" r="5" fill="#febc2e"/>
    <circle cx="734" cy="252" r="5" fill="#28c840"/>
    <rect x="681" y="269" width="438" height="3" fill="url(#green)"/>
    <rect x="706" y="296" width="180" height="16" rx="8" fill="#f7f3ec" opacity="0.9"/>
    <rect x="706" y="324" width="260" height="16" rx="8" fill="url(#green)"/>
    <rect x="706" y="354" width="150" height="10" rx="5" fill="rgba(247,243,236,0.22)"/>
    <rect x="706" y="374" width="110" height="10" rx="5" fill="rgba(247,243,236,0.16)"/>
    <rect x="706" y="404" width="120" height="30" rx="15" fill="url(#green)"/>
    <rect x="840" y="404" width="100" height="30" rx="15" fill="none" stroke="rgba(247,243,236,0.28)"/>`,

  paid: `
    <rect x="680" y="250" width="210" height="96" rx="16" fill="rgba(240,200,102,0.10)" stroke="rgba(240,200,102,0.45)" stroke-width="2"/>
    <text x="785" y="292" fill="#a79f95" font-size="20" text-anchor="middle">STARTER</text>
    <text x="785" y="328" fill="url(#accent)" font-size="34" font-weight="700" text-anchor="middle">${NAIRA}10,000</text>
    <rect x="910" y="250" width="210" height="96" rx="16" fill="rgba(240,200,102,0.10)" stroke="rgba(240,200,102,0.45)" stroke-width="2"/>
    <text x="1015" y="292" fill="#a79f95" font-size="20" text-anchor="middle">PLUS</text>
    <text x="1015" y="328" fill="url(#accent)" font-size="34" font-weight="700" text-anchor="middle">${NAIRA}15,000</text>
    <rect x="680" y="372" width="440" height="76" rx="16" fill="rgba(247,243,236,0.05)" stroke="rgba(247,243,236,0.14)"/>
    <text x="900" y="408" fill="#f7f3ec" font-size="23" text-anchor="middle">Custom packages</text>
    <text x="900" y="434" fill="#a79f95" font-size="19" text-anchor="middle">commission agreed per project</text>`,
};

/* A generic labelled card, used for the contact channels. */
function cardMotif(label, value) {
  const size = fitSize(value, 400, 34, 17);
  return '<rect x="680" y="270" width="440" height="150" rx="18" fill="rgba(247,243,236,0.05)" '
    + 'stroke="rgba(247,243,236,0.18)"/>'
    + '<text x="900" y="325" fill="#a79f95" font-size="21" text-anchor="middle" letter-spacing="3">'
    + esc(label.toUpperCase()) + '</text>'
    + '<text x="900" y="382" fill="url(#accent)" font-size="' + size + '" font-weight="700" '
    + 'text-anchor="middle">' + esc(value) + '</text>';
}

/* A small chip showing the stage, used for the how-it-works steps. */
function stageMotif(n, total) {
  const cols = 5;
  const cells = [];
  for (let i = 1; i <= total; i++) {
    const cx = 700 + ((i - 1) % cols) * 86;
    const cy = 280 + Math.floor((i - 1) / cols) * 86;
    const done = i <= n;
    cells.push('<rect x="' + cx + '" y="' + cy + '" width="66" height="66" rx="16" fill="'
      + (done ? 'rgba(134,239,172,0.16)' : 'rgba(247,243,236,0.04)') + '" stroke="'
      + (i === n ? '#86efac' : 'rgba(247,243,236,0.12)') + '" stroke-width="' + (i === n ? 3 : 1) + '"/>'
      + '<text x="' + (cx + 33) + '" y="' + (cy + 44) + '" fill="' + (done ? '#86efac' : '#5f594f')
      + '" font-size="26" font-weight="700" text-anchor="middle">' + i + '</text>');
  }
  return cells.join('');
}

/* ---------------- content ---------------- */

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

function parseSteps(file) {
  const html = read(file);
  const out = [];
  const re = /<div class="step-number">(\d+)<\/div>\s*<h4>([\s\S]*?)<\/h4>\s*<p>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = re.exec(html))) out.push({ title: decode(m[2]), body: decode(m[3]) });
  return out;
}

function parseFaq(file) {
  const html = read(file);
  const out = [];
  const re = /<details class="faq-item">\s*<summary>([\s\S]*?)<\/summary>\s*([\s\S]*?)<\/details>/g;
  let m;
  while ((m = re.exec(html))) out.push({ title: decode(m[1]), body: decode(m[2]) });
  return out;
}

function parseContact(file) {
  const html = read(file);
  const out = [];
  const re = /<h3>([^<]+)<\/h3>\s*<p><a [^>]*>([^<]+)<\/a><\/p>/g;
  let m;
  while ((m = re.exec(html))) out.push({ title: decode(m[1]), value: decode(m[2]) });
  return out;
}

const AGENTS = [
  { title: 'Apply to join', body: 'Message us on WhatsApp or fill in the Google Form. Takes about two minutes.', motif: M.apply },
  { title: 'Get your code', body: 'We send you a referral code that identifies every customer you bring.', motif: M.code },
  { title: 'Share your link', body: 'Send your link to anyone who needs a website. Post it anywhere.', motif: M.link },
  { title: 'We build it', body: 'Requirements, design, development, deployment and support. All handled.', motif: M.build },
  { title: 'You get paid', body: 'Your commission is paid once the customer completes payment.', motif: M.paid },
];

/* ---------------- run ---------------- */

(async () => {
  const sets = {};

  sets.agents = AGENTS.map((s, i) => ({
    accent: 'gold', eyebrow: 'STEP ' + (i + 1) + ' OF ' + AGENTS.length,
    title: s.title, body: wrap(s.body, 40, 2), motif: s.motif,
    index: i + 1, total: AGENTS.length,
  }));

  const steps = parseSteps('how-it-works/index.html');
  sets['how-it-works'] = steps.map((s, i) => ({
    eyebrow: 'STEP ' + (i + 1) + ' OF ' + steps.length,
    title: s.title, body: wrap(s.body, 40, 3),
    motif: stageMotif(i + 1, steps.length),
    index: i + 1, total: steps.length,
  }));

  const faq = parseFaq('faq/index.html');
  sets.faq = faq.map((q, i) => ({
    eyebrow: 'QUESTION ' + (i + 1) + ' OF ' + faq.length,
    title: q.title, body: wrap(q.body, 74, 4), ghost: false,
    index: i + 1, total: faq.length,
  }));

  const contact = parseContact('contact/index.html');
  sets.contact = contact.map((c, i) => ({
    eyebrow: 'GET IN TOUCH',
    title: c.title, body: wrap('Reach Elevven11 Studio on ' + c.title + '.', 40, 2),
    motif: cardMotif(c.title, c.value), ghost: false,
    index: i + 1, total: contact.length,
  }));

  let total = 0, bytes = 0, singles = 0;
  const sheets = [];
  const singlesDir = path.join(OUT, 'singles');
  fs.mkdirSync(singlesDir, { recursive: true });
  for (const [name, slides] of Object.entries(sets)) {
    const dir = path.join(OUT, name);
    fs.mkdirSync(dir, { recursive: true });
    for (const s of slides) {
      const file = path.join(dir, s.index + '.png');
      await sharp(Buffer.from(slide(s))).png({ compressionLevel: 9 }).toFile(file);
      bytes += fs.statSync(file).size;
      total++;

      // What the page actually loads. Roughly half the PNG at a quality the
      // slide type survives - these are crisp text on flat colour, which is
      // where lossy encoders normally ring, so 95 rather than the usual 80.
      // The PNG stays: the contact sheet composites from it, and the singles
      // below are copies of it.
      await sharp(file).webp({ quality: 95, effort: 6 })
        .toFile(path.join(dir, s.index + '.webp'));

      // Flat, self-describing copy for sharing one step at a time. The
      // numbered files above stay exactly as they are because the page markup
      // points at them; these exist because "1.png" tells you nothing once it
      // is sitting in a downloads folder next to three other "1.png"s.
      const singleName = name + '-' + String(s.index).padStart(2, '0')
        + '-' + slugify(s.title) + '.png';
      fs.copyFileSync(file, path.join(singlesDir, singleName));
      singles++;
    }
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(slides.map((s) => ({
      index: s.index,
      src: '/assets/slides/' + name + '/' + s.index + '.webp',
      alt: s.eyebrow + ': ' + s.title + ' — ' + s.body.join(' ').replace(/…$/, ''),
    })), null, 2) + '\n', 'utf8');
    // One combined PNG per set, so the whole sequence can be shared as a single
    // image (WhatsApp, print) rather than N separate files. Single column for
    // short sets, two columns once that would get absurdly tall.
    const cols = slides.length <= 5 ? 1 : 2;
    const rows = Math.ceil(slides.length / cols);
    const gap = 24;
    const sheetW = cols * W + (cols - 1) * gap;
    const sheetH = rows * H + (rows - 1) * gap;
    const tiles = slides.map((sl, i) => ({
      input: path.join(dir, sl.index + '.png'),
      left: (i % cols) * (W + gap),
      top: Math.floor(i / cols) * (H + gap),
    }));
    // Compose at full size first: sharp applies resize before composite within
    // a single pipeline, so doing both at once would misplace every tile.
    const composed = await sharp({
      create: { width: sheetW, height: sheetH, channels: 3, background: '#0b0a10' },
    }).composite(tiles).png().toBuffer();

    const sheetFile = path.join(OUT, name + '-all.png');
    await sharp(composed)
      .resize({ width: Math.min(sheetW, 1600) })
      .png({ compressionLevel: 9 })
      .toFile(sheetFile);
    sheets.push(name + '-all.png (' + Math.round(fs.statSync(sheetFile).size / 1024) + 'K)');

    console.log(name.padEnd(14) + slides.length + ' slides');
    if (!slides.length) {
      console.error('  WARNING: parsed 0 items from the page - check the markup selectors');
      process.exitCode = 1;
    }
  }
  console.log('\n' + total + ' slides at ' + W + 'x' + H + ', ' + (bytes / 1024 / 1024).toFixed(2) + ' MB');
  console.log('combined sheets: ' + sheets.join(', '));
  const singlesBytes = fs.readdirSync(singlesDir)
    .reduce((a, f) => a + fs.statSync(path.join(singlesDir, f)).size, 0);
  console.log('named singles:   ' + singles + ' in assets/slides/singles/ ('
    + (singlesBytes / 1024 / 1024).toFixed(2) + ' MB)');
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
