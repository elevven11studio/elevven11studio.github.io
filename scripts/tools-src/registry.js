/**
 * The one list of tools. It drives the landing page, search, category counts,
 * related-tool links, the sitemap and the homepage strip, so adding a tool
 * means adding a file beside this one and one line below.
 *
 *   cd scripts && npm run tools
 */
const BASE = 'https://elevven11studio.github.io';

// Order here is the order on the landing page.
const IDS = [
  'profit-calculator',
  'markup-calculator',
  'discount-calculator',
  'break-even-calculator',
  'vat-calculator',
  'invoice-generator',
  'percentage-calculator',
  'word-counter',
  'qr-code-generator',
  'json-formatter'
];

// Shown on the homepage strip.
const HOME = ['profit-calculator', 'invoice-generator', 'qr-code-generator', 'json-formatter', 'word-counter', 'percentage-calculator'];

const tools = IDS.map((id) => {
  const t = require('./' + id);
  if (t.id !== id) throw new Error(id + ': file id mismatch');
  return { ...t, path: '/tools/' + id + '/' };
});
const byId = Object.fromEntries(tools.map((t) => [t.id, t]));

tools.forEach((t) => t.related.forEach((r) => {
  if (!byId[r]) throw new Error(t.id + ': unknown related tool ' + r);
}));

const categories = [];
tools.forEach((t) => {
  let c = categories.find((x) => x.name === t.category);
  if (!c) categories.push(c = { name: t.category, slug: t.category.toLowerCase(), count: 0 });
  c.count++;
});

const ICONS = {
  calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1"/>',
  scale: '<path d="M12 3v18M5 21h14M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
  percent: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  text: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  braces: '<path d="M8 4c-2 0-3 1-3 3v3c0 1-1 2-2 2 1 0 2 1 2 2v3c0 2 1 3 3 3M16 4c2 0 3 1 3 3v3c0 1 1 2 2 2-1 0-2 1-2 2v3c0 2-1 3-3 3"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>'
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

module.exports = { BASE, tools, byId, categories, HOME, icon };
