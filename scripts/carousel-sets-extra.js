/**
 * Extra carousel sets, merged into SETS by generate-carousels.js. Kept in its
 * own file so the main script stays readable. Each set is five slides: a hook,
 * three that carry the point, and a closing slide with a QR code.
 */
const SITE = 'https://elevven11studio.github.io';
const NAIRA = 'NGN ';
const utm = (c) => 'utm_source=promo&utm_medium=carousel&utm_campaign=' + c;
const last = (c, p, caption) => ({ qr: SITE + p + '?' + utm('carousel-' + c), qrCaption: caption });

const EXT = (c, name, tag, a, b, p) => ({
  accent: 'neon', peek: false,
  slides: [
    { theme: 'dark', head: [name + '.', tag], sub: 'A free Chrome extension by Elevven11 Studio.', chips: ['Free', 'No account'] },
    { theme: 'light', head: a.head, sub: a.sub, chips: a.chips },
    { theme: 'dark', head: ['Runs in', 'your browser.'], sub: 'No server. Nothing is uploaded.', chips: ['On device', 'No telemetry'] },
    { theme: 'light', head: b.head, sub: b.sub, chips: b.chips },
    { theme: 'dark', head: ['Add it', 'to Chrome.'], sub: 'Free, with no sign-up.', ...last(c, p, 'Scan to open') },
  ],
});

const support = {
  support: {
    accent: 'gold', peek: false,
    slides: [
      { theme: 'dark', head: ['Found the site', 'or tools useful?'], sub: 'You can chip in. It is entirely optional.' },
      { theme: 'light', head: ['Pay what', 'you like.'], sub: 'Any amount you choose. It buys nothing.' },
      { theme: 'dark', head: ['NGN or USD.'], sub: 'Card, transfer or USSD, secured by Paystack.', chips: ['NGN', 'USD'] },
      { theme: 'light', head: ['No account', 'needed.'], sub: 'Your name and email, so Paystack can send a receipt.' },
      { theme: 'dark', head: ['Chip in.'], sub: 'Thank you for keeping the studio going.', ...last('support', '/support/', 'Scan to chip in') },
    ],
  },
};

// One set per industry group. Each middle slide shows that industry's three
// template styles, so the set doubles as a template catalogue.
const INDUSTRY_GROUPS = [
  ['beauty-fitness', 'Beauty, fitness and fashion', [
    ['barber', 'Barbers and salons.', 'Services, prices and a booking button.'],
    ['fitness', 'Trainers and coaches.', 'Coaching options and a free trial button.'],
    ['fashion', 'Fashion brands.', 'Show your collection to every visitor.'],
  ]],
  ['food-events', 'Food, events and delivery', [
    ['restaurant', 'Restaurants and caterers.', 'Popular dishes and a menu button.'],
    ['events', 'Event planners.', 'Show what you plan and how to start.'],
    ['logistics', 'Delivery and logistics.', 'Explain how it works and take pickups.'],
  ]],
  ['professional', 'Consultants, freelancers and agents', [
    ['consultant', 'Consultants.', 'Show your results and offer a free call.'],
    ['freelancer', 'Freelancers.', 'Your work and how to hire you.'],
    ['real-estate', 'Real estate agents.', 'Put your listings in one place.'],
  ]],
  ['creative-community', 'Photographers, portfolios and schools', [
    ['photographer', 'Photographers.', 'A gallery of your work.'],
    ['portfolio', 'Personal portfolios.', 'Your projects in one place.'],
    ['school', 'Tutorial centres.', 'Courses and how to enrol.'],
  ]],
  ['community-business', 'Churches and small businesses', [
    ['church', 'Churches and ministries.', 'Service times and a plan your visit button.'],
    ['small-business', 'Small businesses.', 'What you sell and how to reach you.'],
  ]],
];

