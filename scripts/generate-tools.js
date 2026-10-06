/**
 * Builds the static pages for Elevven11 Tools from scripts/tools-src/.
 *
 *   cd scripts && npm run tools
 *
 * Writes tools/index.html and tools/<id>/index.html. The output is committed,
 * like every other page, so crawlers get full HTML with no client rendering.
 * The header, footer and analytics block are copied from pricing/index.html,
 * so a change to the site shell reaches the tool pages on the next run.
 */
const fs = require('fs');
const path = require('path');
const { BASE, tools, byId, categories, icon } = require('./tools-src/registry');
const { esc } = require('./tools-src/ui');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

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

if (!HEADER.includes('href="/tools/"')) throw new Error('nav has no Tools link yet; run the nav update first');

const OG_ALT = 'Elevven11 Tools, free calculators and utilities that run in your browser';

const CTA = {
  business: { h: 'Need a website for your business?', p: 'We build simple, mobile-friendly websites.', a: '/get-started/', b: 'Get Your Website' },
  developer: { h: 'Need a website or web tool built?', p: 'We build websites, web tools and mobile apps.', a: '/get-started/', b: 'Start a Project' },
  everyday: { h: 'Discover more free tools from Elevven11.', p: '', a: '/tools/', b: 'All Tools' }
};

const ld = (obj) => `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n\t</script>`;

function head({ title, description, url, ld: blocks, og = 'tools', alt = OG_ALT }) {
  const OG_IMAGE = BASE + '/branding/og/' + og + '.png';
  const OG_SQUARE = BASE + '/branding/og/' + og + '-square.png';
  const OG_ALT = alt;
  return `<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>${esc(title)}</title>
	<meta name="description" content="${esc(description)}" />
	<link rel="canonical" href="${url}" />
	<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
	<meta name="theme-color" content="#0b0a10" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Elevven11 Studio" />
	<meta property="og:locale" content="en_NG" />
	<meta property="og:title" content="${esc(title)}" />
	<meta property="og:description" content="${esc(description)}" />
	<meta property="og:url" content="${url}" />
	<meta property="og:image" content="${OG_IMAGE}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="${esc(OG_ALT)}" />
	<meta property="og:image" content="${OG_SQUARE}" />
	<meta property="og:image:width" content="1080" />
	<meta property="og:image:height" content="1080" />
	<meta property="og:image:alt" content="${esc(OG_ALT)}" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="${esc(title)}" />
	<meta name="twitter:description" content="${esc(description)}" />
	<meta name="twitter:image" content="${OG_IMAGE}" />
	<meta name="twitter:image:alt" content="${esc(OG_ALT)}" />

	${FONTS}
	<link rel="stylesheet" type="text/css" href="/assets/style.css" />
	<link rel="stylesheet" type="text/css" href="/tools/assets/tools.css" />
	${blocks.map(ld).join('\n\t')}
	${THEME}
</head>`;
}

const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({
    '@type': 'ListItem', position: i + 1, name, item: BASE + p
  }))
});

const card = (t, level = 'h3') => `<a class="t-card" href="${t.path}" data-cat="${t.category.toLowerCase()}" data-search="${esc((t.name + ' ' + t.short + ' ' + t.category + ' ' + (t.keywords || '')).toLowerCase())}">
				<span class="t-icon">${icon(t.icon)}</span>
				<${level}>${esc(t.name)}</${level}>
				<p>${esc(t.short)}</p>
				<span class="t-cat">${esc(t.category)}</span>
			</a>`;

// Optional extra section on a tool page: heading, paragraphs, bullet list.
const extraSection = (x) => `<h2>${esc(x.h)}</h2>${(x.p || []).map((p) => `
				<p>${esc(p)}</p>`).join('')}${x.list ? `
				<ul class="t-list">${x.list.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}`;

// ---- a tool page ----
function toolPage(t) {
  const url = BASE + t.path;
  const cta = CTA[t.cta];
  const libs = (t.libs || []).map((l) => `<script src="/tools/assets/${l}.js" defer></script>`).join('\n\t');
  const how = t.howItWorks;

  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': url + '#app',
    name: t.name,
    url,
    description: t.description,
    applicationCategory: t.appCategory,
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': BASE + '/#organization' }
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  };

  return `<!DOCTYPE html>
<html lang="en">

${head({
    title: t.title,
    description: t.description,
    url,
    og: 'tools-' + t.id,
    alt: t.name + ', a free tool by Elevven11 Studio',
    ld: [webApp, faq, breadcrumbLd([['Home', '/'], ['Tools', '/tools/'], [t.name, t.path]])]
  })}

