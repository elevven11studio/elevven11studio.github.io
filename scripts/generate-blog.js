/**
 * Builds the blog from Markdown in scripts/blog-src/posts/.
 *
 *   cd scripts && npm run blog
 *
 * Writes blog/index.html, blog/<slug>/index.html and blog/feed.xml. Output is
 * committed like every other page, so crawlers get full HTML. Header, footer,
 * fonts, theme and analytics are copied from pricing/index.html, the same way
 * generate-tools.js does it.
 *
 * A post is a .md file whose name is its slug:
 *
 *   ---
 *   title: How Much Does a Website Cost in Nigeria?
 *   description: One or two sentences, under 160 characters.
 *   date: 2026-11-23
 *   product: websites            (a key in blog-src/products.js)
 *   ---
 *   Markdown body...
 *
 * Posts dated in the future are skipped, so a post can be written ahead and
 * appears on the first build on or after its date.
 *
 * Supported Markdown: ## and ### headings, paragraphs, - and 1. lists,
 * > quotes, ``` code blocks ```, **bold**, *italic*, `code`, [links](/path/)
 * and | tables |.
 */
const fs = require('fs');
const path = require('path');
const products = require('./blog-src/products');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://elevven11studio.github.io';
const SRC = path.join(__dirname, 'blog-src', 'posts');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---- shell copied from an existing page ----
const shell = read('pricing/index.html');
const grab = (re, what) => {
  const m = shell.match(re);
  if (!m) throw new Error('pricing/index.html: could not find ' + what);
  return m[0];
};
const HEADER = grab(/<header>[\s\S]*?<\/header>/, 'header');
const FOOTER = grab(/<footer>[\s\S]*?<\/footer>/, 'footer');
const THEME = grab(/<script>\s*\/\/ Applied before paint[\s\S]*?<\/script>/, 'theme script');
const ANALYTICS = grab(/<!-- Global site tag[\s\S]*?<\/script>/, 'analytics block');
const FONTS = grab(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com" \/>[\s\S]*?<noscript>[\s\S]*?<\/noscript>/, 'font links')
  .replace(/\s*<link rel="preconnect" href="https:\/\/(ipwho\.is|open\.er-api\.com)" \/>/g, '');

// ---- markdown ----
function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
  s = esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, href) => {
      const ext = /^https?:\/\//.test(href) && !href.startsWith(BASE);
      return `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
    });
  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => '<code>' + esc(codes[i]) + '</code>');
}

function markdown(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const headings = [];
  let i = 0;
  const used = {};
  const slugify = (t) => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push(`<pre class="b-code" tabindex="0"><code>${esc(buf.join('\n'))}</code></pre>`);
    } else if ((m = line.match(/^(#{2,3})\s+(.*)$/))) {
      const level = m[1].length;
      const html = inline(m[2]);
      let id = slugify(m[2]);
      used[id] = (used[id] || 0) + 1;
      if (used[id] > 1) id += '-' + used[id];
      if (level === 2) headings.push({ id, text: m[2] });
      out.push(`<h${level} id="${id}">${html}</h${level}>`);
      i++;
    } else if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && (ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/).test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, '')));
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${t}</li>`).join('')}</${tag}>`);
    } else if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`);
    } else if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      out.push(`<div class="b-table" tabindex="0" role="region" aria-label="Table"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    } else {
      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|>|\||\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) { buf.push(lines[i].trim()); i++; }
      out.push(`<p>${inline(buf.join(' '))}</p>`);
    }
  }
  return { html: out.join('\n\t\t\t\t'), headings };
}

// ---- load posts ----
const today = new Date().toISOString().slice(0, 10);
const all = fs.readdirSync(SRC).filter((f) => f.endsWith('.md')).map((f) => {
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8').replace(/^﻿/, '');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error(f + ': missing front matter');
  const meta = {};
  for (const l of m[1].split(/\r?\n/)) {
    const kv = l.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  const slug = f.replace(/\.md$/, '');
  const body = m[2];
  const words = body.split(/\s+/).filter(Boolean).length;
  return { ...meta, slug, body, words, minutes: Math.max(1, Math.round(words / 220)), path: '/blog/' + slug + '/', file: f };
});
const posts = all.filter((p) => p.date <= today).sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
const skipped = all.length - posts.length;

const fmtDate = (d) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const ld = (obj) => `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n\t</script>`;
const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: BASE + p }))
});

function head({ title, description, url, og, alt, type = 'website', ld: blocks, extra = '' }) {
  const OG_IMAGE = BASE + '/branding/og/' + og + '.png';
  const OG_SQUARE = BASE + '/branding/og/' + og + '-square.png';
  return `<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>${esc(title)}</title>
	<meta name="description" content="${esc(description)}" />
	<link rel="canonical" href="${url}" />
	<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
	<link rel="alternate" type="application/rss+xml" title="Elevven11 Blog" href="${BASE}/blog/feed.xml" />
	<meta name="theme-color" content="#0b0a10" />

	<meta property="og:type" content="${type}" />
	<meta property="og:site_name" content="Elevven11 Studio" />
	<meta property="og:locale" content="en_NG" />
	<meta property="og:title" content="${esc(title)}" />
	<meta property="og:description" content="${esc(description)}" />
	<meta property="og:url" content="${url}" />
	<meta property="og:image" content="${OG_IMAGE}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="${esc(alt)}" />
	<meta property="og:image" content="${OG_SQUARE}" />
	<meta property="og:image:width" content="1080" />
	<meta property="og:image:height" content="1080" />
	<meta property="og:image:alt" content="${esc(alt)}" />${extra}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="${esc(title)}" />
	<meta name="twitter:description" content="${esc(description)}" />
	<meta name="twitter:image" content="${OG_IMAGE}" />
	<meta name="twitter:image:alt" content="${esc(alt)}" />

	${FONTS}
	<link rel="stylesheet" type="text/css" href="/assets/style.css" />
	<link rel="stylesheet" type="text/css" href="/tools/assets/tools.css" />
	<link rel="stylesheet" type="text/css" href="/blog/assets/blog.css" />
	${blocks.map(ld).join('\n\t')}
	${THEME}
</head>`;
}

const card = (p, level = 'h3') => {
  const pr = products[p.product];
  return `<a class="t-card b-card" href="${p.path}" data-cat="${pr.cat.toLowerCase()}" data-search="${esc((p.title + ' ' + p.description + ' ' + pr.name + ' ' + pr.cat).toLowerCase())}">
				<span class="t-cat">${esc(pr.cat)}</span>
				<${level}>${esc(p.title)}</${level}>
				<p>${esc(p.description)}</p>
				<span class="b-meta">${p.minutes} min read</span>
			</a>`;
};

const page = (bodyClass, headHtml, main, scripts = '') => `<!DOCTYPE html>
<html lang="en">

${headHtml}

<body class="${bodyClass}">

	<a class="skip-link" href="#main">Skip to main content</a>

	${HEADER}

	<main id="main">
${main}
	</main>

	${FOOTER}

	<script src="/assets/shell.js" defer></script>${scripts}

	${ANALYTICS}
</body>

</html>
`;

// ---- a post ----
function postPage(p) {
  const pr = products[p.product];
  const url = BASE + p.path;
  const { html } = markdown(p.body);
  const related = posts.filter((o) => o !== p && products[o.product].cat === pr.cat).slice(0, 3);
  for (const o of posts) { if (related.length >= 3) break; if (o !== p && !related.includes(o)) related.push(o); }

  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url + '#post',
    headline: p.title,
    description: p.description,
    url,
    mainEntityOfPage: url,
    datePublished: p.date,
    dateModified: p.updated || p.date,
    image: BASE + '/branding/og/' + pr.og + '.png',
    wordCount: p.words,
    inLanguage: 'en',
    author: { '@id': BASE + '/#organization' },
    publisher: { '@id': BASE + '/#organization' },
    isPartOf: { '@id': BASE + '/blog/#blog' }
  };

  const main = `
	<article>
	<section class="tool-head b-head">
		<div class="container">
			<div class="tool-head-text">
				<nav class="crumbs" aria-label="Breadcrumb"><ol>
					<li><a href="/">Home</a></li>
					<li><a href="/blog/">Blog</a></li>
					<li aria-current="page">${esc(pr.name)}</li>
				</ol></nav>
				<h1>${esc(p.title)}</h1>
				<p class="b-byline"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${p.minutes} min read</p>
			</div>
		</div>
	</section>

	<section class="b-body">
		<div class="container">
			<div class="t-prose b-prose">
				${html}
			</div>
			${shareBar(p, url)}
		</div>
	</section>
	</article>

	<section class="t-below">
		<div class="container">
			<div class="t-cta">
				<h2>${esc(pr.cta.h)}</h2>
				<a href="${pr.cta.a}" class="btn btn-primary">${esc(pr.cta.b)}</a>
			</div>
		</div>
	</section>

	<section class="t-below">
		<div class="container">
			<div class="t-section-head"><h2>Keep reading</h2></div>
			<div class="t-related">
			${related.map((o) => card(o)).join('\n\t\t\t')}
			</div>
		</div>
	</section>
`;
  return page('tools-page blog-page', head({
    title: (p.title + ' | Elevven11').length <= 65 ? p.title + ' | Elevven11' : p.title,
    description: p.description,
    url,
    og: pr.og,
    alt: p.title,
    type: 'article',
    extra: `\n\t<meta property="article:published_time" content="${p.date}" />\n\t<link rel="alternate" type="text/markdown" href="${BASE}/blog/${p.slug}.md" />`,
    ld: [article, breadcrumbLd([['Home', '/'], ['Blog', '/blog/'], [p.title, p.path]])]
  }), main, '\n\t<script src="/blog/assets/share.js" defer></script>\n\t<script src="/blog/assets/reader.js" defer></script>');
}

// ---- share row ----
// Plain links, so sharing works with JavaScript off. share.js adds copy link
// and the device's own share sheet (for any other app) where supported.
const SHARE_ICONS = {
  whatsapp: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/><path d="M9.2 8.3c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2.1.4 0 .5l-.5.6c-.1.2-.2.3 0 .5.3.6 1.3 1.7 2.4 2.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.3 0 .4-.1 1-.6 1.4-.6.5-1.6.7-3.2 0-1.9-.9-3.3-2.7-3.6-3.3-.4-.6-.8-1.5-.6-2.4.1-.5.3-.9.3-1.3z"/>',
  x: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
  facebook: '<path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-6.93h-2.4v-2.87h2.4v-2.19c0-2.39 1.44-3.72 3.62-3.72 1.05 0 2.15.19 2.15.19v2.36h-1.21c-1.19 0-1.56.74-1.56 1.5v1.86h2.66l-.43 2.87h-2.23v6.93c4.56-.93 8-4.96 8-9.8z"/>',
  linkedin: '<path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 12.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-11h2.88v1.5h.04c.4-.76 1.38-1.56 2.84-1.56 3.03 0 3.6 2 3.6 4.59v6.47z"/>',
  telegram: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21.5 3.5 2.8 10.7c-.8.3-.8 1.4 0 1.7l4.7 1.6 1.8 5.6c.2.7 1.1.9 1.6.4l2.6-2.5 4.9 3.6c.6.4 1.4.1 1.6-.6l3-15.6c.2-.9-.7-1.6-1.5-1.4zM7.5 14l10-7.5-7.7 9"/>',
  email: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 5h18v14H3zM3 6l9 7 9-7"/>',
  copy: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  more: '<circle cx="6" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="6" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="18" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>'
};
const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${SHARE_ICONS[k]}</svg>`;

function shareBar(p, url) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(p.title);
  const links = [
    ['whatsapp', 'WhatsApp', `https://wa.me/?text=${encodeURIComponent(p.title + ' ' + url)}`],
    ['x', 'X', `https://x.com/intent/post?text=${t}&url=${u}`],
    ['facebook', 'Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ['linkedin', 'LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
    ['telegram', 'Telegram', `https://t.me/share/url?url=${u}&text=${t}`],
    ['email', 'Email', `mailto:?subject=${t}&body=${u}`]
  ];
  return `<div class="b-share" data-url="${url}" data-title="${esc(p.title)}">
				<h2 class="b-share-label">Share this post</h2>
				<div class="b-share-row">
					${links.map(([k, name, href]) => `<a class="b-share-btn" href="${esc(href)}"${k === 'email' ? '' : ' target="_blank" rel="noopener"'} data-share="${k}" aria-label="Share on ${name}" title="${name}">${svg(k)}</a>`).join('\n\t\t\t\t\t')}
					<button class="b-share-btn" type="button" data-share="copy" aria-label="Copy link" title="Copy link">${svg('copy')}</button>
					<button class="b-share-btn" type="button" data-share="native" aria-label="More sharing options" title="More" hidden>${svg('more')}</button>
				</div>
				<p class="b-share-status" role="status" aria-live="polite"></p>
			</div>`;
}

// ---- index ----
function indexPage() {
  const url = BASE + '/blog/';
  const title = 'Blog | Elevven11 Studio';
  const description = 'Guides on websites, online stores, shop and office software, browser safety and business maths, from Elevven11 Studio.';
  const cats = [...new Set(posts.map((p) => products[p.product].cat))].sort();
  const count = (c) => posts.filter((p) => products[p.product].cat === c).length;

  const blog = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': url + '#blog',
    name: 'Elevven11 Blog',
    url,
    description,
    publisher: { '@id': BASE + '/#organization' },
    isPartOf: { '@id': BASE + '/#website' },
    blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: BASE + p.path, datePublished: p.date }))
  };

  const main = `
	<section class="tools-hero">
		<div class="container">
			<nav class="crumbs" aria-label="Breadcrumb"><ol>
				<li><a href="/">Home</a></li>
				<li aria-current="page">Blog</li>
			</ol></nav>
			<h1>The Elevven11 <span class="u-gold">Blog</span></h1>
			<p>Practical guides for running a business online.</p>
			<div class="t-search">
				<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
				<label for="post-search" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Search posts</label>
				<input class="form-input" id="post-search" type="search" placeholder="Search posts" autocomplete="off" />
			</div>
			<div class="t-chips" role="group" aria-label="Filter by topic">
				<button class="t-chip" type="button" data-cat="all" aria-pressed="true">All<span>${posts.length}</span></button>
				${cats.map((c) => `<button class="t-chip" type="button" data-cat="${c.toLowerCase()}" aria-pressed="false">${esc(c)}<span>${count(c)}</span></button>`).join('\n\t\t\t\t')}
			</div>
		</div>
	</section>

	<section>
		<div class="container">
			<div class="t-cards" id="post-grid">
			${posts.map((p) => card(p, 'h2')).join('\n\t\t\t')}
			</div>
			<div class="t-empty" id="post-empty" hidden>
				<h2>No posts found</h2>
				<button class="t-btn" type="button" id="post-reset">Show all posts</button>
			</div>
			<p id="post-live" role="status" aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"></p>
		</div>
	</section>
`;
  return page('tools-page blog-page', head({
    title, description, url, og: 'home', alt: 'Elevven11 Blog',
    ld: [blog, breadcrumbLd([['Home', '/'], ['Blog', '/blog/']])]
  }), main, '\n\t<script src="/blog/assets/blog.js" defer></script>\n\t<script src="/blog/assets/reader.js" defer></script>');
}

