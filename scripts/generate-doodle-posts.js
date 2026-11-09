/**
 * Doodle-style square posts: one 1080x1080 PNG per entry in doodle-posts-data.js,
 * written to promo/doodle/posts/, plus captions.txt with a ready-to-paste caption
 * for each. Drawn on notebook paper with wobbly marker outlines (doodle-art.js).
 *
 *   cd scripts && npm run doodle-posts
 *
 * Separate from the sticker posts in promo/facts/, which this does not touch.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const POSTS = require('./doodle-posts-data');
const { postSvg, SITE } = require('./doodle-art');

const ROOT = path.resolve(__dirname, '..');
const OUT = process.env.DOODLE_POSTS_OUT || path.join(ROOT, 'promo/doodle/posts');

const HASHTAGS = {
  'ANCIENT HISTORY': '#ancienthistory #history #didyouknow',
  'AFRICA FACTS': '#africa #africanfacts #didyouknow',
  'TRANSPORT FACTS': '#transport #history #didyouknow',
  'WEB TIP': '#webdesign #websitetips #smallbusiness',
  'BUSINESS ORIGINS': '#business #brandhistory #didyouknow',
  'DINOSAUR FACTS': '#dinosaurs #prehistoric #didyouknow',
};

const slugOf = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 44);

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const groups = [...new Set(POSTS.map((p) => p.tag))];
  const captions = [];
  let bytes = 0;

  for (const [i, p] of POSTS.entries()) {
    const file = String(i + 1).padStart(2, '0') + '-' + slugOf(p.hook) + '.png';
    const png = await sharp(Buffer.from(postSvg(p, i, groups.indexOf(p.tag)))).png({ compressionLevel: 9 }).toBuffer();
    fs.writeFileSync(path.join(OUT, file), png);
    bytes += png.length;
    captions.push(file + '\n' + p.hook + '\n' + p.fact + '\n' + p.punch
      + '\n\nSimple websites, built for you. ' + SITE + '\n' + (HASHTAGS[p.tag] || '#didyouknow'));
    if ((i + 1) % 10 === 0) console.log('  ' + (i + 1) + ' of ' + POSTS.length);
  }
  fs.writeFileSync(path.join(OUT, 'captions.txt'), captions.join('\n\n----\n\n') + '\n');
  console.log('wrote ' + POSTS.length + ' doodle posts at 1080x1080, ' + (bytes / 1024 / 1024).toFixed(1) + ' MB, plus captions.txt');
})().catch((e) => { console.error(e.message); process.exit(1); });
