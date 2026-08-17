/**
 * Regenerates the nine per-page social cards in branding/og/.
 *
 * Each main page gets its own 1200x630 og:image built from the site brand
 * tokens. Edit the PAGES map below when page copy or prices change, then:
 *
 *   cd tools && npm install && npm run og-cards
 *
 * The page <meta> tags already point at these filenames, so re-running is
 * enough - no HTML edits needed unless you add a page.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'branding/og');

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Pill widths are derived from the label length; Segoe UI at 24px averages
// ~12.2px per glyph, plus 52px of horizontal padding.
const pillW = t => Math.round(t.length * 12.2 + 52);

function card({ eyebrow, lines, sub, pills = [], accent = 'neon' }) {
  const grad = accent === 'gold'
    ? '<stop offset="0%" stop-color="#f0c866"/><stop offset="100%" stop-color="#c99a2e"/>'
    : '<stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#22c55e"/>';
  const eyebrowFill = accent === 'gold' ? '#f0c866' : '#86efac';

  let x = 80;
  const pillSvg = pills.map(p => {
    const w = pillW(p);
    const g = `<g><rect x="${x}" y="470" width="${w}" height="56" rx="28" fill="rgba(247,243,236,0.06)" stroke="rgba(247,243,236,0.16)"/>` +
              `<text x="${x + w / 2}" y="506" fill="#f7f3ec" font-size="24" text-anchor="middle">${esc(p)}</text></g>`;
    x += w + 20;
    return g;
  }).join('');

  const headline = lines.map((l, i) =>
    `<text x="80" y="${272 + i * 84}" fill="${i === lines.length - 1 ? 'url(#accent)' : '#f7f3ec'}" font-size="66" font-weight="700">${esc(l)}</text>`
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">${grad}</linearGradient>
    <radialGradient id="glow1" cx="8%" cy="12%" r="60%">
      <stop offset="0%" stop-color="${eyebrowFill}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${eyebrowFill}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="95%" cy="95%" r="60%">
      <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0b0a10"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  <rect x="0" y="0" width="1200" height="6" fill="url(#accent)"/>
  <g font-family="Segoe UI, Arial, sans-serif">
    <text x="80" y="108" fill="#f7f3ec" font-size="28" font-weight="700" letter-spacing="5">ELEVVEN11 STUDIO</text>
    <text x="80" y="168" fill="${eyebrowFill}" font-size="22" font-weight="600" letter-spacing="3">${esc(eyebrow)}</text>
    ${headline}
    <text x="80" y="${272 + lines.length * 84 + 6}" fill="#a79f95" font-size="28">${esc(sub)}</text>
    ${pillSvg}
    <text x="80" y="588" fill="#7a7268" font-size="22">elevven11studio.github.io</text>
  </g>
</svg>`;
}

const PAGES = {
  'home': { page: 'index.html', alt: 'Elevven11 Studio - affordable website design in Nigeria',
    eyebrow: 'WEBSITE DESIGN IN NIGERIA', lines: ['Simple Websites.', 'No Monthly Hosting Fee.'],
    sub: 'Affordable sites for small businesses and freelancers.',
    pills: ['One-time pricing', 'Mobile friendly', 'Fast delivery'] },

  'pricing': { page: 'pricing/index.html', alt: 'Elevven11 Studio pricing - Starter, Plus and Custom packages',
    eyebrow: 'PRICING', lines: ['One-Time Pricing.', 'No Monthly Fees.'],
    sub: 'Every package includes a free update period.',
    pills: ['Starter \u20a650,000', 'Plus \u20a680,000', 'Custom \u20a6120,000+'] },

  'agents': { page: 'agents/index.html', alt: 'Become an Elevven11 Studio referral agent and earn commission',
    eyebrow: 'REFERRAL PROGRAMME', accent: 'gold', lines: ['Refer Someone.', 'Earn a Commission.'],
    sub: 'No website skills needed. Get paid when they buy.',
    pills: ['Starter \u20a610,000', 'Plus \u20a615,000'] },

  'examples': { page: 'examples/index.html', alt: 'Elevven11 Studio website template examples',
    eyebrow: 'TEMPLATE EXAMPLES', lines: ['14 Templates.', '42 Live Demos.'],
    sub: 'Restaurants, salons, churches, schools, and more.',
    pills: ['Mobile friendly', 'Ready to customise'] },

  'how-it-works': { page: 'how-it-works/index.html', alt: 'How Elevven11 Studio builds and delivers your website',
    eyebrow: 'HOW IT WORKS', lines: ['From Idea to', 'Live Website.'],
    sub: 'Five simple steps. We handle the technical parts.',
    pills: ['Tell us what you need', 'We build it', 'You go live'] },

  'get-started': { page: 'get-started/index.html', alt: 'Get your website started with Elevven11 Studio',
    eyebrow: 'GET STARTED', lines: ['Ready to Get', 'Your Website Online?'],
    sub: "Tell us what you need and we'll take it from there.",
    pills: ['From \u20a650,000', 'Fast delivery'] },

  'faq': { page: 'faq/index.html', alt: 'Frequently asked questions about Elevven11 Studio websites',
    eyebrow: 'FAQ', lines: ['Common Questions,', 'Answered.'],
    sub: 'Hosting, pricing, updates, domains, and delivery.',
    pills: ['No monthly hosting fee', 'Free update period'] },

  'contact': { page: 'contact/index.html', alt: 'Contact Elevven11 Studio about your website project',
    eyebrow: 'CONTACT', lines: ["Let's Talk About", 'Your Website.'],
    sub: 'Reach us on WhatsApp or by email. We reply quickly.',
    pills: ['WhatsApp', 'Email'] },

  'privacy': { page: 'privacy/index.html', alt: 'Elevven11 Studio privacy policy',
    eyebrow: 'PRIVACY', lines: ['Privacy Policy.'],
    sub: 'How Elevven11 Studio handles the information you share.' }
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [slug, cfg] of Object.entries(PAGES)) {
    const file = path.join(OUT, slug + '.png');
    await sharp(Buffer.from(card(cfg))).png({ compressionLevel: 9 }).toFile(file);
    console.log(slug.padEnd(14), (fs.statSync(file).size / 1024).toFixed(0) + 'K');
  }
})();
