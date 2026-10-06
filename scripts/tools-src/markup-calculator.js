const { num, row, results, resetBtn, currencySelect } = require('./ui');

module.exports = {
  id: 'markup-calculator',
  name: 'Markup Calculator',
  category: 'Business',
  icon: 'trend',
  short: 'Find a selling price from a markup, or the markup behind a price.',
  title: 'Free Markup Calculator | Elevven11 Tools',
  description: 'Work out a selling price from cost and markup percentage, or find the markup and margin from cost and price. Free online markup calculator.',
  lead: 'Set a price from a markup, or check the markup behind a price you already use.',
  related: ['profit-calculator', 'discount-calculator', 'break-even-calculator', 'percentage-calculator'],
  cta: 'business',
  appCategory: 'BusinessApplication',
  libs: ['calc'],
  addedAt: '2026-10-07',
  og: { lines: ['Price It Right.', 'Markup To Margin.'], sub: 'Set a price from a markup, or check one.' },
  body: () => `<div>
  ${currencySelect}
  <div class="t-split">
    <form class="t-panel" data-calc="forward" novalidate>
      <h2 class="t-sub">Cost and markup to price</h2>
      <p class="t-sub-note">Add a percentage on top of what it costs you.</p>
      ${num({ id: 'f-cost', name: 'cost', label: 'Cost', noun: 'a cost', rule: 'gte0', ph: '0.00' })}
      ${num({ id: 'f-pct', name: 'pct', label: 'Markup (%)', noun: 'a markup percentage', rule: 'gte0', ph: '25' })}
      ${results([row('Selling price', 'price', { main: true }), row('Markup amount', 'amount'), row('Profit margin', 'margin')])}
      ${resetBtn()}
    </form>
    <form class="t-panel" data-calc="reverse" novalidate>
      <h2 class="t-sub">Cost and price to markup</h2>
      <p class="t-sub-note">Find the markup you are already charging.</p>
      ${num({ id: 'r-cost', name: 'cost', label: 'Cost', noun: 'a cost', rule: 'gt0', ph: '0.00' })}
      ${num({ id: 'r-price', name: 'price', label: 'Selling price', noun: 'a selling price', rule: 'gte0', ph: '0.00' })}
      ${results([row('Markup', 'markup', { main: true }), row('Profit per unit', 'amount'), row('Profit margin', 'margin')])}
      ${resetBtn()}
    </form>
  </div>
</div>`,
  howTo: [
    'To set a price, enter your cost and the markup percentage you want in the left box.',
    'To check an existing price, enter the cost and the selling price in the right box.',
    'Margin is shown in both boxes so you can compare it with your target.'
  ],
  howItWorks: {
    text: [
      'Markup is the percentage you add to the cost. If an item costs 80 and you add 25%, you add 20 and sell at 100.',
      'Margin is the same profit measured against the selling price. In that example the margin is 20%, not 25%.'
    ],
    formula: 'Selling price = cost + (cost x markup / 100)\nMarkup = (price - cost) / cost x 100\nMargin = (price - cost) / price x 100',
    example: 'Cost 80 with a 25% markup gives a selling price of 100. The markup amount is 20 and the margin is 20%.'
  },
  faq: [
    { q: 'What markup should I use?', a: 'It depends on your costs and market. Work back from the profit you need after rent, wages and fees, then check that customers will pay the resulting price.' },
    { q: 'Can markup be over 100%?', a: 'Yes. Selling something at three times its cost is a 200% markup.' },
    { q: 'Why can I not reverse a zero cost?', a: 'Markup is measured against cost, so a cost of zero has no percentage. Enter a cost above zero.' }
  ]
};
