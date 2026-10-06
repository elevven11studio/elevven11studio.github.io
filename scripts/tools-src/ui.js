/**
 * Markup helpers for tool bodies. They only produce HTML strings; behaviour
 * lives in tools/assets/shared.js and tools/assets/t/<id>.js.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Number input. `noun` completes the error text: "Enter <noun> greater than zero."
const num = ({ id, name, label, noun, rule = 'gte0', ph = '', optional = false, hint = '', value = '' }) =>
  `<div class="form-group">
    <label class="form-label" for="${id}">${esc(label)}</label>
    <input class="form-input" id="${id}" type="number" inputmode="decimal" step="any" data-name="${name}" data-label="${esc(noun)}" data-rule="${rule}"${optional ? ' data-optional' : ''}${value !== '' ? ` value="${esc(value)}"` : ''} placeholder="${esc(ph)}" autocomplete="off" />${hint ? `
    <div class="form-hint">${esc(hint)}</div>` : ''}
  </div>`;

// One result row. `dynamicLabel` lets the label itself be filled by the script.
const row = (label, key, { main = false, dynamicLabel = '' } = {}) =>
  `<div class="t-row${main ? ' is-main' : ''}"><dt${dynamicLabel ? ` data-out="${dynamicLabel}" data-default="${esc(label)}"` : ''}>${esc(label)}</dt><dd data-out="${key}"></dd></div>`;

const results = (rows, note = '') =>
  `<div class="t-results" aria-live="polite"><h3>Results</h3><dl>${rows.join('')}</dl>${note ? `<p class="t-note">${esc(note)}</p>` : ''}</div>`;

const resetBtn = (label = 'Reset') => `<div class="t-actions"><button class="t-btn t-btn-quiet" type="button" data-reset>${esc(label)}</button></div>`;

const currencySelect = `<div class="t-top"><span></span><div><label for="currency">Currency</label><select class="form-select" id="currency" data-currency>
      <option value="NGN">NGN, Naira</option><option value="USD">USD, US dollar</option><option value="GBP">GBP, Pound</option><option value="EUR">EUR, Euro</option>
      <option value="GHS">GHS, Cedi</option><option value="KES">KES, Shilling</option><option value="ZAR">ZAR, Rand</option><option value="NONE">No symbol</option>
    </select></div></div>`;

module.exports = { esc, num, row, results, resetBtn, currencySelect };
