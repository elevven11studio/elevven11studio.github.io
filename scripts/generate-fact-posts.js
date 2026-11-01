/**
 * Fact and comedy post images for social media.
 *
 * One 1080x1080 PNG per entry in fact-posts-data.js, written to promo/facts/,
 * plus captions.txt with a ready-to-paste caption for each one. Every post is a
 * sticker-style card: a starburst with a drawing or a huge number, a headline,
 * one supporting fact and a joke in a speech bubble.
 *
 *   cd scripts && npm run facts
 *
 * Add a post by adding a line to fact-posts-data.js. Pictures are drawn here as
 * plain SVG, so there are no image files and no emoji fonts to depend on.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const POSTS = require('./fact-posts-data');

const { SITE, FONT, esc, PALETTES, st, rect, circ, path_, line_, label, starPoints, spark, MOTIFS, K, wrapW } = require('./fact-art');

const ROOT = path.resolve(__dirname, '..');
const OUT = process.env.FACTS_OUT || path.join(ROOT, 'promo/facts');
const S = 1080;

function layout(p) {
  for (const hs of [70, 62, 54]) {
    const head = wrapW(p.hook, 940, hs, K.head);
    const fact = wrapW(p.fact, 940, 29, K.fact);
    const bub = wrapW(p.punch, 820, 34, K.bubble);
    if (head.length > 3 || fact.length > 3 || bub.length > 2) continue;
    const step = Math.round(hs * 1.12);
    const y0 = 556;
    const factY = y0 + (head.length - 1) * step + 62;
    const bTop = factY + (fact.length - 1) * 38 + 38;
    const bH = 44 + bub.length * 42;
    if (bTop + bH <= 996) {
      // Short posts leave a gap above the footer. Spread it between the
      // picture and the text instead of leaving it at the bottom.
      const extra = 1010 - 497 - (bTop + bH - (y0 - hs * 0.8)) - 16;
      return {
        hs, head, step, y0, fact, factY, bub, bTop, bH,
        dyPic: Math.max(0, Math.min(Math.round(extra * 0.3), 70)),
        dyText: Math.max(0, Math.min(Math.round(extra * 0.7), 170)),
      };
    }
  }
  throw new Error('Does not fit: ' + p.hook);
}

/* ---------------- one post ---------------- */