<body class="tools-page" data-tool="${t.id}">

	<a class="skip-link" href="#main">Skip to main content</a>

	${HEADER}

	<main id="main">

	<section class="tool-head">
		<div class="container">
			<div class="tool-head-text">
				<nav class="crumbs" aria-label="Breadcrumb"><ol>
					<li><a href="/">Home</a></li>
					<li><a href="/tools/">Tools</a></li>
					<li aria-current="page">${esc(t.name)}</li>
				</ol></nav>
				<h1>${esc(t.name)}</h1>
				<p class="lead">${esc(t.lead)}</p>
			</div>
			<button class="t-btn t-btn-quiet t-no-print" type="button" data-share>${icon('share')}Share</button>
		</div>
	</section>

	<section id="tool">
		<div class="container">
			<noscript><p class="t-noscript">This tool needs JavaScript. Turn it on in your browser settings to use it.</p></noscript>
			${t.body()}
		</div>
	</section>

	<section class="t-below">
		<div class="container">
			<div class="t-prose">
				<h2>How to use this tool</h2>
				<ol>
					${t.howTo.map((s) => `<li>${esc(s)}</li>`).join('\n\t\t\t\t\t')}
				</ol>
				<h2>How it works</h2>
				${how.text.map((p) => `<p>${esc(p)}</p>`).join('\n\t\t\t\t')}${how.formula ? `
				<div class="t-formula" tabindex="0" role="region" aria-label="Formula">${esc(how.formula)}</div>` : ''}
				<p><strong>Example.</strong> ${esc(how.example)}</p>
				${(t.extra || []).map(extraSection).join('\n\t\t\t\t')}
				<h2>Frequently asked questions</h2>
				${t.faq.map((f) => `<details class="faq-item">
					<summary>${esc(f.q)}</summary>
					<p>${esc(f.a)}</p>
				</details>`).join('\n\t\t\t\t')}
			</div>
		</div>
	</section>

	<section class="t-below">
		<div class="container">
			<div class="t-section-head"><h2>Related tools</h2></div>
			<div class="t-related">
				${t.related.map((id) => card(byId[id])).join('\n\t\t\t\t')}
			</div>
		</div>
	</section>

	<section class="t-below">
		<div class="container">
			<div class="t-cta">
				<h2>${esc(cta.h)}</h2>${cta.p ? `
				<p>${esc(cta.p)}</p>` : ''}
				<a href="${cta.a}" class="btn btn-primary">${esc(cta.b)}</a>
			</div>
		</div>
	</section>

	</main>

	${FOOTER}

	<script src="/assets/main.js" defer></script>
	${libs}
	<script src="/tools/assets/shared.js" defer></script>
	<script src="/tools/assets/t/${t.id}.js" defer></script>

	${ANALYTICS}
</body>

</html>
`;
}

// ---- landing page ----
const EXT = [
  { k: 'webinspect', n: 'WebInspect', id: 'mpeiggffhbfefciphcnabijnmiajcljk', d: 'See the tech, SEO and security of any site.' },
  { k: 'webguard', n: 'WebGuard', id: 'hgckccgcmbclkjhdccnphbpbljlcdimd', d: 'Check a page for phishing before you type.' },
  { k: 'siteextract', n: 'SiteExtract', id: 'napeljfpcmnpphenaajmjpblidjnghfb', d: 'Save a web page as a starter project.' },
  { k: 'shopinspect', n: 'ShopInspect', id: 'ldkkldeeepomlnpccmmjglopfoghhbjj', d: 'Check a product listing before you buy.' }
];

function landingPage() {
  const url = BASE + '/tools/';
  const title = 'Free Business and Everyday Tools | Elevven11 Tools';
  const description = 'Free online calculators and utilities for business and everyday work: profit, markup, invoices, QR codes, JSON and more. No account, runs in your browser.';

  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url + '#collection',
    name: 'Elevven11 Tools',
    url,
    description,
    isPartOf: { '@id': BASE + '/#website' },
    publisher: { '@id': BASE + '/#organization' },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: tools.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: BASE + t.path, name: t.name }))
    }
  };

  return `<!DOCTYPE html>
<html lang="en">

${head({ title, description, url, ld: [collection, breadcrumbLd([['Home', '/'], ['Tools', '/tools/']])] })}

