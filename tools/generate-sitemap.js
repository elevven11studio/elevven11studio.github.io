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
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://elevven11studio.github.io';
const OUT = path.join(ROOT, 'sitemap.xml');
const OUT_TEXT = path.join(ROOT, 'sitemap.txt');

// These two MUST be http://. An XML namespace is an opaque identifier compared
// as an exact string, never fetched, so https:// is a DIFFERENT namespace and
// every element lands somewhere no sitemap parser recognises. The site being
// HTTPS is irrelevant.
const NS_SITEMAP = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const NS_IMAGE = 'http://www.google.com/schemas/sitemap-image/1.1';

// [pathname, changefreq, priority]. Only canonical, indexable pages. The
// /examples/*/ demos are excluded on purpose: they carry noindex because they
// exist to be sent to prospects by link, not found in search.
//
// lastmod is NOT listed here. It was hand-typed and every single entry had
// drifted by up to six weeks, and Google discounts a lastmod it does not
// trust. It now comes from git, so it cannot go stale.
const PAGES = [
  ['/',                      'weekly',   1.0],
  ['/pricing/',              'monthly',  0.9],
  ['/app-development/',      'monthly',  0.9],
  ['/get-started/',          'monthly',  0.9],
  ['/examples/',             'monthly',  0.9],
  ['/how-it-works/',         'monthly',  0.8],
  ['/agents/',               'monthly',  0.7],
  ['/faq/',                  'monthly',  0.7],
  ['/contact/',              'monthly',  0.7],
  ['/terms/',                'yearly',   0.3],
  ['/privacy/',              'yearly',   0.3],
  ['/support/',              'yearly',   0.3],
  ['/extensions/',           'monthly',  0.8],
  ['/extensions/support/',   'monthly',  0.6],
  ['/webguard/',             'monthly',  0.7],
  ['/webguard/try/',         'monthly',  0.6],
  ['/webguard/privacy/',     'yearly',   0.3],
  ['/webinspect/',           'monthly',  0.7],
  ['/webinspect/try/',       'monthly',  0.6],
  ['/webinspect/privacy/',   'yearly',   0.3]
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

// Last commit that touched the page, as YYYY-MM-DD. Falls back to the file's
// mtime if git is unavailable (a shallow CI checkout, or a file not yet
// committed), so the generator never emits an empty or invented date.
const lastmodFor = (pathname) => {
  const rel = path.posix.join(pathname, 'index.html').replace(/^\//, '');
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%ad', '--date=short', '--', rel],
      { cwd: ROOT, encoding: 'utf8' }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch (e) { /* fall through */ }
  return new Date(fs.statSync(path.join(ROOT, rel)).mtime).toISOString().slice(0, 10);
};

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

for (const [pathname, changefreq, priority] of PAGES) {
  const lastmod = lastmodFor(pathname);
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
    // String(), not toFixed(1): whole numbers render as <priority>1</priority>,
  // matching the shortest legal form.
  lines.push(`    <priority>${String(priority)}</priority>`);
  lines.push('  </url>');
}

lines.push('</urlset>');

const xml = lines.join('\n') + '\n';
fs.writeFileSync(OUT, xml, 'utf8');

const text = PAGES.map(([pathname]) => BASE + pathname).join('\n') + '\n';
fs.writeFileSync(OUT_TEXT, text, 'utf8');

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
const badDates = (xml.match(/<lastmod>([^<]*)<\/lastmod>/g) || [])
  .filter(t => !/^<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>$/.test(t));
if (badDates.length) problems.push('malformed lastmod: ' + badDates.join(', '));
if (Buffer.byteLength(text) > 50 * 1024 * 1024) problems.push('text sitemap is over the 50MB limit');
if (!text.endsWith('\n')) problems.push('text sitemap must end with a newline');

console.log('pages:  ' + PAGES.length);
console.log('images: ' + imageCount);
console.log('bytes:  ' + Buffer.byteLength(xml));
console.log('text:   ' + Buffer.byteLength(text));
if (problems.length) {
  console.log('');
  problems.forEach(p => console.log('  PROBLEM: ' + p));
  process.exitCode = 1;
} else {
  console.log('self-check: clean');
}
