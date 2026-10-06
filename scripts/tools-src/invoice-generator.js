const { esc, currencySelect } = require('./ui');

const text = (id, label, ph = '', extra = '') =>
  `<div class="form-group"><label class="form-label" for="${id}">${label}</label><input class="form-input" id="${id}" type="text" placeholder="${esc(ph)}" autocomplete="off" ${extra} /></div>`;
const area = (id, label, ph = '', rows = 3) =>
  `<div class="form-group"><label class="form-label" for="${id}">${label}</label><textarea class="form-textarea" id="${id}" rows="${rows}" placeholder="${esc(ph)}" style="min-height:0"></textarea></div>`;

module.exports = {
  id: 'invoice-generator',
  name: 'Invoice Generator',
  category: 'Business',
  icon: 'file',
  short: 'Build a clean invoice, then print it or save it as a PDF.',
  title: 'Free Invoice Generator | Elevven11 Tools',
  description: 'Create a professional invoice with items, discount and tax, then print it or save it as a PDF. No account. Your details stay on your device.',
  lead: 'Fill in the details and watch the invoice build beside you.',
  related: ['profit-calculator', 'discount-calculator', 'percentage-calculator', 'vat-calculator'],
  cta: 'business',
  appCategory: 'BusinessApplication',
  libs: ['calc'],
  addedAt: '2026-10-07',
  og: { lines: ['Invoices In', 'Minutes,  Free.'], sub: 'Print or save as PDF. Drafts stay on your device.' },
  body: () => `<div class="t-panel">
  ${currencySelect}
  <div class="t-layout">
    <div class="t-form-col t-no-print">
      ${text('from-name', 'Your business name', 'Elevven11 Studio')}
      ${area('from-details', 'Your details', 'Address, phone, email')}
      ${text('to-name', 'Bill to', 'Customer name')}
      ${area('to-details', 'Customer details', 'Address, phone, email')}
      <div class="t-pair">
        ${text('inv-no', 'Invoice number', 'INV-001')}
        <div class="form-group"><label class="form-label" for="inv-date">Invoice date</label><input class="form-input" id="inv-date" type="date" /></div>
      </div>
      <div class="form-group"><label class="form-label" for="inv-due">Due date (optional)</label><input class="form-input" id="inv-due" type="date" /></div>
      <div class="form-label" id="items-label">Items</div>
      <div class="inv-head" aria-hidden="true"><span>Description</span><span>Qty</span><span>Price</span><span></span></div>
      <div class="inv-items" id="items" role="group" aria-labelledby="items-label"></div>
      <button class="t-btn t-btn-quiet" type="button" id="add-item">Add item</button>
      <div class="t-pair" style="margin-top:1.1rem">
        <div class="form-group"><label class="form-label" for="inv-disc">Discount (%)</label><input class="form-input" id="inv-disc" type="number" inputmode="decimal" step="any" min="0" max="100" placeholder="0" /></div>
        <div class="form-group"><label class="form-label" for="inv-tax">Tax (%)</label><input class="form-input" id="inv-tax" type="number" inputmode="decimal" step="any" min="0" placeholder="0" /></div>
      </div>
      <div class="t-error" id="inv-error" role="alert" hidden></div>
      ${area('inv-notes', 'Notes', 'Payment details, thank you note, terms', 3)}
      <div class="t-actions">
        <button class="t-btn t-btn-primary" type="button" id="print">Print or save as PDF</button>
        <button class="t-btn t-btn-quiet" type="button" id="clear">Clear</button>
      </div>
      <p class="inv-saved" id="saved" aria-live="polite"></p>
    </div>
    <div>
      <div class="inv-sheet" id="invoice-preview" aria-label="Invoice preview"></div>
    </div>
  </div>
</div>`,
  howTo: [
    'Enter your details, the customer and the invoice number and dates.',
    'Add each item with a quantity and price. Add a discount or tax percentage if needed.',
    'Choose Print or save as PDF. In the print window, pick "Save as PDF" as the destination.'
  ],
  howItWorks: {
    text: [
      'Each line is quantity times price, rounded to the nearest cent. The discount comes off the subtotal, and tax is charged on what remains after the discount.',
      'Your draft is saved in this browser so you can come back to it. It is never uploaded, and clearing the invoice removes the saved copy.'
    ],
    formula: 'Subtotal = sum of (quantity x price)\nDiscount = subtotal x discount % / 100\nTax = (subtotal - discount) x tax % / 100\nTotal = subtotal - discount + tax',
    example: 'Two items worth 1,000 and 500 give a subtotal of 1,500. A 10% discount takes off 150, and 7.5% tax on 1,350 adds 101.25, so the total is 1,451.25.'
  },
  faq: [
    { q: 'How do I get a PDF?', a: 'Choose Print or save as PDF, then pick "Save as PDF" as the printer in the print window. Turn off headers and footers for a clean page.' },
    { q: 'Is my invoice stored anywhere?', a: 'Only in this browser on this device, so you can resume a draft. Nothing is sent to us. Clear removes it.' },
    { q: 'Can I add my logo?', a: 'Not yet. Put your business name and details at the top, which is what the invoice header shows.' },
    { q: 'Is this a legal tax invoice?', a: 'It shows the information most invoices need. Rules differ by country, so check what your tax authority requires, such as a tax number.' }
  ]
};