<body class="tools-page" data-tool="landing">

	<a class="skip-link" href="#main">Skip to main content</a>

	${HEADER}

	<main id="main">

	<section class="tools-hero">
		<div class="container">
			<h1>Free tools for <span class="u-gold">business</span> and everyday work</h1>
			<p>Calculate, create and convert in your browser. Nothing you enter is uploaded.</p>
			<div class="t-search">
				${icon('search')}
				<label class="sr-only" for="tool-search" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Search tools</label>
				<input class="form-input" id="tool-search" type="search" placeholder="Search tools" autocomplete="off" />
			</div>
			<div class="t-chips" role="group" aria-label="Filter by category">
				<button class="t-chip" type="button" data-cat="all" aria-pressed="true">All<span>${tools.length}</span></button>
				${categories.map((c) => `<button class="t-chip" type="button" data-cat="${c.slug}" aria-pressed="false">${esc(c.name)}<span>${c.count}</span></button>`).join('\n\t\t\t\t')}
			</div>
		</div>
	</section>

	<section>
		<div class="container">
			<div class="t-cards" id="tool-grid">
				${tools.map((t) => card(t, 'h2')).join('\n\t\t\t\t')}
			</div>
			<div class="t-empty" id="tool-empty" hidden>
				<h2>No tools found</h2>
				<p>Try another search.</p>
				<button class="t-btn" type="button" id="tool-reset">Show all tools</button>
			</div>
			<p class="t-live" id="tool-live" role="status" aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"></p>
		</div>
	</section>

	<section>
		<div class="container">
			<div class="t-section-head"><h2>Browser extensions</h2></div>
			<div class="t-ext">
				${EXT.map((e) => `<div class="t-card">
					<img src="/assets/${e.k}/icon-128.png" width="44" height="44" alt="" loading="lazy" />
					<h3>${e.n}</h3>
					<p>${esc(e.d)}</p>
					<div class="t-actions">
						<a class="t-btn t-btn-primary" href="https://chromewebstore.google.com/detail/${e.k}-by-elevven11/${e.id}" target="_blank" rel="noopener">Add to Chrome</a>
						<a class="t-btn" href="/${e.k}/">Learn more</a>
					</div>
				</div>`).join('\n\t\t\t\t')}
			</div>
		</div>
	</section>

	<section>
		<div class="container">
			<div class="t-cta">
				<h2>Need a website for your business?</h2>
				<p>We build simple, mobile-friendly websites.</p>
				<a href="/get-started/" class="btn btn-primary">Get Your Website</a>
			</div>
		</div>
	</section>

	</main>

	${FOOTER}

	<script src="/assets/main.js" defer></script>
	<script src="/tools/assets/shared.js" defer></script>
	<script src="/tools/assets/landing.js" defer></script>

	${ANALYTICS}
</body>

</html>
`;
}

// ---- write ----
const write = (rel, html) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, 'utf8');
};

write('tools/index.html', landingPage());

// Homepage strip: the block between the markers in index.html is rebuilt from
// the registry, so the list there cannot drift from the tools that exist.
function homeStrip() {
  const { HOME } = require('./tools-src/registry');
  const links = HOME.map((id) => `<li><a href="${byId[id].path}">${esc(byId[id].name)}</a></li>`).join('\n\t\t\t\t\t');
  return `<section id="tools">
		<div class="container">
			<div class="glass-card" style="text-align: center; padding: 3rem 2rem;">
				<h2 style="font-size: 1.85rem; margin-bottom: 1rem;">Free tools</h2>
				<p style="color: var(--text-secondary); max-width: 560px; margin: 0 auto 1.75rem; font-size: 1.05rem;">
					Calculators and utilities for business and everyday work. No account, nothing uploaded.
				</p>
				<ul class="tool-links">
					${links}
				</ul>
				<a href="/tools/" class="btn btn-primary">Explore all tools</a>
			</div>
		</div>
	</section>`;
}
{
  const file = path.join(ROOT, 'index.html');
  const home = fs.readFileSync(file, 'utf8');
  const nl = home.includes('\r\n') ? '\r\n' : '\n';
  const re = /(<!-- tools:start[^>]*-->)[\s\S]*?(<!-- tools:end -->)/;
  if (!re.test(home)) throw new Error('index.html: tools markers not found');
  const next = home.replace(re, (m, a, b) => a + nl + '\t' + homeStrip().replace(/\r?\n/g, nl) + nl + '\t' + b);
  if (next !== home) fs.writeFileSync(file, next, 'utf8');
}

for (const t of tools) {
  if (!fs.existsSync(path.join(ROOT, 'tools/assets/t', t.id + '.js'))) throw new Error('missing tools/assets/t/' + t.id + '.js');
  write('tools/' + t.id + '/index.html', toolPage(t));
}

// ---- checks ----
const problems = [];
for (const t of tools) {
  const html = read('tools/' + t.id + '/index.html');
  if (t.title.length > 65) problems.push(t.id + ': title is ' + t.title.length + ' characters');
  if (t.description.length > 160) problems.push(t.id + ': description is ' + t.description.length + ' characters');
  if (/—/.test(html)) problems.push(t.id + ': contains an em dash');
  if ((html.match(/<h1[ >]/g) || []).length !== 1) problems.push(t.id + ': needs exactly one h1');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) problems.push(t.id + ': duplicate ids ' + [...new Set(dup)].join(', '));
}
console.log('tools: ' + tools.length + ' pages + landing');
if (problems.length) {
  problems.forEach((p) => console.log('  PROBLEM: ' + p));
  process.exitCode = 1;
} else console.log('self-check: clean');