function post(p, i, total) {
  const c = PALETTES[(i * 3) % PALETTES.length];
  const L = layout(p);
  const cx = 540, cy = 292;

  const burst =
    `<polygon points="${starPoints(cx + 12, cy + 14, 205, 172, 18)}" fill="${c.shadow}"/>`
    + `<polygon points="${starPoints(cx, cy, 205, 172, 18)}" fill="${c.paper}" ${st(c, 8)}/>`;

  let picture;
  if (p.stat) {
    const size = Math.min(170, Math.floor(800 / (p.stat.length * 0.62)));
    picture = `<g transform="rotate(-4 ${cx} ${cy})">`
      + `<rect x="${cx - 450 + 12}" y="${cy - 100 + 14}" width="900" height="200" rx="18" fill="${c.pop}"/>`
      + `<rect x="${cx - 450}" y="${cy - 100}" width="900" height="200" rx="18" fill="${c.line}"/>`
      + `<text x="${cx}" y="${cy + size * 0.35}" text-anchor="middle" font-size="${size}" font-weight="900" font-family="${FONT}" fill="${c.accent}">${esc(p.stat)}</text></g>`;
  } else {
    if (!MOTIFS[p.motif]) throw new Error('No motif: ' + p.motif);
    picture = `<g transform="translate(${cx} ${cy}) scale(1.12)">${MOTIFS[p.motif](c)}</g>`;
  }

  const flip = i % 2;
  const sparks = spark(c, flip ? 960 : 125, 165, 34, c.accent) + spark(c, flip ? 140 : 950, 455, 28, c.pop)
    + spark(c, flip ? 935 : 160, 105, 18, c.pop) + spark(c, flip ? 970 : 100, 415, 20, c.accent);

  const tagW = p.tag.length * 15 + 48;
  const tag = `<g transform="rotate(-3 70 76)"><rect x="70" y="52" width="${tagW}" height="46" rx="23" fill="${c.line}"/>`
    + `<text x="${70 + tagW / 2}" y="83" text-anchor="middle" font-size="22" font-weight="800" letter-spacing="3" font-family="${FONT}" fill="${c.paper}">${esc(p.tag)}</text></g>`;
  const count = `<text x="1010" y="84" text-anchor="end" font-size="24" font-weight="800" letter-spacing="3" font-family="${FONT}" fill="${c.text}" opacity="0.65">NO. ${String(i + 1).padStart(2, '0')}</text>`;

  const head = L.head.map((t, k) =>
    `<text x="70" y="${L.y0 + k * L.step}" font-size="${L.hs}" font-weight="900" letter-spacing="-1" font-family="${FONT}" fill="${c.text}">${esc(t)}</text>`).join('');
  const fact = L.fact.map((t, k) =>
    `<text x="70" y="${L.factY + k * 38}" font-size="29" font-family="${FONT}" fill="${c.text}" opacity="0.88">${esc(t)}</text>`).join('');

  const bw = Math.min(940, Math.ceil(Math.max(...L.bub.map((t) => t.length)) * 34 * K.bubble) + 76);
  const bubble = `<g transform="rotate(-1.5 ${70 + bw / 2} ${L.bTop + L.bH / 2})">`
    + `<polygon points="110,${L.bTop + 2} 160,${L.bTop + 2} 96,${L.bTop - 30}" fill="${c.paper}" ${st(c, 6)}/>`
    + `<rect x="70" y="${L.bTop}" width="${bw}" height="${L.bH}" rx="28" fill="${c.paper}" stroke="${c.line}" stroke-width="6"/>`
    + `<rect x="114" y="${L.bTop - 3}" width="42" height="9" fill="${c.paper}"/>`
    + L.bub.map((t, k) => `<text x="${70 + bw / 2}" y="${L.bTop + 55 + k * 42}" text-anchor="middle" font-size="34" font-weight="800" font-family="${FONT}" fill="${c.line}">${esc(t)}</text>`).join('')
    + '</g>';

  const footer = `<text x="70" y="1050" font-size="22" font-weight="800" letter-spacing="4" font-family="${FONT}" fill="${c.text}">ELEVVEN11 STUDIO</text>`
    + `<text x="1010" y="1050" text-anchor="end" font-size="22" font-family="${FONT}" fill="${c.text}" opacity="0.8">${SITE}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">`
    + `<defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="3" fill="${c.line}"/></pattern></defs>`
    + `<rect width="${S}" height="${S}" fill="${c.bg}"/><rect width="${S}" height="${S}" fill="url(#dots)" opacity="0.10"/>`
    + `<g transform="translate(0 ${L.dyPic})">` + sparks + burst + picture + '</g>'
    + tag + count
    + `<g transform="translate(0 ${L.dyText})">` + head + fact + bubble + '</g>'
    + footer + '</svg>';
}

/* ---------------- run ---------------- */

const slugOf = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 44);

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const captions = [];
  for (const [i, p] of POSTS.entries()) {
    const file = String(i + 1).padStart(2, '0') + '-' + slugOf(p.hook) + '.png';
    await sharp(Buffer.from(post(p, i, POSTS.length))).png({ compressionLevel: 9 }).toFile(path.join(OUT, file));
    captions.push(file + '\n' + p.hook + '\n' + p.fact + '\n' + p.punch
      + '\n\nSimple websites, built for you. ' + SITE + '\n#webdesign #smallbusiness #website #didyouknow');
  }
  fs.writeFileSync(path.join(OUT, 'captions.txt'), captions.join('\n\n----\n\n') + '\n');

  const mb = fs.readdirSync(OUT).filter((f) => f.endsWith('.png'))
    .reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0) / 1024 / 1024;
  console.log('wrote ' + POSTS.length + ' posts at ' + S + 'x' + S + ', ' + mb.toFixed(2) + ' MB, plus captions.txt');
})().catch((e) => { console.error(e.message); process.exit(1); });