// ---- RSS ----
function feed() {
  const x = (s) => esc(s).replace(/'/g, '&apos;');
  const items = posts.map((p) => `    <item>
      <title>${x(p.title)}</title>
      <link>${BASE}${p.path}</link>
      <guid isPermaLink="true">${BASE}${p.path}</guid>
      <pubDate>${new Date(p.date + 'T08:00:00Z').toUTCString()}</pubDate>
      <description>${x(p.description)}</description>
    </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Elevven11 Blog</title>
    <link>${BASE}/blog/</link>
    <atom:link href="${BASE}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>Practical guides for running a business online.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
}

// ---- write ----
const write = (rel, html) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, 'utf8');
};

// Remove pages for posts that were deleted or renamed, so no orphan stays live.
const keep = new Set(posts.map((p) => p.slug).concat(['assets']));
for (const d of fs.readdirSync(path.join(ROOT, 'blog'), { withFileTypes: true })) {
  if (d.isDirectory() && !keep.has(d.name) && fs.existsSync(path.join(ROOT, 'blog', d.name, 'index.html'))) {
    fs.rmSync(path.join(ROOT, 'blog', d.name), { recursive: true });
    console.log('removed blog/' + d.name + '/');
  }
  if (d.isFile() && d.name.endsWith('.md') && d.name !== 'index.md' && !keep.has(d.name.slice(0, -3))) {
    fs.rmSync(path.join(ROOT, 'blog', d.name));
    console.log('removed blog/' + d.name);
  }
}

// ---- markdown copies ----
// Each post is also published as plain Markdown at /blog/<slug>.md, with site
// links made absolute so the file still works when copied elsewhere.
const absLinks = (md) => md.replace(/\]\((\/[^)\s]*)\)/g, (m, href) => '](' + BASE + href + ')');
function postMarkdown(p) {
  const url = BASE + p.path;
  return `---
title: ${JSON.stringify(p.title)}
description: ${JSON.stringify(p.description)}
date: ${p.date}
url: ${url}
publisher: Elevven11 Studio
---

# ${p.title}

${p.description}

${absLinks(p.body.trim())}

---

Published ${fmtDate(p.date)} by Elevven11 Studio. Read online: ${url}
`;
}
function indexMarkdown() {
  const cats = [...new Set(posts.map((p) => products[p.product].cat))].sort();
  return `# Elevven11 Blog

Practical guides for running a business online. ${BASE}/blog/

${cats.map((c) => `## ${c}

${posts.filter((p) => products[p.product].cat === c).map((p) => `- [${p.title}](${BASE}/blog/${p.slug}.md): ${p.description}`).join('\n')}`).join('\n\n')}
`;
}

write('blog/index.html', indexPage());
write('blog/index.md', indexMarkdown());
write('blog/feed.xml', feed());
for (const p of posts) {
  write('blog/' + p.slug + '/index.html', postPage(p));
  write('blog/' + p.slug + '.md', postMarkdown(p));
}

// ---- checks ----
const problems = [];
const known = new Set(fs.readFileSync(path.join(ROOT, 'sitemap.txt'), 'utf8').split(/\r?\n/).filter(Boolean).map((u) => u.replace(BASE, '')));
for (const p of all) {
  const tag = p.file + ': ';
  for (const k of ['title', 'description', 'date', 'product']) if (!p[k]) problems.push(tag + 'missing ' + k);
  if (!/^[a-z0-9-]+$/.test(p.slug)) problems.push(tag + 'file name must be lowercase-with-dashes');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date || '')) problems.push(tag + 'date must be YYYY-MM-DD');
  if (!products[p.product]) { problems.push(tag + 'unknown product ' + p.product); continue; }
  if (!fs.existsSync(path.join(ROOT, 'branding/og', products[p.product].og + '.png'))) problems.push(tag + 'missing og image ' + products[p.product].og);
  if (p.title.length > 65) problems.push(tag + 'title is ' + p.title.length + ' characters, keep it to 65');
  if (p.description.length > 160) problems.push(tag + 'description is ' + p.description.length + ' characters');
  if (/—/.test(p.body + p.title + p.description)) problems.push(tag + 'contains an em dash');
  if (/^#\s/m.test(p.body)) problems.push(tag + 'use ## for headings; the title is the h1');
  for (const [, href] of p.body.matchAll(/\]\((\/[^)\s#]*)/g)) {
    const clean = href.endsWith('/') ? href : href + '/';
    if (!known.has(clean) && !clean.startsWith('/blog/') && !fs.existsSync(path.join(ROOT, clean, 'index.html'))) problems.push(tag + 'broken link ' + href);
    if (clean.startsWith('/blog/') && clean !== '/blog/' && !all.some((o) => o.path === clean)) problems.push(tag + 'link to unknown post ' + href);
  }
}
for (const p of posts) {
  const html = read('blog/' + p.slug + '/index.html');
  if ((html.match(/<h1[ >]/g) || []).length !== 1) problems.push(p.slug + ': needs exactly one h1');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) problems.push(p.slug + ': duplicate ids ' + [...new Set(dup)].join(', '));
}

console.log('posts: ' + posts.length + ' published' + (skipped ? ', ' + skipped + ' scheduled' : '') + ' + index + feed');
if (problems.length) {
  problems.forEach((p) => console.log('  PROBLEM: ' + p));
  process.exitCode = 1;
} else console.log('self-check: clean');


