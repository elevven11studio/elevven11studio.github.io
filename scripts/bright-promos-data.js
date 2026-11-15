/**
 * Copy for the bright promos (generate-bright-promos.js), one entry per
 * subject. `head` is one or two lines, each [dark part, green part].
 * `word` is the short word on the tilted tile: four characters at most.
 * Prices and counts are written out here, so update them when they change.
 */
module.exports = [
  {
    slug: 'main', path: '/', word: 'WEB', eyebrow: 'Websites · Small business',
    head: [['A website for', ''], ['', 'your business']],
    text: 'One link that shows your photos, prices, location and hours. Built for you and ready to share.',
    chips: ['Pay once', 'Mobile friendly', 'Free hosting', 'Free updates'],
    qrTitle: 'Need a website?', qrText: 'Packages start at NGN 50,000. Scan to see them.'
  },
  {
    slug: 'examples', path: '/examples/', word: '54', eyebrow: 'Live demos',
    head: [['See it ', ''], ['', 'before you buy']],
    text: 'Every demo is a live site, not a screenshot. Open them on your phone before you decide.',
    chips: ['54 demos', '18 industries', '3 styles each', 'Rebuilt for you'],
    qrTitle: 'Found one you like?', qrText: 'We rebuild it with your name and details.'
  },
  {
    slug: 'online-stores', path: '/examples/', word: 'SHOP', eyebrow: 'Online stores',
    head: [['Orders land', ''], ['', 'on WhatsApp']],
    text: 'Customers browse your products, fill a cart and send the order straight to you. No more one chat at a time.',
    chips: ['Categories', 'Delivery zones', 'Pickup', 'No platform fee'],
    qrTitle: 'Still selling in DMs?', qrText: 'Try one of the three live stores.'
  },
  {
    slug: 'pricing', path: '/pricing/', word: 'NGN', eyebrow: 'Clear pricing',
    head: [['Pay once,', ''], ['', 'own the site']],
    text: 'Starter is NGN 50,000. Plus is NGN 80,000. Custom starts at NGN 120,000 and is quoted first.',
    chips: ['One-time payment', 'No monthly fee', 'Quoted first', 'No surprises'],
    qrTitle: 'What is included?', qrText: 'See every package and what it covers.'
  },
  {
    slug: 'process', path: '/how-it-works/', word: '123', eyebrow: 'How it works',
    head: [['From message', ''], ['', 'to live site']],
    text: 'Pick a package and send your details and content. Ask for revisions, then we publish it.',
    chips: ['Choose a package', 'We build it', 'You review', 'Go live'],
    qrTitle: 'Ready when you are', qrText: 'Tell us what you need and we take it from there.'
  },
  {
    slug: 'hosting', path: '/faq/', word: 'WWW', eyebrow: 'Hosting · Domains',
    head: [['No monthly', ''], ['', 'hosting fee']],
    text: 'Your site lives on free GitHub Pages hosting. You can connect your own domain too.',
    chips: ['Free hosting', 'Own domain optional', 'Setup help'],
    qrTitle: 'Unsure about hosting?', qrText: 'Read the full answer on our FAQ.'
  },
  {
    slug: 'updates', path: '/faq/', word: 'NEW', eyebrow: 'After launch',
    head: [['Free updates', ''], ['', 'included']],
    text: 'Change text, swap photos, update your contact links. Every package has a free update period.',
    chips: ['Text changes', 'Photo swaps', 'Contact details', 'Bigger work quoted'],
    qrTitle: 'More questions?', qrText: 'Our FAQ answers the common ones.'
  },
  {
    slug: 'agents', theme: 'gold', path: '/agents/', word: 'EARN', eyebrow: 'Referral programme',
    head: [['Refer and', ''], ['', 'get paid']],
    text: 'Know someone who needs a website? Send your link. You earn once their payment clears.',
    chips: ['No tech skills', 'Your own code', 'We do the work', 'Apply in 2 minutes'],
    qrTitle: 'Become an agent', qrText: 'Apply by WhatsApp or Google Form.'
  },
  {
    slug: 'apps', path: '/app-development/', word: 'APP', eyebrow: 'Mobile apps · Flutter',
    head: [['One build,', ''], ['', 'both stores']],
    text: 'Need an app, not just a site? We build for Android and iPhone from one codebase.',
    chips: ['Android', 'iPhone', 'Quoted by scope', 'You own it'],
    qrTitle: 'Have an app idea?', qrText: 'We scope it and send you a quote.'
  },
  {
    slug: 'counterbook', path: '/counterbook/', word: 'POS', eyebrow: 'Counterbook · Free',
    head: [['Run your shop', ''], ['', 'from one app']],
    text: 'A free point of sale app for Windows. Sales, stock, customers and credit on your own device.',
    chips: ['Sales', 'Stock', 'Works offline', 'No account'],
    qrTitle: 'Download it free', qrText: 'Get the Windows installer. Android is coming soon.'
  },
  {
    slug: 'worknest', path: '/worknest/', word: 'SOON', eyebrow: 'WorkNest · Coming soon',
    head: [['Every file,', ''], ['', 'one office app']],
    text: 'Documents, paper archive, staff, payroll and tasks, kept on your own computers. No cloud account needed.',
    chips: ['Paper archive', 'Payroll', 'Encrypted', 'Office Wi-Fi'],
    qrTitle: 'Paper-heavy office?', qrText: 'Hear when WorkNest launches on Windows.'
  },
  {
    slug: 'syncplay', path: '/syncplay/', word: 'PLAY', eyebrow: 'SyncPlay',
    head: [['Watch together,', ''], ['', 'in sync']],
    text: 'Play one video on every screen at the same moment, over your own Wi-Fi.',
    chips: ['Every screen', 'Your Wi-Fi', 'No account', 'No uploads'],
    qrTitle: 'Watching with others?', qrText: 'Open SyncPlay and start a room.'
  },
  {
    slug: 'tools', path: '/tools/', word: '10', eyebrow: 'Free tools',
    head: [['Ten tools,', ''], ['', 'no sign-up']],
    text: 'Calculators and utilities for business and everyday work. They run in your browser and nothing is uploaded.',
    chips: ['Profit and markup', 'Invoices', 'QR codes', 'VAT'],
    qrTitle: 'Try them free', qrText: 'Work out your numbers before you quote.'
  },
  {
    slug: 'extensions', path: '/extensions/', word: 'FREE', eyebrow: 'Chrome extensions',
    head: [['Small tools,', ''], ['', 'fully private']],
    text: 'Four extensions that run in your browser. No account, no server, nothing uploaded.',
    chips: ['WebGuard', 'WebInspect', 'ShopInspect', 'SiteExtract'],
    qrTitle: 'Add them to Chrome', qrText: 'All four are free.'
  },
  {
    slug: 'webguard', theme: 'sky', path: '/webguard/', word: 'SAFE', eyebrow: 'WebGuard · Chrome extension',
    head: [['Spot ', 'the fake']],
    text: 'Catch suspicious websites before you hand over sensitive information. The checks run on your own device.',
    chips: ['Phishing checks', 'Lookalike domains', 'Password warnings'],
    qrTitle: 'Add WebGuard', qrText: 'Free for Chrome, with no sign-up.'
  },
  {
    slug: 'webinspect', theme: 'violet', path: '/webinspect/', word: 'SCAN', eyebrow: 'WebInspect · Chrome extension',
    head: [['Understand', ''], ['', 'any website']],
    text: 'See what a site is built with, and how it does on speed and accessibility, in one report.',
    chips: ['Tech', 'SEO', 'Performance', 'Security'],
    qrTitle: 'Add WebInspect', qrText: 'One keypress. Free for Chrome.'
  },
  {
    slug: 'shopinspect', theme: 'teal', path: '/shopinspect/', word: 'BUY', eyebrow: 'ShopInspect · Chrome extension',
    head: [['Check before', ''], ['', 'you buy']],
    text: 'Any product listing, checked in your browser as you shop. No shopping history is kept.',
    chips: ['Price', 'Reviews', 'Seller', 'Private'],
    qrTitle: 'Add ShopInspect', qrText: 'Free for Chrome, with no sign-up.'
  },
  {
    slug: 'siteextract', theme: 'orange', path: '/siteextract/', word: 'ZIP', eyebrow: 'SiteExtract · Chrome extension',
    head: [['Any page,', ''], ['', 'one ZIP']],
    text: 'Turn a web page into a clean, editable starter project, built on your device.',
    chips: ['HTML and CSS', 'Images', 'Fonts', 'Design tokens'],
    qrTitle: 'Add SiteExtract', qrText: 'Free for Chrome, with no sign-up.'
  },
  {
    slug: 'support', path: '/support/', word: 'TIP', eyebrow: 'Support the studio',
    head: [['Chip in,', ''], ['', 'if you like']],
    text: 'Found the site or tools useful? Pay any amount you choose. It is entirely optional.',
    chips: ['NGN or USD', 'Card', 'Bank transfer', 'USSD'],
    qrTitle: 'Thank you', qrText: 'Secured by Paystack. No account needed.'
  },
  {
    slug: 'contact', path: '/contact/', word: 'HI', eyebrow: 'Questions welcome',
    head: [['Let us ', 'talk']],
    text: 'Ask about packages, apps or the referral programme before you commit.',
    chips: ['WhatsApp', 'Email', 'Custom projects'],
    qrTitle: 'Ask us anything', qrText: 'Send a message in one minute.'
  }
];
