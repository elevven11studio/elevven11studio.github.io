/**
 * Regenerates the demo preview images in assets/previews/.
 *
 * For every folder under examples/, this screenshots the live page with headless
 * Chrome (or Edge) and writes two files:
 *
 *   <slug>.webp     800x420   card thumbnail on the examples page
 *   <slug>-og.jpg   1200x630  og:image for that demo's social preview
 *
 * JPEG for the og:image is deliberate: Facebook's crawler handles WebP, but
 * LinkedIn only commits to JPG/PNG/GIF.
 *
 * Run this after changing any template - otherwise the previews go stale and
 * advertise a design that no longer exists.
 *
 *   cd tools && npm install && npm run previews
 *
 * No dev server needed; a throwaway static server is started on a free port.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const EXAMPLES = path.join(ROOT, 'examples');
const OUT = path.join(ROOT, 'assets/previews');

const SHOT = { width: 1280, height: 900 };
// Portrait capture for the phone mockups used by the promo graphics. The
// audience buys on phones, so showing the template as it actually renders
// there is more persuasive than a desktop browser frame.
// 500 is Chrome's minimum window width on Windows. Ask for less and it clamps
// the LAYOUT to 500 while still cropping the SCREENSHOT to what you asked for,
// which silently cuts the right-hand 80px off every capture. Still well under
// the templates' 700px breakpoint, so the layout is genuinely the mobile one.
const MOBILE = { width: 500, height: 1000 };
// Crop the top band at the Open Graph ratio (1.91:1) so the hero is what shows.
// Skips the studio ribbon. The ribbon is ~52px tall in the 1280-wide capture;
// cutting it here keeps it out of the thumbnails AND the og:images, so our
// watermark never appears on artwork that is meant to show the customer's site.
const RIBBON_DESKTOP = 52;
const CROP = { left: 0, top: RIBBON_DESKTOP, width: 1280, height: 672 };
const THUMB = { width: 800, height: 420, quality: 74 };
const OG = { width: 1200, height: 630, quality: 76 };

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.png': 'image/png', '.ico': 'image/x-icon',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain',
};

/**
 * Runs the browser and resolves when it exits.
 *
 * This MUST be async. The static server below lives in this same process, so a
 * synchronous spawn blocks the event loop and the server cannot answer the
 * request the browser is making - the page never loads, the screenshot is
 * never taken, and every capture times out. That was a real bug here.
 */
function runBrowser(bin, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(bin, args, { stdio: 'ignore' });
    const timer = setTimeout(() => { child.kill('SIGKILL'); resolve('timeout'); }, timeoutMs);
    child.on('error', () => { clearTimeout(timer); resolve('error'); });
    child.on('exit', () => { clearTimeout(timer); resolve('ok'); });
  });
}

function findBrowser() {
  const found = BROWSERS.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error('No Chrome or Edge found. Add its path to BROWSERS in this file.');
  }
  return found;
}

function startServer() {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.join(ROOT, rel);

    // Keep the server inside the repo even if a request tries to walk out of it.
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      return res.end('not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

(async () => {
  const browser = findBrowser();
  const slugs = fs.readdirSync(EXAMPLES, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (!slugs.length) throw new Error('No demo folders found under examples/.');

  const { server, port } = await startServer();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'e11-shots-'));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'e11-profile-'));
  fs.mkdirSync(OUT, { recursive: true });
  const mobileDir = path.join(OUT, 'mobile');
  fs.mkdirSync(mobileDir, { recursive: true });

  console.log(`browser : ${path.basename(browser)}`);
  console.log(`serving : ${ROOT} on 127.0.0.1:${port}`);
  console.log(`demos   : ${slugs.length}\n`);

  let thumbBytes = 0, ogBytes = 0, mobileCount = 0;
  const failed = [];

  for (const [i, slug] of slugs.entries()) {
    const shot = path.join(tmp, `${slug}.png`);
    const result = await runBrowser(browser, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-sandbox',
      `--user-data-dir=${profile}`,
      '--no-first-run', '--no-default-browser-check', '--disable-extensions',
      '--disable-background-networking', '--disable-component-update', '--disable-sync',
      '--metrics-recording-only', '--mute-audio',
      '--virtual-time-budget=4000',
      `--window-size=${SHOT.width},${SHOT.height}`,
      `--screenshot=${shot}`,
      `http://127.0.0.1:${port}/examples/${slug}/`,
    ], 25000);

    if (result !== 'ok' || !fs.existsSync(shot)) {
      failed.push(slug);
      console.log(`  [${i + 1}/${slugs.length}] ${slug} - FAILED`);
      continue;
    }

    const thumb = path.join(OUT, `${slug}.webp`);
    await sharp(shot).extract(CROP).resize(THUMB.width, THUMB.height)
      .webp({ quality: THUMB.quality }).toFile(thumb);
    thumbBytes += fs.statSync(thumb).size;

    // Portrait capture, used by the promo phone mockups.
    const mshot = path.join(tmp, `${slug}-m.png`);
    await runBrowser(browser, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-sandbox',
      `--user-data-dir=${profile}`,
      '--no-first-run', '--no-default-browser-check', '--disable-extensions',
      '--disable-background-networking', '--disable-component-update', '--disable-sync',
      '--metrics-recording-only', '--mute-audio',
      '--virtual-time-budget=4000',
      `--window-size=${MOBILE.width},${MOBILE.height}`,
      `--screenshot=${mshot}`,
      `http://127.0.0.1:${port}/examples/${slug}/`,
    ], 25000);
    if (fs.existsSync(mshot)) {
      await sharp(mshot)
        .resize(MOBILE.width, MOBILE.height, { fit: 'cover', position: 'top' })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(path.join(mobileDir, `${slug}.jpg`));
      mobileCount++;
    }

    const og = path.join(OUT, `${slug}-og.jpg`);
    await sharp(shot).extract(CROP).resize(OG.width, OG.height)
      .jpeg({ quality: OG.quality, mozjpeg: true }).toFile(og);
    ogBytes += fs.statSync(og).size;

    console.log(`  [${i + 1}/${slugs.length}] ${slug}`);
  }

  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.rmSync(profile, { recursive: true, force: true });

  const done = slugs.length - failed.length;
  console.log(`\nwrote ${done * 2} files for ${done} demos`);
  console.log(`  thumbnails ${(thumbBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  og images  ${(ogBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  mobile     ${mobileCount} portrait shots`);

  if (failed.length) {
    console.error(`\nFAILED (${failed.length}): ${failed.join(', ')}`);
    process.exitCode = 1;
  }
})().catch((err) => {
  console.error('\n' + err.message);
  process.exitCode = 1;
});
