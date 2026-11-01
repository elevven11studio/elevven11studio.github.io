/**
 * Reel and carousel slides: a 12-slide set for each topic in
 * reel-carousels-data.js (a cover, ten fact or joke slides, and a closing
 * call to action).
 *
 * Every slide is written twice:
 *
 *   promo/reels/<topic>/NN-name.png        1080x1920, for reels and stories
 *   promo/reels/<topic>/feed/NN-name.png   1080x1350, for feed carousels (4:5)
 *
 * The two are the same artwork. The design lives in a 1080x1350 band, and the
 * reel version centres that band on a taller canvas, so the top and bottom of a
 * reel stay free for the platform's own buttons and captions. Each topic folder
 * also gets script.txt: a read-aloud script for the reel and a caption to paste.
 *
 *   cd scripts && npm run reels
 *
 * The existing square posts in promo/facts/ are a separate generator and are
 * not touched by this one. Pictures come from fact-art.js.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const TOPICS = require('./reel-carousels-data');
const { SITE, FONT, esc, PALETTES, st, starPoints, spark, MOTIFS, K, wrapW } = require('./fact-art');

const ROOT = path.resolve(__dirname, '..');
const OUT = process.env.REELS_OUT || path.join(ROOT, 'promo/reels');

const W = 1080;       // width of every slide
const BAND = 1350;    // the 4:5 design area
const H = 1920;       // reel canvas height
const YOFF = 240;     // where the band starts on the reel canvas

const TOTAL = 12;
const CX = 540;

/* ---------------- shared pieces ---------------- */

// Like wrapW, but narrows the width until the last line holds more than one
// word, so a single orphan word never sits alone on its own line.
function wrapB(text, maxW, size, k) {
  const base = wrapW(text, maxW, size, k);
  if (base.length < 2 || base[base.length - 1].includes(' ')) return base;
  for (let w = maxW - 30; w > maxW * 0.6; w -= 30) {
    const t = wrapW(text, w, size, k);
    if (t.length === base.length && t[t.length - 1].includes(' ')) return t;
  }
  return base;
}

const text = (x, y, s, size, weight, fill, extra = '') =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" font-family="${FONT}" fill="${fill}" ${extra}>${esc(s)}</text>`;

function pill(c, label, x, y) {
  const w = label.length * 17 + 60;
  return `<g transform="rotate(-3 ${x} ${y + 27})"><rect x="${x}" y="${y}" width="${w}" height="54" rx="27" fill="${c.line}"/>`
    + text(x + w / 2, y + 36, label, 25, 800, c.paper, 'text-anchor="middle" letter-spacing="3"') + '</g>';
}

function progress(c, index) {
  const gap = 32;
  const x0 = CX - ((TOTAL - 1) * gap) / 2;
  let out = '';
  for (let i = 0; i < TOTAL; i++) {
    out += i === index
      ? `<circle cx="${x0 + i * gap}" cy="1262" r="10" fill="${c.text}"/>`
      : `<circle cx="${x0 + i * gap}" cy="1262" r="7" fill="none" stroke="${c.text}" stroke-width="3" opacity="0.4"/>`;
  }
  return out;
}

const footer = (c) =>
  text(70, 1322, 'ELEVVEN11 STUDIO', 24, 800, c.text, 'letter-spacing="4"')
  + text(1010, 1322, SITE, 24, 400, c.text, 'text-anchor="end" opacity="0.8"');

function burst(c, cy, R, r) {
  return `<polygon points="${starPoints(CX + 14, cy + 16, R, r, 18)}" fill="${c.shadow}"/>`
    + `<polygon points="${starPoints(CX, cy, R, r, 18)}" fill="${c.paper}" ${st(c, 9)}/>`;
}

function sparks(c, i, top) {
  const f = i % 2;
  return spark(c, f ? 960 : 120, top + 70, 40, c.accent) + spark(c, f ? 130 : 955, top + 470, 32, c.pop)
    + spark(c, f ? 935 : 160, top + 44, 20, c.pop) + spark(c, f ? 975 : 100, top + 420, 22, c.accent);
}

