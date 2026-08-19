/**
 * Decodes the QR codes back out of the finished promo PNGs and checks they
 * still point where they should.
 *
 * Worth running after any change to the promo layout: it is easy to move the
 * QR under other artwork, or shift a crop, and end up shipping a code that no
 * longer scans. This reads the composited PNG, not the source buffer, so it
 * tests what people actually scan.
 *
 *   cd tools && npm install && npm run verify-qr
 *
 * Needs the devDependency jsqr.
 */

const path = require('path');
const sharp = require('sharp');
const jsQR = require('jsqr');

const ROOT = path.resolve(__dirname, '..');

const EXPECTED = [
  { file: 'promo/main.png', mustContain: 'github.io/?' },
  { file: 'promo/agents.png', mustContain: 'github.io/agents/?' },
  { file: 'promo/stories/main.png', mustContain: 'github.io/?' },
  { file: 'promo/stories/agents.png', mustContain: 'github.io/agents/?' },
  { file: 'promo/stories/examples.png', mustContain: 'github.io/examples/?' },
  { file: 'assets/qr/site.png', mustContain: 'github.io/?' },
  { file: 'assets/qr/agents.png', mustContain: 'github.io/agents/?' },
  { file: 'assets/qr/get-started.png', mustContain: 'github.io/get-started/?' },
];

// Rendered at these widths (aspect preserved); the smallest that still decodes tells
// you how far it can shrink in a feed and stay usable.
const SCALES = [1080, 720, 540, 360, 270];

async function decodeAt(file, width) {
  const { data, info } = await sharp(file).resize({ width }).ensureAlpha()
    .raw().toBuffer({ resolveWithObject: true });
  return jsQR(new Uint8ClampedArray(data), info.width, info.height);
}

(async () => {
  let failed = 0;

  for (const item of EXPECTED) {
    const abs = path.join(ROOT, item.file);
    const full = await decodeAt(abs, SCALES[0]);

    if (!full) {
      console.error(item.file + ': QR DID NOT DECODE');
      failed++;
      continue;
    }

    const okTarget = full.data.includes(item.mustContain);
    const okUtm = /utm_source=(promo|site)&utm_medium=qr&utm_campaign=/.test(full.data);

    const results = [];
    for (const w of SCALES) {
      results.push(w + 'px:' + ((await decodeAt(abs, w)) ? 'ok' : 'fail'));
    }

    console.log(item.file);
    console.log('  -> ' + full.data);
    console.log('  target ' + (okTarget ? 'ok' : 'WRONG') + ' | utm ' + (okUtm ? 'ok' : 'MISSING'));
    console.log('  ' + results.join('  '));

    if (!okTarget || !okUtm) failed++;
  }

  if (failed) {
    console.error('\n' + failed + ' promo QR check(s) failed');
    process.exitCode = 1;
  } else {
    console.log('\nall promo QR codes decode and point at the right pages');
  }
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