const industries = {};
for (const [key, title, items] of INDUSTRY_GROUPS) {
  industries['industry-' + key] = {
    accent: 'neon', peek: true,
    slides: [
      { theme: 'dark', head: ['A website', 'for your', 'kind of business.'], sub: title + '.' },
      ...items.map(([slug, head, sub], i) => ({
        theme: i % 2 === 0 ? 'light' : 'dark', head: [head], sub, visual: 'grid', picks: [slug, slug + '-2', slug + '-3'],
      })),
      ...(items.length < 3 ? [{ theme: 'light', head: ['Three styles', 'each.'], sub: 'Pick the look that fits your brand.' }] : []),
      { theme: 'dark', head: ['See them', 'live.'], sub: 'Open every demo on your phone.', ...last('industry-' + key, '/examples/', 'Scan to browse') },
    ],
  };
}

// One five-slide set per tool, built from the tool registry.
const toolSets = {};
for (const t of require('./tools-src/registry').tools) {
  const steps = t.howTo.slice(0, 3);
  toolSets['tool-' + t.id] = {
    accent: 'neon', peek: false,
    slides: [
      { theme: 'dark', head: t.og.lines, sub: t.og.sub, chips: ['Free', 'No account'] },
      ...steps.map((step, i) => ({ theme: i % 2 === 0 ? 'light' : 'dark', head: ['Step ' + (i + 1) + '.'], sub: step.replace(/^Or (\w)/, (m, c) => c.toUpperCase()) })),
      { theme: 'dark', head: ['Try it free.'], sub: 'It runs in your browser. Nothing is uploaded.', ...last('tool-' + t.id, t.path, 'Scan to open') },
    ].slice(0, 5),
  };
}

