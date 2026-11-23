/**
 * What each blog post can point back to. A post names one `product` in its
 * front matter; that picks the card image (an existing branding/og file), the
 * category chip on /blog/ and the closing call to action.
 */
module.exports = {
  websites:    { name: 'Websites',     cat: 'Websites',   path: '/pricing/',         og: 'pricing',         cta: { h: 'Ready for your own website?', a: '/get-started/', b: 'Get Your Website' } },
  store:       { name: 'Online Store', cat: 'Websites',   path: '/pricing/',         og: 'examples',        cta: { h: 'Sell from your own site.', a: '/get-started/', b: 'Start Your Store' } },
  hosting:     { name: 'Hosting',      cat: 'Websites',   path: '/how-it-works/',    og: 'how-it-works',    cta: { h: 'Ready for your own website?', a: '/get-started/', b: 'Get Your Website' } },
  apps:        { name: 'Mobile Apps',  cat: 'Apps',       path: '/app-development/', og: 'app-development', cta: { h: 'Have an app idea?', a: '/get-started/', b: 'Start a Project' } },
  business:    { name: 'Business',     cat: 'Business',   path: '/get-started/',     og: 'get-started',     cta: { h: 'Bring your business online.', a: '/get-started/', b: 'Get Your Website' } },
  agents:      { name: 'Agents',       cat: 'Business',   path: '/agents/',          og: 'agents',          cta: { h: 'Earn by referring clients.', a: '/agents/', b: 'Become an Agent' } },
  counterbook: { name: 'Counterbook',  cat: 'Apps',       path: '/counterbook/',     og: 'counterbook',     cta: { h: 'Run your shop with Counterbook.', a: '/counterbook/', b: 'Get Counterbook Free' } },
  worknest:    { name: 'WorkNest',     cat: 'Apps',       path: '/worknest/',        og: 'worknest',        cta: { h: 'Bring your office records together.', a: '/worknest/', b: 'See WorkNest' } },
  syncplay:    { name: 'SyncPlay',     cat: 'Apps',       path: '/syncplay/',        og: 'syncplay',        cta: { h: 'Watch together with SyncPlay.', a: '/syncplay/', b: 'See SyncPlay' } },
  extensions:  { name: 'Extensions',   cat: 'Extensions', path: '/extensions/',      og: 'extensions',      cta: { h: 'Free extensions, nothing uploaded.', a: '/extensions/', b: 'See All Extensions' } },
  webguard:    { name: 'WebGuard',     cat: 'Extensions', path: '/webguard/',        og: 'webguard',        cta: { h: 'Check pages before you type.', a: '/webguard/', b: 'Get WebGuard' } },
  webinspect:  { name: 'WebInspect',   cat: 'Extensions', path: '/webinspect/',      og: 'webinspect',      cta: { h: 'Inspect any site in one click.', a: '/webinspect/', b: 'Get WebInspect' } },
  shopinspect: { name: 'ShopInspect',  cat: 'Extensions', path: '/shopinspect/',     og: 'shopinspect',     cta: { h: 'Check a listing before you buy.', a: '/shopinspect/', b: 'Get ShopInspect' } },
  siteextract: { name: 'SiteExtract',  cat: 'Extensions', path: '/siteextract/',     og: 'siteextract',     cta: { h: 'Start from a page you like.', a: '/siteextract/', b: 'Get SiteExtract' } },
  tools:       { name: 'Tools',        cat: 'Tools',      path: '/tools/',           og: 'tools',           cta: { h: 'More free tools for your business.', a: '/tools/', b: 'All Tools' } }
};
