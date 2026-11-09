/**
 * Tech and programming posts and reels, rendered from one set of copy in two
 * styles: the doodle style (doodle-art.js) and the code-editor style
 * (code-art.js).
 *
 *   cd scripts
 *   npm run tech                    both styles, posts and reels
 *   node generate-tech.js code      only the code-editor style
 *   node generate-tech.js doodle reels
 *
 * Output, for each style:
 *
 *   promo/tech/<style>/posts/NN-name.png          1080x1080, plus captions.txt
 *   promo/tech/<style>/reels/<topic>/NN-name.png  1080x1920 for reels and stories
 *   promo/tech/<style>/reels/<topic>/feed/...     1080x1350 for feed carousels
 *   promo/tech/<style>/reels/<topic>/script.txt   read-aloud script and caption
 *
 * Copy lives in tech-posts-data.js and tech-reels-data.js. The doodle style is
 * slow to render (the wobble filter), so allow a few minutes for it.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const POSTS = require('./tech-posts-data');
const TOPICS = require('./tech-reels-data');

const ROOT = path.resolve(__dirname, '..');
const OUT = process.env.TECH_OUT || path.join(ROOT, 'promo/tech');

const STYLES = { doodle: require('./doodle-art'), code: require('./code-art') };

const HASHTAGS = {
  'TECH TRIVIA': '#techfacts #technology #didyouknow',
  'WEB BASICS': '#webdesign #websitebasics #smallbusiness',
  'CODER JOKES': '#programmerhumor #coding #funny',
  'CODING TIPS': '#codingtips #programming #developer',
};

const slugOf = (s, n = 44) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, n);
const pad = (n) => String(n).padStart(2, '0');

function scriptOf(topic, site) {
  const lines = [];
  lines.push(`${topic.tag}: ${topic.cover.title.join(' ').toLowerCase()}`);
  lines.push('Read each slide aloud. About 3 to 4 seconds a slide makes a 40 second reel.', '');
  lines.push(`1. Cover: "${topic.cover.title.join(' ')}. ${topic.cover.sub}"`);
  topic.slides.forEach((p, i) => {
    lines.push(topic.kind === 'comedy'
      ? `${i + 2}. Someone says: ${p.hook} ${p.fact} Your reply: ${p.punch}`
      : `${i + 2}. ${p.hook} ${p.fact} ${p.punch}`);
  });
  lines.push(`12. "${topic.cta.head.join(' ')} ${topic.cta.sub} ${site}"`, '');
  lines.push('Caption:');
  lines.push(`${topic.cover.title.join(' ')}. ${topic.kind === 'comedy' ? 'Which one did you hear first?' : 'Which of the ten surprised you most?'}`);
  lines.push(`Simple websites, built for you. ${site}`);
  lines.push(topic.hashtags);
  return lines.join('\n') + '\n';
}

async function renderPosts(S, dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const groups = [...new Set(POSTS.map((p) => p.tag))];
  const captions = [];
  for (const [i, p] of POSTS.entries()) {
    const file = pad(i + 1) + '-' + slugOf(p.hook) + '.png';
    await sharp(Buffer.from(S.postSvg(p, i, groups.indexOf(p.tag)))).png({ compressionLevel: 9 }).toFile(path.join(dir, file));
    captions.push(file + '\n' + p.hook + '\n' + p.fact + '\n' + p.punch
      + '\n\nSimple websites, built for you. ' + S.SITE + '\n' + (HASHTAGS[p.tag] || '#tech'));
  }
  fs.writeFileSync(path.join(dir, 'captions.txt'), captions.join('\n\n----\n\n') + '\n');
  return POSTS.length;
}

async function renderReels(S, dir) {
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  for (const [ti, topic] of TOPICS.entries()) {
    if (topic.slides.length !== 10) throw new Error(topic.slug + ' needs exactly 10 slides');
    const tdir = path.join(dir, pad(ti + 1) + '-' + topic.slug);
    fs.rmSync(tdir, { recursive: true, force: true });
    fs.mkdirSync(path.join(tdir, 'feed'), { recursive: true });
    const set = [
      ['cover', S.reelCoverSvg(topic, ti)],
      ...topic.slides.map((p, i) => [slugOf(p.hook, 40), S.reelCardSvg(topic, p, i + 1, ti)]),
      ['call-to-action', S.reelCtaSvg(topic, ti)],
    ];
    for (const [i, [name, svg]] of set.entries()) {
      const file = pad(i + 1) + '-' + name + '.png';
      const reel = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
      fs.writeFileSync(path.join(tdir, file), reel);
      const feed = await sharp(reel).extract({ left: 0, top: S.YOFF, width: S.W, height: S.BAND }).png({ compressionLevel: 9 }).toBuffer();
      fs.writeFileSync(path.join(tdir, 'feed', file), feed);
      n++;
    }
    fs.writeFileSync(path.join(tdir, 'script.txt'), scriptOf(topic, S.SITE));
    console.log('    ' + pad(ti + 1) + ' ' + topic.slug);
  }
  return n;
}

(async () => {
  const styleArg = process.argv[2] || 'all';
  const partArg = process.argv[3] || 'all';
  const styles = styleArg === 'all' ? Object.keys(STYLES) : [styleArg];
  for (const s of styles) if (!STYLES[s]) throw new Error('Unknown style: ' + s + ' (use doodle, code or all)');
  if (!['all', 'posts', 'reels'].includes(partArg)) throw new Error('Unknown part: ' + partArg + ' (use posts, reels or all)');

  const stats = [...POSTS, ...TOPICS.flatMap((t) => t.slides)].map((p) => p.stat).filter(Boolean);

  for (const style of styles) {
    console.log(style + ':');
    if (STYLES[style].prepare) await STYLES[style].prepare(stats);
    const base = path.join(OUT, style);
    if (partArg !== 'reels') console.log('  ' + await renderPosts(STYLES[style], path.join(base, 'posts')) + ' posts');
    if (partArg !== 'posts') console.log('  ' + await renderReels(STYLES[style], path.join(base, 'reels')) + ' reel slides, each in two sizes');
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
