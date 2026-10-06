const { num, row, results, resetBtn, currencySelect } = require('./ui');

module.exports = {
  id: 'break-even-calculator',
  name: 'Break-Even Calculator',
  category: 'Business',
  icon: 'scale',
  short: 'Find how many units you must sell before you start making a profit.',
  title: 'Free Break-Even Calculator | Elevven11 Tools',
  description: 'Calculate your break-even point in units and revenue from fixed costs, variable cost and selling price. Add a profit target to plan sales. Free.',
  lead: 'Find the number of sales where your costs are covered.',
  related: ['profit-calculator', 'markup-calculator', 'discount-calculator', 'percentage-calculator'],
  cta: 'business',
  appCategory: 'BusinessApplication',
  libs: ['calc'],
  addedAt: '2026-10-07',
  og: { lines: ['Find Your', 'Break-Even Point.'], sub: 'Units and revenue needed to cover your costs.' },
  body: () => `<div class="t-panel">
  ${currencySelect}
  <form class="t-layout" data-calc="breakeven" novalidate>
    <div>
      ${num({ id: 'fixed', name: 'fixed', label: 'Fixed costs', noun: 'your fixed costs', rule: 'gte0', ph: '0.00', hint: 'Costs that do not change with sales, such as rent or software.' })}
      ${num({ id: 'variable', name: 'variable', label: 'Variable cost per unit', noun: 'a variable cost', rule: 'gte0', ph: '0.00', hint: 'What it costs you to make or buy one more unit.' })}
      ${num({ id: 'price', name: 'price', label: 'Selling price per unit', noun: 'a selling price', rule: 'gt0', ph: '0.00' })}
      ${num({ id: 'target', name: 'target', label: 'Profit target (optional)', noun: 'a profit target', rule: 'gte0', ph: '0.00', optional: true })}
      ${resetBtn()}
    </div>
    ${results([
      row('Break-even units', 'units', { main: true }),
      row('Break-even revenue', 'revenue'),
      row('Profit per unit', 'unitMargin'),
      row('Units for your target', 'targetUnits'),
      row('Revenue for your target', 'targetRevenue')
    ], 'Units are rounded up, since you cannot sell part of a unit.')}
  </form>
</div>`,
  howTo: [
    'Enter your fixed costs for the period, such as a month.',
    'Enter what one unit costs you and the price you sell it at.',
    'Add a profit target if you want to know the sales needed to hit it.'
  ],
  howItWorks: {
    text: [
      'Each sale contributes its price minus the variable cost towards your fixed costs. The break-even point is the number of sales needed for those contributions to cover the fixed costs.',
      'If the selling price is not higher than the variable cost, each sale loses money and there is no break-even point.'
    ],
    formula: 'Profit per unit = selling price - variable cost\nBreak-even units = fixed costs / profit per unit (rounded up)\nBreak-even revenue = break-even units x selling price\nUnits for a target = (fixed costs + target) / profit per unit',
    example: 'Fixed costs 5,000, variable cost 6, price 10. Each unit contributes 4, so you break even at 1,250 units and 12,500 in revenue.'
  },
  faq: [
    { q: 'What counts as a fixed cost?', a: 'Rent, salaries, insurance, subscriptions and loan payments. They stay the same whether you sell one unit or a thousand.' },
    { q: 'What counts as a variable cost?', a: 'Materials, packaging, delivery and sales commission. They rise with every unit sold.' },
    { q: 'Can I use it for a service?', a: 'Yes. Treat one job or one hour as a unit, and its direct cost as the variable cost.' }
  ]
};
