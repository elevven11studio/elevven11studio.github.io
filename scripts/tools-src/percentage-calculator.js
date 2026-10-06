const { num, row, results, resetBtn } = require('./ui');

const card = (key, title, note, fields, rows) => `<form class="t-panel" data-calc="${key}" novalidate>
      <h2 class="t-sub">${title}</h2>
      <p class="t-sub-note">${note}</p>
      ${fields.join('\n      ')}
      ${results(rows)}
      ${resetBtn()}
    </form>`;

module.exports = {
  id: 'percentage-calculator',
  name: 'Percentage Calculator',
  category: 'Everyday',
  icon: 'percent',
  short: 'Percent of a number, percent change, and increase or decrease by a percent.',
  title: 'Free Percentage Calculator | Elevven11 Tools',
  description: 'Find a percentage of a number, what percent one number is of another, percentage change, and increase or decrease a value by a percent. Free.',
  lead: 'Four common percentage questions, each answered as you type.',
  related: ['discount-calculator', 'profit-calculator', 'markup-calculator', 'word-counter'],
  cta: 'everyday',
  appCategory: 'UtilitiesApplication',
  libs: ['calc'],
  addedAt: '2026-10-07',
  og: { lines: ['Percentages,', 'Without The Maths.'], sub: 'Percent of, change, increase and decrease.' },
  body: () => `<div class="t-split">
    ${card('of', 'What is X% of Y?', 'For example, 15% of 200.', [
      num({ id: 'a-x', name: 'x', label: 'Percent', noun: 'a percentage', rule: 'any', ph: '15' }),
      num({ id: 'a-y', name: 'y', label: 'Of', noun: 'a number', rule: 'any', ph: '200' })
    ], [row('Answer', 'value', { main: true })])}
    ${card('what', 'X is what percent of Y?', 'For example, 30 out of 200.', [
      num({ id: 'b-x', name: 'x', label: 'Number', noun: 'a number', rule: 'any', ph: '30' }),
      num({ id: 'b-y', name: 'y', label: 'Out of', noun: 'a total', rule: 'any', ph: '200' })
    ], [row('Answer', 'pct', { main: true })])}
    ${card('change', 'Percentage change', 'From one value to another.', [
      num({ id: 'c-from', name: 'from', label: 'From', noun: 'a starting value', rule: 'any', ph: '50' }),
      num({ id: 'c-to', name: 'to', label: 'To', noun: 'an ending value', rule: 'any', ph: '75' })
    ], [row('Change', 'pct', { main: true, dynamicLabel: 'dir' }), row('Difference', 'diff')])}
    ${card('apply', 'Increase or decrease by a percent', 'Add or take off a percentage.', [
      num({ id: 'd-value', name: 'value', label: 'Value', noun: 'a value', rule: 'any', ph: '200' }),
      num({ id: 'd-pct', name: 'pct', label: 'Percent', noun: 'a percentage', rule: 'any', ph: '10' })
    ], [row('Increased by percent', 'up', { main: true }), row('Decreased by percent', 'down', { main: true })])}
  </div>`,
  howTo: [
    'Pick the box that matches your question and fill in both numbers.',
    'The answer appears as soon as both fields have a value.',
    'Use Reset in a box to clear just that calculation.'
  ],
  howItWorks: {
    text: [
      'A percentage is a number out of 100. To take a percentage of a value, divide the percentage by 100 and multiply.',
      'Percentage change compares a new value with the old one, so the starting value matters. Going from 50 to 75 is up 50%, but going from 75 back to 50 is down 33.3%.'
    ],
    formula: 'X% of Y = X / 100 x Y\nX is what percent of Y = X / Y x 100\nChange = (new - old) / old x 100\nIncrease by P% = value x (1 + P / 100)',
    example: '15% of 200 is 30. 30 is 15% of 200. Going from 50 to 75 is a 50% increase.'
  },
  faq: [
    { q: 'Why is a rise and fall of the same percent not equal?', a: 'Each change is measured from a different starting value. Up 50% then down 50% leaves you 25% below where you began.' },
    { q: 'Can I use negative numbers?', a: 'Yes. Negative values work in all four boxes. A starting value or total of zero cannot be used where it is the divisor.' },
    { q: 'How do I work out a discount?', a: 'Use the discount calculator, which shows the final price and the amount saved together.' }
  ]
};
