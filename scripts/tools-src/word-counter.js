module.exports = {
  id: 'word-counter',
  name: 'Word Counter',
  category: 'Everyday',
  icon: 'text',
  short: 'Count words, characters, sentences and paragraphs, with reading time.',
  title: 'Free Word Counter | Elevven11 Tools',
  description: 'Count words, characters, sentences and paragraphs as you type, with estimated reading and speaking time. Free, private and instant.',
  lead: 'Paste or type your text. Counts update as you go.',
  related: ['percentage-calculator', 'json-formatter', 'qr-code-generator', 'discount-calculator'],
  cta: 'everyday',
  appCategory: 'UtilitiesApplication',
  libs: ['calc'],
  addedAt: '2026-10-07',
  og: { lines: ['Count Every', 'Word And Character.'], sub: 'Words, sentences and reading time as you type.' },
  body: () => `<div class="t-panel">
  <div class="t-stats" aria-live="polite">
    <div class="t-stat"><b data-s="words">0</b><span>Words</span></div>
    <div class="t-stat"><b data-s="chars">0</b><span>Characters</span></div>
    <div class="t-stat"><b data-s="charsNoSpaces">0</b><span>Without spaces</span></div>
    <div class="t-stat"><b data-s="sentences">0</b><span>Sentences</span></div>
    <div class="t-stat"><b data-s="paragraphs">0</b><span>Paragraphs</span></div>
    <div class="t-stat"><b data-s="reading">0 sec</b><span>Reading time</span></div>
    <div class="t-stat"><b data-s="speaking">0 sec</b><span>Speaking time</span></div>
  </div>
  <div class="form-group">
    <label class="form-label" for="text">Your text</label>
    <textarea class="form-textarea t-textarea wrap" id="text" spellcheck="true" placeholder="Start typing or paste text here"></textarea>
  </div>
  <div class="t-actions">
    <button class="t-btn" type="button" data-copy-target="#text">Copy text</button>
    <button class="t-btn t-btn-quiet" type="button" data-clear>Clear</button>
  </div>
</div>`,
  howTo: [
    'Type or paste your text into the box.',
    'Read the counts above it. They update with every keystroke.',
    'Use the reading and speaking times to check an article, speech or caption.'
  ],
  howItWorks: {
    text: [
      'Words are runs of characters separated by spaces or line breaks. Sentences end at a full stop, question mark or exclamation mark. Paragraphs are blocks separated by a blank line.',
      'Reading time assumes about 238 words per minute, and speaking time about 150 words per minute. Your own pace will differ.'
    ],
    formula: 'Reading time = words / 238 minutes\nSpeaking time = words / 150 minutes',
    example: '1,000 words takes about 4 minutes 12 seconds to read and about 6 minutes 40 seconds to say aloud.'
  },
  extra: [
    {
      h: 'Common length limits',
      p: ['Limits change, so check the platform before you publish. These are the usual targets:'],
      list: [
        'Post on X: 280 characters for standard accounts.',
        'Page title for search results: about 60 characters.',
        'Meta description: about 150 to 160 characters.',
        'Instagram caption: up to 2,200 characters.',
        'One SMS segment: 160 characters using the basic character set.'
      ]
    }
  ],
  faq: [
    { q: 'How many words is a page?', a: 'A single-spaced page is roughly 500 words, and a double-spaced page about 250. It depends on font size and margins.' },
    { q: 'Does it count hyphenated words as one?', a: 'Yes. Anything joined without a space, such as well-known, counts as one word.' },
    { q: 'Is my text uploaded?', a: 'No. Counting happens in your browser and the text is never sent anywhere.' },
    { q: 'Do emoji count as one character?', a: 'Yes. Each emoji or symbol counts as a single character in the total.' },
    { q: 'Why does my platform count a different number?', a: 'Some platforms count links, hashtags or line breaks differently. Check the limit on the platform itself for posts that must fit.' }
  ]
};
