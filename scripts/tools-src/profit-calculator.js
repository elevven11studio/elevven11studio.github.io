const { num, row, results, resetBtn, currencySelect } = require('./ui');

module.exports = {
  id: 'profit-calculator',
  name: 'Profit Calculator',
  category: 'Business',
  icon: 'calculator',
  short: 'Work out revenue, profit, margin and markup from cost and selling price.',
  title: 'Free Profit Calculator | Elevven11 Tools',
  description: 'Calculate profit, revenue, profit margin and markup from your cost price, selling price and quantity. Free, runs in your browser.',
  lead: 'Enter what an item costs you and what you sell it for.',
  related: ['markup-calculator', 'discount-calculator', 'break-even-calculator', 'percentage-calculator'],
  cta: 'business',
  appCategory: 'BusinessApplication',
  libs: ['calc'],
  addedAt: '2026-10-07',
  og: { lines: ['Know Your Profit,', 'Margin And Markup.'], sub: 'Revenue, profit and markup from cost and price.' },
  body: () => `<div class="t-panel">
  ${currencySelect}
  <form class="t-layout" data-calc="profit" novalidate>
    <div>
      ${num({ id: 'cost', name: 'cost', label: 'Cost price (each)', noun: 'a cost price', rule: 'gte0', ph: '0.00' })}
      ${num({ id: 'price', name: 'price', label: 'Selling price (each)', noun: 'a selling price', rule: 'gt0', ph: '0.00' })}
      ${num({ id: 'qty', name: 'qty', label: 'Quantity', noun: 'a quantity', rule: 'gt0', value: '1' })}
      ${resetBtn()}
    </div>
    ${results([
      row('Profit', 'profit', { main: true, dynamicLabel: 'profit_label' }),
      row('Profit margin', 'margin'),
      row('Markup', 'markup'),
      row('Revenue', 'revenue'),
      row('Total cost', 'totalCost')
    ])}
  </form>
</div>`,
  howTo: [
    'Enter the cost price of one item and the price you sell it at.',
    'Set the quantity if you sell more than one. Results update as you type.',
    'Read the profit, margin and markup. A negative profit is shown as a loss.'
  ],
  howItWorks: {
    text: [
      'Profit is what is left after costs. Margin is profit as a share of revenue, so it tells you how much of each sale you keep. Markup is profit as a share of cost, so it tells you how much you added on top of what you paid.',
      'They are easy to mix up. A 50% markup is only a 33.3% margin, because the profit is measured against a different base.'
    ],
    formula: 'Revenue = selling price x quantity\nTotal cost = cost price x quantity\nProfit = revenue - total cost\nMargin = profit / revenue x 100\nMarkup = profit / total cost x 100',
    example: 'Buy at 60, sell at 100, 10 units. Revenue is 1,000 and total cost is 600, so profit is 400. Margin is 40% and markup is 66.67%.'
  },
  faq: [
    { q: 'What is the difference between margin and markup?', a: 'Margin divides profit by the selling price. Markup divides profit by the cost. The same sale always has a higher markup than margin.' },
    { q: 'Why does the margin show "Not defined"?', a: 'Margin needs revenue above zero and markup needs a cost above zero. Enter a selling price to see the margin.' },
    { q: 'Does it include tax or delivery?', a: 'No. Add delivery, fees and other costs into the cost price to get a true profit figure.' },
    { q: 'Is anything stored or sent?', a: 'No. The numbers stay in your browser. Only your currency choice is remembered on your device.' }
  ]
};
