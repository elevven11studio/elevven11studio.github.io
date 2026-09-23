/**
 * Regenerates sitemap.xml.
 *
 * This exists because the sitemap was hand-edited and drifted twice: once when
 * the xmlns values were "tidied" from http:// to https:// (which silently
 * breaks it, see NS_SITEMAP below), and once when explanatory comments grew
 * large enough to sit in front of the root element. Generating it removes both
 * classes of mistake.
 *
 *   cd tools && npm run sitemap
 *
 * The output is deliberately plain: no comments, no blank lines, nothing before
 * the XML declaration, and <image:image> placed immediately after <loc> the way
 * Google's own documented example does. Notes about WHY belong in README.md,
 * not inside the file a parser has to read.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://elevven11studio.github.io';
const OUT = path.join(ROOT, 'sitemap.xml');

// These two MUST be http://. An XML namespace is an opaque identifier compared
// as an exact string, never fetched, so https:// is a DIFFERENT namespace and
// every element lands somewhere no sitemap parser recognises. The site being
// HTTPS is irrelevant.
const NS_SITEMAP = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const NS_IMAGE = 'http://www.google.com/schemas/sitemap-image/1.1';

// [pathname, lastmod, changefreq, priority]. Only canonical, indexable pages.
// The /examples/*/ demos are excluded on purpose: they carry noindex because
// they exist to be sent to prospects by link, not found in search.
const PAGES = [
  ['/',                     '2026-08-16', 'weekly',  1.0],
  ['/pricing/',             '2026-08-16', 'monthly', 0.9],
  ['/app-development/',     '2026-09-20', 'monthly', 0.9],
  ['/get-started/',         '2026-08-16', 'monthly', 0.9],
  ['/examples/',            '2026-08-16', 'monthly', 0.9],
  ['/how-it-works/',        '2026-08-16', 'monthly', 0.8],
  ['/agents/',              '2026-08-16', 'monthly', 0.7],
  ['/faq/',                 '2026-08-16', 'monthly', 0.7],
  ['/contact/',             '2026-09-19', 'monthly', 0.7],
  ['/terms/',               '2026-08-23', 'yearly',  0.3],
  ['/privacy/',             '2026-08-16', 'yearly',  0.3],
  ['/support/',             '2026-09-04', 'yearly',  0.3],
  ['/extensions/',          '2026-09-21', 'monthly', 0.8],
  ['/extensions/support/',  '2026-09-19', 'monthly', 0.6],
  ['/webguard/',            '2026-09-21', 'monthly', 0.7],
  ['/webguard/privacy/',    '2026-09-19', 'yearly',  0.3],
  ['/webinspect/',          '2026-09-21', 'monthly', 0.7],
  ['/webinspect/privacy/',  '2026-09-19', 'yearly',  0.3]
];

// Pages whose images are worth declaring. Most are CSS background-image, which
// a crawler will not discover on its own. QR codes and the 128px extension
// icons are skipped: neither makes a useful Image Search result.
// Image entries are currently OFF. Search Console rejected the sitemap with
// "Sitemap could not be read" while the image extension was present, and a
// sitemap that is read without images beats one that is not read at all.
// Restore the list below once the plain sitemap is confirmed reading; nothing
// else needs to change, and the pages themselves are unaffected either way.
const IMAGE_PAGES = ['/examples/', '/how-it-works/', '/agents/', '/faq/', '/contact/'];
const WITH_IMAGES = [];  // <- set to IMAGE_PAGES to re-enable
const SKIP_IMAGE = /\/qr\/|icon-\d+\.png|favicon/;

const imagesFor = (pathname) => {
  const file = path.join(ROOT, pathname, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const hits = [...html.matchAll(/(?:src=|url\()['"]?(\/assets\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp))/g)]
    .map(m => m[1]);
  return [...new Set(hits)].filter(p => !SKIP_IMAGE.test(p)).sort();
};

const lines = [];
lines.push('<?xml version="1.0" encoding="UTF-8"?>');
// Declare the image namespace only when image entries are actually emitted.
// An unused namespace declaration is legal, but this keeps a plain sitemap
// byte-for-byte identical to the textbook example.
const usesImages = WITH_IMAGES.length > 0;
lines.push(usesImages
  ? `<urlset xmlns="${NS_SITEMAP}" xmlns:image="${NS_IMAGE}">`
  : `<urlset xmlns="${NS_SITEMAP}">`);

let imageCount = 0;
const missing = [];

for (const [pathname, lastmod, changefreq, priority] of PAGES) {
  lines.push('  <url>');
  lines.push(`    <loc>${BASE}${pathname}</loc>`);

  // Straight after <loc>, matching Google's documented example.
  if (WITH_IMAGES.includes(pathname)) {
    for (const img of imagesFor(pathname)) {
      if (!fs.existsSync(path.join(ROOT, img))) missing.push(img);
      lines.push('    <image:image>');
      lines.push(`      <image:loc>${BASE}${img}</image:loc>`);
      lines.push('    </image:image>');
      imageCount++;
    }
  }

  lines.push(`    <lastmod>${lastmod}</lastmod>`);
  lines.push(`    <changefreq>${changefreq}</changefreq>`);
  lines.push(`    <priority>${priority.toFixed(1)}</priority>`);
  lines.push('  </url>');
}

lines.push('</urlset>');

const xml = lines.join('\n') + '\n';
fs.writeFileSync(OUT, xml, 'utf8');

// ---- self-check: catch the regressions that actually happened ----
const problems = [];
if (xml.charCodeAt(0) !== 0x3c) problems.push('file does not start with "<" (BOM?)');
if (!xml.startsWith('<?xml')) problems.push('XML declaration is not first');
if (xml.indexOf('<urlset') !== xml.indexOf('\n') + 1) problems.push('something sits between the declaration and <urlset>');
if (xml.includes('<!--')) problems.push('comments present; keep the file plain');
if (xml.includes('xmlns="https://')) problems.push('sitemap namespace is https:// and must be http://');
if (xml.includes('xmlns:image="https://')) problems.push('image namespace is https:// and must be http://');
if (/&(?!amp;|lt;|gt;|quot;|apos;|#)/.test(xml)) problems.push('unescaped ampersand');
if (Buffer.byteLength(xml) > 50 * 1024 * 1024) problems.push('over the 50MB limit');
if (missing.length) problems.push('images not on disk: ' + missing.join(', '));

console.log('pages:  ' + PAGES.length);
console.log('images: ' + imageCount);
console.log('bytes:  ' + Buffer.byteLength(xml));
if (problems.length) {
  console.log('');
  problems.forEach(p => console.log('  PROBLEM: ' + p));
  process.exitCode = 1;
} else {
  console.log('self-check: clean');
}
