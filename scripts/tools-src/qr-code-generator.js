const { esc } = require('./ui');

const field = (id, label, extra = '') => `<div class="form-group"><label class="form-label" for="${id}">${label}</label>${extra}</div>`;
const input = (id, type, ph, attrs = '') => `<input class="form-input" id="${id}" type="${type}" placeholder="${esc(ph)}" autocomplete="off" ${attrs} />`;

module.exports = {
  id: 'qr-code-generator',
  name: 'QR Code Generator',
  category: 'Everyday',
  icon: 'qr',
  short: 'Make a QR code for a link, text, email, phone number or Wi-Fi.',
  title: 'Free QR Code Generator | Elevven11 Tools',
  description: 'Create QR codes for links, text, email, phone numbers and Wi-Fi. Download as PNG or SVG. Made in your browser, nothing is uploaded.',
  lead: 'Choose what the code should hold, then download it.',
  related: ['json-formatter', 'word-counter', 'percentage-calculator', 'invoice-generator'],
  cta: 'business',
  appCategory: 'UtilitiesApplication',
  libs: ['qr'],
  addedAt: '2026-10-07',
  og: { lines: ['Make A QR Code', 'In Seconds.'], sub: 'Links, text, Wi-Fi and more. PNG or SVG.' },
  body: () => `<div class="t-panel">
  <div class="t-layout">
    <div class="t-form-col">
      <div class="t-tabs" role="tablist" aria-label="QR code type">
        <button class="t-tab" role="tab" type="button" aria-selected="true" data-type="url" id="tab-url" aria-controls="qr-fields">Link</button>
        <button class="t-tab" role="tab" type="button" aria-selected="false" data-type="text" id="tab-text" aria-controls="qr-fields">Text</button>
        <button class="t-tab" role="tab" type="button" aria-selected="false" data-type="email" id="tab-email" aria-controls="qr-fields">Email</button>
        <button class="t-tab" role="tab" type="button" aria-selected="false" data-type="phone" id="tab-phone" aria-controls="qr-fields">Phone</button>
        <button class="t-tab" role="tab" type="button" aria-selected="false" data-type="wifi" id="tab-wifi" aria-controls="qr-fields">Wi-Fi</button>
      </div>
      <div id="qr-fields" role="tabpanel">
        <div data-for="url">${field('q-url', 'Web address', input('q-url', 'text', 'example.com', 'inputmode="url" autocapitalize="off"'))}</div>
        <div data-for="text" hidden>${field('q-text', 'Text', '<textarea class="form-textarea" id="q-text" rows="4" placeholder="Anything you want people to read"></textarea>')}</div>
        <div data-for="email" hidden>
          ${field('q-email', 'Email address', input('q-email', 'email', 'name@example.com', 'inputmode="email" autocapitalize="off"'))}
          ${field('q-subject', 'Subject (optional)', input('q-subject', 'text', ''))}
          ${field('q-body', 'Message (optional)', '<textarea class="form-textarea" id="q-body" rows="3"></textarea>')}
        </div>
        <div data-for="phone" hidden>${field('q-phone', 'Phone number', input('q-phone', 'tel', '+234 800 000 0000', 'inputmode="tel"'))}</div>
        <div data-for="wifi" hidden>
          ${field('q-ssid', 'Network name', input('q-ssid', 'text', 'Home Wi-Fi'))}
          ${field('q-pass', 'Password', input('q-pass', 'text', '', 'autocapitalize="off"'))}
          ${field('q-sec', 'Security', '<select class="form-select" id="q-sec"><option value="WPA">WPA or WPA2</option><option value="WEP">WEP</option><option value="nopass">None</option></select>')}
          <div class="t-options"><label for="q-hidden"><input class="t-check" type="checkbox" id="q-hidden" /> Hidden network</label></div>
        </div>
      </div>
      <div class="t-options">
        <label for="q-ecl">Error correction <select class="form-select" id="q-ecl"><option value="L">Low</option><option value="M" selected>Medium</option><option value="Q">Quartile</option><option value="H">High</option></select></label>
      </div>
      <div class="t-colors" style="margin-top:1rem">
        <label for="q-fg"><input type="color" id="q-fg" value="#000000" /> Code</label>
        <label for="q-bg"><input type="color" id="q-bg" value="#ffffff" /> Background</label>
      </div>
      <div class="t-error" id="q-error" role="alert" hidden></div>
    </div>
    <div class="qr-stage">
      <div class="qr-frame" id="qr-frame" hidden><canvas id="qr-canvas" role="img" aria-label="Generated QR code"></canvas></div>
      <p class="qr-empty" id="qr-empty">Your code appears here once you fill in the details.</p>
      <div class="t-actions" id="qr-actions" hidden>
        <button class="t-btn t-btn-primary" type="button" data-act="png">Download PNG</button>
        <button class="t-btn" type="button" data-act="svg">Download SVG</button>
        <button class="t-btn" type="button" data-act="copy">Copy image</button>
      </div>
      <p class="t-note" id="qr-warn" hidden></p>
    </div>
  </div>
</div>`,
  howTo: [
    'Pick a type: link, text, email, phone or Wi-Fi.',
    'Fill in the details. The code updates as you type.',
    'Download it as PNG for print and screens, or SVG for a sharp result at any size.',
    'Scan it with your phone before you print it.'
  ],
  howItWorks: {
    text: [
      'A QR code is a grid of squares that stores your text in a pattern a camera can read. This page builds the grid in your browser, so what you enter is not uploaded.',
      'Error correction lets a code still scan when part of it is dirty or covered. Higher levels add redundancy and make the code denser. Medium suits most uses.',
      'Keep strong contrast between the code and its background, with the code darker. Light codes on a dark background fail on many scanners.'
    ],
    formula: '',
    example: 'A link to your site, printed at least 2 cm wide on a flyer, scans reliably from arm\'s length.'
  },
  faq: [
    { q: 'Do these QR codes expire?', a: 'No. The code holds your text directly, so it works as long as what it points to still exists. There is no tracking or redirect.' },
    { q: 'Can I use them on print and signs?', a: 'Yes. Download the SVG for large prints, or the PNG for documents and screens. Leave a blank margin around the code.' },
    { q: 'How do I make a Wi-Fi code?', a: 'Choose Wi-Fi, enter the network name and password, and pick the security type. Phones that scan it offer to join the network.' },
    { q: 'Why does my code not scan?', a: 'Check the contrast, print it larger, or raise the error correction. Very long text makes a denser code that needs more size.' }
  ]
};