// A drawing, or a huge number on a banner, centred at CX, cy.
function picture(c, p, cy, scale, bannerH) {
  if (p.stat) {
    const size = Math.min(210, Math.floor(860 / (p.stat.length * 0.62)));
    return `<g transform="rotate(-4 ${CX} ${cy})">`
      + `<rect x="${CX - 480 + 14}" y="${cy - bannerH / 2 + 16}" width="960" height="${bannerH}" rx="22" fill="${c.pop}"/>`
      + `<rect x="${CX - 480}" y="${cy - bannerH / 2}" width="960" height="${bannerH}" rx="22" fill="${c.line}"/>`
      + text(CX, cy + size * 0.35, p.stat, size, 900, c.accent, 'text-anchor="middle"') + '</g>';
  }
  if (!MOTIFS[p.motif]) throw new Error('No motif: ' + p.motif);
  return `<g transform="translate(${CX} ${cy}) scale(${scale})">${MOTIFS[p.motif](c)}</g>`;
}

/* ---------------- fact and joke slide ---------------- */

function factLayout(p) {
  for (const hs of [84, 74, 64]) {
    for (const fs of [34, 31]) {
      const head = wrapB(p.hook, 940, hs, K.head);
      const fact = wrapB(p.fact, 940, fs, K.fact);
      const bub = wrapW(p.punch, 860, 40, K.bubble);
      if (head.length > 3 || fact.length > 3 || bub.length > 2) continue;
      const step = Math.round(hs * 1.1);
      const lh = Math.round(fs * 1.35);
      const y0 = 800;
      const factY = y0 + (head.length - 1) * step + 74;
      const bTop = factY + (fact.length - 1) * lh + 46;
      const bH = 54 + bub.length * 50;
      if (bTop + bH > 1215) continue;
      // Short slides leave a gap above the dots. Share it between the picture and the text.
      const extra = (1215 - 685) - (bTop + bH - (y0 - hs * 0.8)) - 24;
      return {
        hs, fs, head, fact, bub, step, lh, y0, factY, bTop, bH,
        dyPic: Math.max(0, Math.min(Math.round(extra * 0.3), 80)),
        dyText: Math.max(0, Math.min(Math.round(extra * 0.7), 190)),
      };
    }
  }
  throw new Error('Does not fit: ' + p.hook);
}

function factSlide(c, topic, p, si, ti) {
  const L = factLayout(p);
  const head = L.head.map((t, k) => text(70, L.y0 + k * L.step, t, L.hs, 900, c.text, 'letter-spacing="-1"')).join('');
  const fact = L.fact.map((t, k) => text(70, L.factY + k * L.lh, t, L.fs, 400, c.text, 'opacity="0.88"')).join('');

  const bw = Math.min(940, Math.ceil(Math.max(...L.bub.map((t) => t.length)) * 40 * K.bubble) + 90);
  const bubble = `<g transform="rotate(-1.5 ${70 + bw / 2} ${L.bTop + L.bH / 2})">`
    + `<polygon points="116,${L.bTop + 3} 178,${L.bTop + 3} 100,${L.bTop - 36}" fill="${c.paper}" ${st(c, 7)}/>`
    + `<rect x="70" y="${L.bTop}" width="${bw}" height="${L.bH}" rx="32" fill="${c.paper}" stroke="${c.line}" stroke-width="7"/>`
    + `<rect x="120" y="${L.bTop - 4}" width="54" height="10" fill="${c.paper}"/>`
    + L.bub.map((t, k) => text(70 + bw / 2, L.bTop + 64 + k * 50, t, 40, 800, c.line, 'text-anchor="middle"')).join('')
    + '</g>';

  return {
    c,
    body: `<g transform="translate(0 ${L.dyPic})">` + sparks(c, si, 120) + burst(c, 430, 255, 215) + picture(c, p, 430, 1.42, 250) + '</g>'
      + pill(c, topic.tag, 70, 64)
      + text(1010, 100, `${si} / 10`, 28, 800, c.text, 'text-anchor="end" letter-spacing="3" opacity="0.65"')
      + `<g transform="translate(0 ${L.dyText})">` + head + fact + bubble + '</g>',
    idx: si,
  };
}

