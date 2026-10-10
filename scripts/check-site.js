/**
 * Pre-deploy checks for the static site. No dependencies, so CI can run it
 * without installing anything.
 *
 *   node scripts/check-site.js
 *
 * Fails (exit code 1) on:
 *   - a root-relative href/src that points at no file
 *   - a sitemap entry with no page, or an indexable page missing from it
 *   - a noindex page listed in the sitemap
 *   - an indexable page without a title, description or canonical, or whose
 *     canonical points somewhere else
 *   - an og:image on this domain that doesn't exist
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ORIGIN = 'https://elevven11studio.github.io';
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', 'scripts', 'promo', 'branding', '_site']);

const pages = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full);
    } else if (name.endsWith('.html')) {
      pages.push(full);
    }
  }
})(ROOT);

const urlOf = (file) => '/' + path.relative(ROOT, file).split(path.sep).join('/').replace(/index\.html$/, '');
const exists = (rooted) => {
  const f = path.join(ROOT, decodeURI(rooted));
  return fs.existsSync(rooted.endsWith('/') ? path.join(f, 'index.html') : f) || fs.existsSync(path.join(f, 'index.html'));
};

const sitemap = (fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').match(/<loc>[^<]+/g) || [])
  .map((loc) => loc.slice(5).replace(ORIGIN, ''));
const errors = [];
const urls = pages.map(urlOf);

for (const file of pages) {
  const url = urlOf(file);
  const html = fs.readFileSync(file, 'utf8');
  // Search Console verification file and the 404 page are not real pages.
  const special = url === '/404.html' || /^\/google[0-9a-f]+\.html$/.test(url);
  const noindex = /<meta[^>]+name="robots"[^>]+noindex/.test(html);

  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    if (!exists(m[1])) errors.push(`${url}: broken link ${m[1]}`);
  }

  const og = (html.match(/property="og:image"\s+content="([^"]*)/) || [])[1];
  if (og && og.startsWith(ORIGIN) && !exists(og.slice(ORIGIN.length))) errors.push(`${url}: og:image missing ${og}`);

  if (special) continue;
  if (noindex) {
    if (sitemap.includes(url)) errors.push(`${url}: noindex page is in sitemap.xml`);
    continue;
  }
  if (!sitemap.includes(url)) errors.push(`${url}: missing from sitemap.xml`);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${url}: no <title>`);
  if (!/name="description"\s+content="[^"]+"/.test(html)) errors.push(`${url}: no meta description`);
  const canonical = (html.match(/rel="canonical"\s+href="([^"]*)/) || [])[1];
  if (!canonical) errors.push(`${url}: no canonical`);
  else if (canonical !== ORIGIN + url) errors.push(`${url}: canonical is ${canonical}`);
}

for (const url of sitemap) {
  if (!urls.includes(url)) errors.push(`sitemap.xml: ${url} has no page`);
}

if (errors.length) {
  console.log(errors.join('\n'));
  console.log(`\n${errors.length} problem(s) across ${pages.length} pages`);
  process.exitCode = 1;
} else {
  console.log(`${pages.length} pages OK`);
}
