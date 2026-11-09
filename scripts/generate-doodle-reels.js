/**
 * Doodle-style reel and carousel slides: a 12-slide set for each topic in
 * doodle-reels-data.js (a cover, ten slides, and a closing call to action).
 *
 * Every slide is written twice:
 *
 *   promo/doodle/reels/<topic>/NN-name.png        1080x1920, for reels and stories
 *   promo/doodle/reels/<topic>/feed/NN-name.png   1080x1350, for feed carousels (4:5)
 *
 * The two are the same artwork: the design sits in a 1080x1350 band and the reel
 * version centres it on a taller canvas, so the top and bottom of a reel stay
 * free for the platform's own buttons and captions. Each topic also gets
 * script.txt, a read-aloud script and a caption to paste.
 *
 *   cd scripts && npm run doodle-reels
 *
 * Separate from the sticker reels in promo/reels/, which this does not touch.
 * Rendering takes a few minutes: the wobble filter is the slow part.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const TOPICS = require('./doodle-reels-data');
const D = require('./doodle-art');

const ROOT = path.resolve(__dirname, '..');
const OUT = process.env.DOODLE_REELS_OUT || path.join(ROOT, 'promo/doodle/reels');

const slugOf = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const pad = (n) => String(n).padStart(2, '0');

function scriptOf(topic) {
  const lines = [];
  lines.push(`${topic.tag}: ${topic.cover.title.join(' ').toLowerCase()}`);
  lines.push('Read each slide aloud. About 3 to 4 seconds a slide makes a 40 second reel.', '');
  lines.push(`1. Cover: "${topic.cover.title.join(' ')}. ${topic.cover.sub}"`);
  topic.slides.forEach((p, i) => {
    lines.push(topic.kind === 'comedy'
      ? `${i + 2}. Someone says: ${p.hook} ${p.fact} Your reply: ${p.punch}`
      : `${i + 2}. ${p.hook} ${p.fact} ${p.punch}`);
  });
  lines.push(`12. "${topic.cta.head.join(' ')} ${topic.cta.sub} ${D.SITE}"`, '');
  lines.push('Caption:');
  lines.push(`${topic.cover.title.join(' ')}. ${topic.kind === 'comedy' ? 'Which one did you hear first?' : 'Which of the ten surprised you most?'}`);
  lines.push(`Simple websites, built for you. ${D.SITE}`);
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

    const set = [
      ['cover', D.reelCoverSvg(topic, ti)],
      ...topic.slides.map((p, i) => [slugOf(p.hook), D.reelCardSvg(topic, p, i + 1, ti)]),
      ['call-to-action', D.reelCtaSvg(topic, ti)],
    ];

    for (const [i, [name, svg]] of set.entries()) {
      const file = pad(i + 1) + '-' + name + '.png';
      const reel = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
      fs.writeFileSync(path.join(dir, file), reel);
      const feed = await sharp(reel).extract({ left: 0, top: D.YOFF, width: D.W, height: D.BAND }).png({ compressionLevel: 9 }).toBuffer();
      fs.writeFileSync(path.join(dir, 'feed', file), feed);
      slides++;
      bytes += reel.length + feed.length;
    }
    fs.writeFileSync(path.join(dir, 'script.txt'), scriptOf(topic));
    console.log('  ' + pad(ti + 1) + ' ' + topic.slug + ': ' + set.length + ' slides');
  }

  fs.writeFileSync(path.join(OUT, 'README.txt'),
    'Doodle reel and carousel slides.\n\n'
    + 'Each topic folder holds 12 slides: a cover, ten facts or jokes, and a closing call to action.\n'
    + '  NN-name.png        1080x1920, for reels and stories\n'
    + '  feed/NN-name.png   1080x1350, for feed carousels\n'
    + '  script.txt         a read-aloud script and a caption to paste\n\n'
    + 'Regenerate with: cd scripts && npm run doodle-reels\n');

  console.log('\nwrote ' + slides + ' slides in two sizes (' + (slides * 2) + ' images, ' + (bytes / 1024 / 1024).toFixed(1) + ' MB)');
})().catch((e) => { console.error(e.message); process.exit(1); });