/* ---------------- cover ---------------- */

function coverSlide(c, topic) {
  const [l1, l2] = topic.cover.title;
  const s1 = Math.min(150, Math.floor(940 / (l1.length * 0.6)));
  const s2 = Math.min(150, Math.floor(880 / (l2.length * 0.6)));
  const y1 = 800;
  const bh = Math.round(s2 * 1.3);
  const bc = y1 + 22 + Math.round(s2 * 0.62);
  const sub = wrapB(topic.cover.sub, 900, 38, K.fact).slice(0, 2);
  const subY = bc + bh / 2 + 70;
  const pillY = subY + (sub.length - 1) * 50 + 46;

  const banner = `<g transform="rotate(-2 ${CX} ${bc})">`
    + `<rect x="${CX - 470 + 14}" y="${bc - bh / 2 + 14}" width="940" height="${bh}" rx="20" fill="${c.pop}"/>`
    + `<rect x="${CX - 470}" y="${bc - bh / 2}" width="940" height="${bh}" rx="20" fill="${c.line}"/>`
    + text(CX, bc + s2 * 0.34, l2, s2, 900, c.accent, 'text-anchor="middle" letter-spacing="-1"') + '</g>';

  const swipe = `<g transform="rotate(-2 270 ${pillY + 42})"><rect x="70" y="${pillY}" width="380" height="84" rx="42" fill="${c.line}"/>`
    + text(230, pillY + 56, 'SWIPE', 38, 800, c.paper, 'text-anchor="middle" letter-spacing="5"')
    + `<path d="M330 ${pillY + 42} H398 M376 ${pillY + 22} L398 ${pillY + 42} L376 ${pillY + 62}" fill="none" stroke="${c.accent}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>`;

  return {
    c,
    body: sparks(c, 0, 110) + burst(c, 405, 255, 212) + picture(c, { motif: topic.cover.motif }, 405, 1.4)
      + pill(c, topic.tag, 70, 64)
      + text(1010, 100, topic.kind === 'comedy' ? '10 LAUGHS' : '10 FACTS', 28, 800, c.text, 'text-anchor="end" letter-spacing="3" opacity="0.65"')
      + text(70, y1, l1, s1, 900, c.text, 'letter-spacing="-2"') + banner
      + sub.map((t, k) => text(70, subY + k * 50, t, 38, 400, c.text, 'opacity="0.9"')).join('') + swipe,
    idx: 0,
  };
}

/* ---------------- closing call to action ---------------- */

function ctaSlide(c, topic) {
  const head = topic.cta.head.map((t, k) => text(70, 800 + k * 94, t, 84, 900, c.text, 'letter-spacing="-1"')).join('');
  const bw = SITE.length * 22 + 110;
  const button = `<g transform="rotate(-1.5 ${CX} 1060)">`
    + `<rect x="${CX - bw / 2 + 10}" y="${1010 + 12}" width="${bw}" height="104" rx="52" fill="${c.line}"/>`
    + `<rect x="${CX - bw / 2}" y="1010" width="${bw}" height="104" rx="52" fill="${c.accent}" stroke="${c.line}" stroke-width="7"/>`
    + text(CX, 1076, SITE, 40, 800, c.line, 'text-anchor="middle"') + '</g>';

  return {
    c,
    body: sparks(c, 1, 120) + burst(c, 400, 240, 200) + picture(c, { motif: 'browser' }, 400, 1.3)
      + pill(c, 'ELEVVEN11 STUDIO', 70, 64)
      + head + text(70, 800 + (topic.cta.head.length - 1) * 94 + 70, topic.cta.sub, 38, 400, c.text, 'opacity="0.9"')
      + button + text(CX, 1196, 'Follow for more', 32, 600, c.text, 'text-anchor="middle" opacity="0.8"'),
    idx: TOTAL - 1,
  };
}

