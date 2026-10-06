const { num, row, results, resetBtn, currencySelect } = require('./ui');

module.exports = {
  id: 'discount-calculator',
  name: 'Discount Calculator',
  category: 'Business',
  icon: 'tag',
  short: 'See the sale price and amount saved after a percentage discount.',
  title: 'Free Discount Calculator | Elevven11 Tools',
  description: 'Calculate the final price and amount saved after a percentage discount, or find the discount from an original and sale price. Free and instant.',
  lead: 'Find the sale price after a discount, or work out how big a discount was.',
  related: ['percentage-calculator', 'profit-calculator', 'markup-calculator', 'vat-calculator'],
  cta: 'business',
  appCategory: 'BusinessApplication',
  libs: ['calc'],
  addedAt: '2026-10-07',
  og: { lines: ['Sale Price, ', 'Instantly.'], sub: 'Final price and amount saved after a discount.' },
  body: () => `<div>
  ${currencySelect}
  <div class="t-split">
    <form class="t-panel" data-calc="forward" novalidate>
      <h2 class="t-sub">Price and discount</h2>
      <p class="t-sub-note">Take a percentage off the original price.</p>
      ${num({ id: 'f-orig', name: 'orig', label: 'Original price', noun: 'an original price', rule: 'gt0', ph: '0.00' })}
      ${num({ id: 'f-pct', name: 'pct', label: 'Discount (%)', noun: 'a discount', rule: 'pct100', ph: '10' })}
      ${results([row('Final price', 'final', { main: true }), row('Amount saved', 'saved')])}
      ${resetBtn()}
    </form>
    <form class="t-panel" data-calc="reverse" novalidate>
      <h2 class="t-sub">Original and sale price</h2>
      <p class="t-sub-note">Find the discount a sale price represents.</p>
      ${num({ id: 'r-orig', name: 'orig', label: 'Original price', noun: 'an original price', rule: 'gt0', ph: '0.00' })}
      ${num({ id: 'r-sale', name: 'sale', label: 'Sale price', noun: 'a sale price', rule: 'gte0', ph: '0.00' })}
      ${results([row('Discount', 'pct', { main: true }), row('Amount saved', 'saved')])}
      ${resetBtn()}
    </form>
  </div>
</div>`,
  howTo: [
    'Enter the original price and the discount percentage in the left box to get the final price.',
    'Or enter the original and sale prices in the right box to see the discount.',
    'The amount saved is shown in both.'
  ],
  howItWorks: {
    text: [
      'A discount takes a percentage off the original price. The final price is what remains.',
      'Two discounts do not add up. 20% off followed by another 10% off is 28% off in total, because the second is taken from the reduced price.'
    ],
    formula: 'Amount saved = original x discount / 100\nFinal price = original - amount saved\nDiscount = (original - sale) / original x 100',
    example: 'A 200 item with 15% off saves 30, so the final price is 170.'
  },
  faq: [
    { q: 'How do I take two discounts off?', a: 'Run the calculator twice. Use the final price from the first discount as the original price for the second.' },
    { q: 'Does it add tax?', a: 'No. Apply the discount first, then add any tax to the final price.' },
    { q: 'What happens if the sale price is higher than the original?', a: 'That is not a discount, so the calculator asks you to check the two prices.' }
  ]
};
