const { num, row, results, resetBtn, currencySelect } = require('./ui');

module.exports = {
  id: 'vat-calculator',
  name: 'VAT Calculator',
  category: 'Finance',
  icon: 'receipt',
  short: 'Add VAT to a price or take it out. Starts at the Nigerian rate of 7.5%.',
  title: 'Free VAT Calculator, 7.5% Nigeria | Elevven11 Tools',
  description: 'Add VAT to a price or remove it from a VAT-inclusive total. Set to the Nigerian rate of 7.5% and works for any rate. Free and instant.',
  lead: 'Add VAT to a price, or find the price before VAT was added.',
  related: ['invoice-generator', 'discount-calculator', 'percentage-calculator', 'profit-calculator'],
  cta: 'business',
  appCategory: 'BusinessApplication',
  libs: ['calc'],
  addedAt: '2026-10-07',
  og: { lines: ['Add Or Remove', 'VAT In Seconds.'], sub: 'Starts at the Nigerian rate of 7.5%. Any rate works.' },
  keywords: 'vat tax nigeria 7.5',
  body: () => `<div>
  ${currencySelect}
  <div class="t-split">
    <form class="t-panel" data-calc="add" novalidate>
      <h2 class="t-sub">Add VAT</h2>
      <p class="t-sub-note">Start from the price before VAT.</p>
      ${num({ id: 'a-net', name: 'net', label: 'Price before VAT', noun: 'a price', rule: 'gte0', ph: '0.00' })}
      ${num({ id: 'a-rate', name: 'rate', label: 'VAT rate (%)', noun: 'a VAT rate', rule: 'gte0', value: '7.5' })}
      ${results([row('Price with VAT', 'gross', { main: true }), row('VAT amount', 'vat'), row('Price before VAT', 'net')])}
      ${resetBtn()}
    </form>
    <form class="t-panel" data-calc="remove" novalidate>
      <h2 class="t-sub">Remove VAT</h2>
      <p class="t-sub-note">Start from a total that already includes VAT.</p>
      ${num({ id: 'r-gross', name: 'gross', label: 'Price with VAT', noun: 'a price', rule: 'gte0', ph: '0.00' })}
      ${num({ id: 'r-rate', name: 'rate', label: 'VAT rate (%)', noun: 'a VAT rate', rule: 'gte0', value: '7.5' })}
      ${results([row('Price before VAT', 'net', { main: true }), row('VAT amount', 'vat'), row('Price with VAT', 'gross')])}
      ${resetBtn()}
    </form>
  </div>
</div>`,
  howTo: [
    'To add VAT, enter the price before VAT in the left box.',
    'To work backwards, enter a VAT-inclusive total in the right box.',
    'The rate starts at 7.5%. Change it if your goods or country use a different rate.'
  ],
  howItWorks: {
    text: [
      'VAT is a percentage added to the selling price. Adding it multiplies the price by one plus the rate. Removing it divides the total by the same number.',
      'You cannot take VAT out by subtracting the rate from the total. On a 1,075 total at 7.5%, 7.5% of 1,075 is 80.63, but the real VAT is 75.'
    ],
    formula: 'VAT = price before VAT x rate / 100\nPrice with VAT = price before VAT + VAT\nPrice before VAT = price with VAT / (1 + rate / 100)',
    example: '1,000 before VAT at 7.5% adds 75, so the total is 1,075. Going back, 1,075 / 1.075 gives 1,000, and the VAT is 75.'
  },
  extra: [
    {
      h: 'VAT in Nigeria',
      p: [
        'The standard VAT rate in Nigeria is 7.5%, which is why it is the starting value here. Some goods and services are exempt or zero-rated, and businesses above the registration threshold must charge and report VAT.',
        'Rules change, so confirm what applies to your business with the tax authority or an accountant. This tool does the arithmetic only.'
      ]
    }
  ],
  faq: [
    { q: 'What is the VAT rate in Nigeria?', a: 'The standard rate is 7.5%. Some items are exempt or zero-rated, so check the current rules for what you sell.' },
    { q: 'How do I take VAT out of a total?', a: 'Divide the total by 1 plus the rate as a decimal. At 7.5% that means dividing by 1.075. The right-hand box does this for you.' },
    { q: 'Can I use another country\'s rate?', a: 'Yes. Change the rate field to any percentage, for example 20 for a 20% rate.' },
    { q: 'Does it work for GST or sales tax?', a: 'Yes for any tax that is a flat percentage on the price. Rules for what is taxed differ by place.' }
  ]
};