/* ---------------- assemble ---------------- */

function svgOf(slide) {
  const c = slide.c;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + `<defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="3" fill="${c.line}"/></pattern></defs>`
    + `<rect width="${W}" height="${H}" fill="${c.bg}"/><rect width="${W}" height="${H}" fill="url(#dots)" opacity="0.10"/>`
    + `<g transform="translate(0 ${YOFF})">` + slide.body + progress(c, slide.idx) + footer(c) + '</g></svg>';
}

const slugOf = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const pad = (n) => String(n).padStart(2, '0');

function scriptOf(topic) {
  const lines = [];
  const n = topic.kind === 'comedy' ? 'laughs' : 'facts';
  lines.push(`${topic.tag}: ${topic.cover.title.join(' ').toLowerCase()}`);
  lines.push('Read each slide aloud. About 3 to 4 seconds a slide makes a 40 second reel.', '');
  lines.push(`1. Cover: "${topic.cover.title.join(' ')}. ${topic.cover.sub}"`);
  topic.slides.forEach((p, i) => {
    lines.push(topic.kind === 'comedy'
      ? `${i + 2}. Someone says: ${p.hook} ${p.fact} Your reply: ${p.punch}`
      : `${i + 2}. ${p.hook} ${p.fact} ${p.punch}`);
  });
  lines.push(`12. "${topic.cta.head.join(' ')} ${topic.cta.sub} ${SITE}"`, '');
  lines.push('Caption:');
  lines.push(`${topic.cover.title.join(' ')}. Which of the ten ${n === 'laughs' ? 'did you hear first' : 'surprised you most'}?`);
  lines.push(`Simple websites, built for you. ${SITE}`);
  lines.push(topic.hashtags);
  return lines.join('\n') + '\n';
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let slides = 0;
  let bytes = 0;

  for (const [ti, topic] of TOPICS.entries()) {
    if (topic.slides.length !== 10) throw new Error(topic.slug + ' needs exactly 10 slides');
    const dir = path.join(OUT, pad(ti + 1) + '-' + topic.slug);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(path.join(dir, 'feed'), { recursive: true });

    const colour = (si) => PALETTES[(ti * 2 + si * 3) % PALETTES.length];
    const set = [
      ['cover', coverSlide(colour(0), topic)],
      ...topic.slides.map((p, i) => [slugOf(p.hook), factSlide(colour(i + 1), topic, p, i + 1, ti)]),
      ['call-to-action', ctaSlide(colour(11), topic)],
    ];

    for (const [i, [name, slide]] of set.entries()) {
      const file = pad(i + 1) + '-' + name + '.png';
      const reel = await sharp(Buffer.from(svgOf(slide))).png({ compressionLevel: 9 }).toBuffer();
      fs.writeFileSync(path.join(dir, file), reel);
      const feed = await sharp(reel).extract({ left: 0, top: YOFF, width: W, height: BAND }).png({ compressionLevel: 9 }).toBuffer();
      fs.writeFileSync(path.join(dir, 'feed', file), feed);
      slides++;
      bytes += reel.length + feed.length;
    }
    fs.writeFileSync(path.join(dir, 'script.txt'), scriptOf(topic));
    console.log('  ' + pad(ti + 1) + ' ' + topic.slug + ': ' + set.length + ' slides');
  }

  fs.writeFileSync(path.join(OUT, 'README.txt'),
    'Reel and carousel slides.\n\n'
    + 'Each topic folder holds 12 slides: a cover, ten facts or jokes, and a closing call to action.\n'
    + '  NN-name.png        1080x1920, for reels and stories\n'
    + '  feed/NN-name.png   1080x1350, for feed carousels\n'
    + '  script.txt         a read-aloud script and a caption to paste\n\n'
    + 'Regenerate with: cd scripts && npm run reels\n');

  console.log('\nwrote ' + slides + ' slides in two sizes (' + (slides * 2) + ' images, ' + (bytes / 1024 / 1024).toFixed(1) + ' MB)');
})().catch((e) => { console.error(e.message); process.exit(1); });