module.exports = {
  examples: {
    accent: 'neon', peek: true,
    slides: [
      { theme: 'dark', head: ['Not sure what', 'your site could', 'look like?'], sub: 'Browse real examples before you decide.' },
      { theme: 'light', head: ['14 industries.', '3 styles each.'], sub: 'Barbers, churches, caterers, tutors and more.' },
      { theme: 'dark', head: ['Open them', 'on your phone.'], sub: 'Every demo is a live site, not a screenshot.' },
      { theme: 'light', head: ['42 live demos.'], sub: 'Pick the one closest to your business.', visual: 'grid' },
      { theme: 'dark', head: ['Found one', 'you like?'], sub: 'We rebuild it with your name and details.', ...last('examples', '/examples/', 'Scan to browse') },
    ],
  },

  hosting: {
    accent: 'neon', peek: true,
    slides: [
      { theme: 'dark', head: ['Pay for the', 'website once.'], sub: 'No monthly hosting fee on our website packages.' },
      { theme: 'light', head: ['Free hosting', 'included.'], sub: 'Your site lives on free GitHub Pages hosting.' },
      { theme: 'dark', head: ['Want your', 'own domain?'], sub: 'Connect www.yourbusiness.com if you like.' },
      { theme: 'light', head: ['The domain', 'is separate.'], sub: 'Registration is paid to the registrar. We can help set it up.' },
      { theme: 'dark', head: ['Still unsure', 'about hosting?'], sub: 'Read the full answer on our FAQ.', ...last('hosting', '/faq/', 'Scan to read') },
    ],
  },

  updates: {
    accent: 'neon', peek: true,
    slides: [
      { theme: 'dark', head: ['What happens', 'after your site', 'goes live?'], sub: 'You are not left on your own.' },
      { theme: 'light', head: ['Free updates', 'are included.'], sub: 'Every package has a free update period.' },
      { theme: 'dark', head: ['Change text.', 'Swap photos.'], sub: 'Update your phone, WhatsApp and social links.' },
      { theme: 'light', head: ['Bigger changes', 'are quoted.'], sub: 'New pages and features are scoped first.' },
      { theme: 'dark', head: ['Questions', 'before you start?'], sub: 'Our FAQ answers the common ones.', ...last('updates', '/faq/', 'Scan to read') },
    ],
  },

  provide: {
    accent: 'neon', peek: true,
    slides: [
      { theme: 'dark', head: ['What do we', 'need from you?'], sub: 'Less than you would expect.' },
      { theme: 'light', head: ['About your', 'business.'], sub: 'A short description and your services.' },
      { theme: 'dark', head: ['How people', 'reach you.'], sub: 'Phone, WhatsApp and social links.' },
      { theme: 'light', head: ['Your look.'], sub: 'Logo, colors and any photos you want used.' },
      { theme: 'dark', head: ['Send it', 'and relax.'], sub: 'We take it from there.', ...last('provide', '/get-started/', 'Scan to start') },
    ],
  },

  counterbook: {
    accent: 'blue', peek: false,
    slides: [
      { theme: 'dark', head: ['Run your shop', 'from one app.'], sub: 'Counterbook is a free point of sale app.', chips: ['Coming soon', 'Free'] },
      { theme: 'light', head: ['Sales, stock,', 'customers, cash.'], sub: 'Everything a counter needs in one place.', chips: ['Sales', 'Stock', 'Cash'] },
      { theme: 'dark', head: ['Works offline.'], sub: 'No internet needed at the counter.', chips: ['No account', 'Offline'] },
      { theme: 'light', head: ['Windows', 'and Android.'], sub: 'Use the device you already have.', chips: ['Windows', 'Android'] },
      { theme: 'dark', head: ['Hear when', 'it launches.'], sub: 'Read more on the Counterbook page.', ...last('counterbook', '/counterbook/', 'Scan to learn more') },
    ],
  },

  apps: {
    accent: 'neon', peek: false,
    slides: [
      { theme: 'dark', head: ['Need an app,', 'not just a site?'], sub: 'We build mobile apps with Flutter.', chips: ['Android', 'iPhone'] },
      { theme: 'light', head: ['One codebase.', 'Both stores.'], sub: 'You pay for one build, not two.', chips: ['One build', 'Both platforms'] },
      { theme: 'dark', head: ['Priced by', 'scope.'], sub: 'A simple app and a complex one differ a lot.', chips: ['Quoted per project'] },
      { theme: 'light', head: ['Your name', 'on the store.'], sub: 'We recommend publishing under your own account.', chips: ['You own it'] },
      { theme: 'dark', head: ['Tell us', 'your idea.'], sub: 'We scope it and send you a quote.', ...last('apps', '/app-development/', 'Scan to read more') },
    ],
  },

  contact: {
    accent: 'neon', peek: true,
    slides: [
      { theme: 'dark', head: ['Have a question', 'before you', 'commit?'], sub: 'Ask us anything.' },
      { theme: 'light', head: ['Message us', 'on WhatsApp.'], sub: 'We reply quickly.' },
      { theme: 'dark', head: ['Prefer', 'email?'], sub: 'That works too.' },
      { theme: 'light', head: ['Packages,', 'apps, agents.'], sub: 'Pricing, custom projects and the referral programme.' },
      { theme: 'dark', head: ['Let us', 'talk.'], sub: 'Send a message in one minute.', ...last('contact', '/contact/', 'Scan to message us') },
    ],
  },

  webguard: EXT('webguard', 'WebGuard', 'Spot the fake.',
    { head: ['Lookalike', 'domains.'], sub: 'It flags pages pretending to be someone else.', chips: ['Phishing'] },
    { head: ['Before you type', 'a password.'], sub: 'Warns about passwords sent over http.', chips: ['Forms', 'Passwords'] }, '/webguard/'),
  webinspect: EXT('webinspect', 'WebInspect', 'Understand any site.',
    { head: ['Tech and SEO', 'at a glance.'], sub: 'See what a site is built with.', chips: ['Tech', 'SEO'] },
    { head: ['Speed, access,', 'security.'], sub: 'One report, one keypress.', chips: ['Performance', 'Security'] }, '/webinspect/'),
  shopinspect: EXT('shopinspect', 'ShopInspect', 'Check before you buy.',
    { head: ['Price, reviews,', 'seller.'], sub: 'Checked in your browser as you shop.', chips: ['Price', 'Reviews', 'Seller'] },
    { head: ['No shopping', 'history kept.'], sub: 'What you shop for stays with you.', chips: ['Private'] }, '/shopinspect/'),
  siteextract: EXT('siteextract', 'SiteExtract', 'Any page, as a project.',
    { head: ['HTML, CSS,', 'images, fonts.'], sub: 'Plus design tokens, all in one ZIP.', chips: ['HTML', 'CSS', 'Fonts'] },
    { head: ['A starter', 'in one click.'], sub: 'Built on your device from the page you are on.', chips: ['One ZIP'] }, '/siteextract/'),
  ...support,
  ...industries,
  ...toolSets,
};
