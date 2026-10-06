module.exports = {
  id: 'json-formatter',
  name: 'JSON Formatter',
  category: 'Developer',
  icon: 'braces',
  short: 'Format, minify and validate JSON, with the line of any error.',
  title: 'Free JSON Formatter and Validator | Elevven11 Tools',
  description: 'Format, minify and validate JSON in your browser. See the line and column of any error. Your JSON is never sent to a server.',
  lead: 'Paste JSON to check it, tidy it or shrink it.',
  related: ['word-counter', 'qr-code-generator', 'percentage-calculator', 'profit-calculator'],
  cta: 'developer',
  appCategory: 'DeveloperApplication',
  libs: ['calc'],
  addedAt: '2026-10-07',
  og: { lines: ['Format And Check', 'Your JSON.'], sub: 'Errors shown by line. Nothing leaves your browser.' },
  body: () => `<div class="t-panel">
  <div class="form-group">
    <label class="form-label" for="json">JSON</label>
    <textarea class="form-textarea t-textarea" id="json" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder='{"name": "Elevven11"}'></textarea>
    <div class="t-status" id="status" role="status"></div>
  </div>
  <div class="t-options">
    <label for="indent">Indent <select class="form-select" id="indent"><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tab</option></select></label>
    <label for="sort"><input class="t-check" type="checkbox" id="sort" /> Sort keys</label>
  </div>
  <div class="t-actions">
    <button class="t-btn t-btn-primary" type="button" data-act="format">Format</button>
    <button class="t-btn" type="button" data-act="minify">Minify</button>
    <button class="t-btn" type="button" data-copy-target="#json">Copy</button>
    <button class="t-btn" type="button" data-act="download">Download</button>
    <button class="t-btn t-btn-quiet" type="button" data-act="clear">Clear</button>
  </div>
</div>`,
  howTo: [
    'Paste your JSON into the box. It is checked as you type.',
    'Choose Format to indent it, or Minify to remove all spaces.',
    'If it is invalid, the message gives the line and column to fix.'
  ],
  howItWorks: {
    text: [
      'The page parses your text with the browser\'s own JSON parser. If parsing works, the data is written back out with your chosen indentation. If it fails, the parser\'s message is shown with the position converted into a line and column.',
      'Common causes of errors are trailing commas, single quotes instead of double quotes, unquoted keys and comments, none of which JSON allows.'
    ],
    formula: '',
    example: '{"a":1,"b":[1,2]} becomes a readable block with each key on its own line. Minify turns it back into one line.'
  },
  extra: [
    {
      h: 'Common JSON errors',
      p: ['Most failures come from habits carried over from JavaScript or other formats:'],
      list: [
        'A trailing comma after the last item.',
        'Single quotes around keys or strings. JSON needs double quotes.',
        'Keys without quotes, such as {name: "Ada"}.',
        'Comments. JSON does not allow // or /* */.',
        'A missing comma between two items.',
        'A raw line break inside a string. Write it as \\n instead.'
      ]
    }
  ],
  faq: [
    { q: 'What is the difference between JSON and a JavaScript object?', a: 'JSON is a text format with stricter rules. Keys must be in double quotes, and values cannot be functions, undefined or comments.' },
    { q: 'Why did my numbers change after formatting?', a: 'Integers beyond 9,007,199,254,740,991 lose precision in JavaScript and may be rounded. Keep those as strings.' },
    { q: 'Is my JSON sent to a server?', a: 'No. Everything runs in your browser, so API keys, tokens and customer data in pasted JSON stay on your device.' },
    { q: 'Why does my JSON fail with a trailing comma?', a: 'The JSON standard does not allow a comma after the last item in an object or array. Remove it and the check will pass.' },
    { q: 'Does sorting keys change my data?', a: 'It reorders object keys alphabetically, including nested ones. Array order is kept. The values are not changed.' },
    { q: 'Can it handle large files?', a: 'It handles several megabytes on most devices. Very large files may slow down a phone.' }
  ]
};
