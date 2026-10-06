/**
 * Standalone QR codes for embedding in the site itself (as opposed to the ones
 * baked into the promo graphics).
 *
 *   assets/qr/site.png         -> the homepage
 *   assets/qr/agents.png       -> the referral programme
 *   assets/qr/get-started.png  -> the order form
 *
 * Each is written twice. The pages display the .webp (lossless, so every module
 * stays exactly square and the code still scans, at roughly a sixth of the
 * bytes); the .png stays because that is what the "download the QR code" links
 * hand over, and a PNG opens and prints anywhere.
 *
 * Dark-on-white with a wide quiet zone; an inverted code on the dark brand
 * background scans far less reliably. Each is tagged utm_medium=qr so scans are
 * separable from ordinary traffic in GA4.
 *
 *   cd tools && npm install && npm run qr
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets/qr');
const SITE = 'https://elevven11studio.github.io';

const SIZE = 512;   // exported size
const PAD = 44;     // quiet zone inside the white card

const utm = (campaign) => 'utm_source=site&utm_medium=qr&utm_campaign=' + campaign;

const TARGETS = [
  { name: 'site', url: SITE + '/?' + utm('site-qr') },
  { name: 'agents', url: SITE + '/agents/?' + utm('agents-qr') },
  { name: 'get-started', url: SITE + '/get-started/?' + utm('get-started-qr') },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  for (const t of TARGETS) {
    const qr = await QRCode.toBuffer(t.url, {
      type: 'png',
      width: SIZE - PAD * 2,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#0b0a10ff', light: '#ffffffff' },
    });

    const card = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + SIZE + '" height="' + SIZE + '">'
      + '<rect width="' + SIZE + '" height="' + SIZE + '" rx="28" fill="#ffffff"/></svg>'
    );

    const file = path.join(OUT, t.name + '.png');
    await sharp(card)
      .composite([{ input: qr, left: PAD, top: PAD }])
      .png({ compressionLevel: 9 })
      .toFile(file);

    const webp = path.join(OUT, t.name + '.webp');
    await sharp(file).webp({ lossless: true, effort: 6 }).toFile(webp);

    console.log(t.name.padEnd(14)
      + (Math.round(fs.statSync(file).size / 1024) + 'K png').padEnd(9)
      + (Math.round(fs.statSync(webp).size / 1024) + 'K webp').padEnd(10)
      + '-> ' + t.url);
  }

  console.log('\n' + TARGETS.length + ' QR codes at ' + SIZE + 'x' + SIZE);
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
