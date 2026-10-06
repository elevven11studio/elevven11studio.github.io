/*
 * Pure calculation logic for Elevven11 Tools. No DOM access, so every function
 * can be checked from Node (scripts/test-tools.js) and reused by any tool page.
 *
 * Each function returns either a result object or { error: { field, msg } }
 * when the inputs are individually valid but cannot be combined.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.E11Calc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var round2 = function (n) { return Math.round((n + Number.EPSILON) * 100) / 100; };
  var fail = function (field, msg) { return { error: { field: field, msg: msg } }; };

  function profit(cost, price, qty) {
    var totalCost = cost * qty;
    var revenue = price * qty;
    var gain = revenue - totalCost;
    return {
      totalCost: totalCost,
      revenue: revenue,
      profit: gain,
      margin: revenue > 0 ? gain / revenue * 100 : null,
      markup: totalCost > 0 ? gain / totalCost * 100 : null
    };
  }

  function markupFromPercent(cost, pct) {
    var amount = cost * pct / 100;
    var price = cost + amount;
    return { amount: amount, price: price, profit: amount, margin: price > 0 ? amount / price * 100 : null };
  }

  function markupFromPrice(cost, price) {
    if (cost <= 0) return fail('cost', 'Enter a cost greater than zero to work out a markup percentage.');
    var gain = price - cost;
    return { amount: gain, markup: gain / cost * 100, margin: price > 0 ? gain / price * 100 : null };
  }

  function discount(original, pct) {
    var saved = original * pct / 100;
    return { saved: saved, final: original - saved };
  }

  function discountFromPrices(original, sale) {
    if (sale > original) return fail('sale', 'The sale price cannot be higher than the original price.');
    return { saved: original - sale, pct: (original - sale) / original * 100 };
  }

  function breakEven(fixed, variable, price, target) {
    var unitMargin = price - variable;
    if (unitMargin <= 0) {
      return fail('price', 'Selling price must be higher than the variable cost per unit, or you never break even.');
    }
    var units = Math.ceil(fixed / unitMargin - 1e-9);
    var out = { unitMargin: unitMargin, units: units, revenue: units * price };
    if (target > 0) {
      var tUnits = Math.ceil((fixed + target) / unitMargin - 1e-9);
      out.targetUnits = tUnits;
      out.targetRevenue = tUnits * price;
    }
    return out;
  }

  // VAT: add to a net price, or take out of a gross price.
  function vatAdd(net, rate) {
    var vat = net * rate / 100;
    return { net: net, vat: vat, gross: net + vat };
  }
  function vatRemove(gross, rate) {
    var net = gross / (1 + rate / 100);
    return { net: net, vat: gross - net, gross: gross };
  }

  // What is X% of Y
  function percentOf(pct, value) { return { value: pct / 100 * value }; }

  // X is what percent of Y
  function whatPercent(x, y) {
    if (y === 0) return fail('y', 'Enter a total other than zero.');
    return { pct: x / y * 100 };
  }

  // Change from A to B
  function percentChange(from, to) {
    if (from === 0) return fail('from', 'Enter a starting value other than zero.');
    var change = (to - from) / Math.abs(from) * 100;
    return { pct: change, diff: to - from };
  }

  // Increase or decrease a value by a percentage
  function applyPercent(value, pct, direction) {
    var delta = value * pct / 100;
    return { result: direction === 'decrease' ? value - delta : value + delta, delta: delta };
  }

  function invoiceTotals(items, discountPct, taxPct) {
    var subtotal = 0;
    var lines = items.map(function (it) {
      var amount = round2(it.qty * it.price);
      subtotal += amount;
      return amount;
    });
    subtotal = round2(subtotal);
    var disc = round2(subtotal * discountPct / 100);
    var taxable = round2(subtotal - disc);
    var tax = round2(taxable * taxPct / 100);
    return { lines: lines, subtotal: subtotal, discount: disc, tax: tax, total: round2(taxable + tax) };
  }

  function wordStats(text) {
    var trimmed = text.trim();
    var words = trimmed ? trimmed.split(/\s+/).length : 0;
    var sentences = (trimmed.match(/[^.!?…]+[.!?…]+(?=\s|$)|[^.!?…]+$/g) || [])
      .filter(function (s) { return /\w/.test(s); }).length;
    var paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(function (p) { return p.trim(); }).length : 0;
    return {
      words: words,
      chars: Array.from(text).length,
      charsNoSpaces: Array.from(text.replace(/\s/g, '')).length,
      sentences: sentences,
      paragraphs: paragraphs,
      readingMinutes: words / 238,
      speakingMinutes: words / 150
    };
  }

  // Line and column (1-based) for a character offset.
  function lineCol(text, pos) {
    var before = text.slice(0, pos).split('\n');
    return { line: before.length, col: before[before.length - 1].length + 1 };
  }

  // Finds where a JSON text first goes wrong. JSON.parse says whether it is
  // valid; this says where and why, in the same terms for every browser.
  // Returns null when it finds nothing.
  function jsonScan(text) {
    var i = 0, n = text.length;
    function err(msg, p) { throw { pos: p === undefined ? i : p, msg: msg }; }
    function ws() { while (i < n && /[ \t\r\n]/.test(text.charAt(i))) i++; }
    function here() { return i >= n ? 'Unexpected end of input' : null; }
    function str() {
      var start = i;
      i++;
      while (i < n) {
        var c = text.charAt(i);
        if (c === '"') { i++; return; }
        if (c === '\\') {
          var e = text.charAt(i + 1);
          if (e && '"\\/bfnrt'.indexOf(e) !== -1) i += 2;
          else if (e === 'u') {
            if (!/^[0-9a-fA-F]{4}$/.test(text.substr(i + 2, 4))) err('Invalid unicode escape', i);
            i += 6;
          } else err('Invalid escape sequence', i);
        } else if (c < ' ') err('Line breaks and control characters must be escaped inside a string');
        else i++;
      }
      err('Unterminated string', start);
    }
    function value() {
      ws();
      if (here()) err(here());
      var c = text.charAt(i);
      if (c === '{') return obj();
      if (c === '[') return arr();
      if (c === '"') return str();
      if (c === '-' || (c >= '0' && c <= '9')) {
        var re = /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/y;
        re.lastIndex = i;
        var m = re.exec(text);
        if (!m) err('Invalid number');
        i += m[0].length;
        return;
      }
      var words = ['true', 'false', 'null'];
      for (var w = 0; w < words.length; w++) {
        if (text.substr(i, words[w].length) === words[w]) { i += words[w].length; return; }
      }
      if (c === "'") err('Strings need double quotes, not single quotes');
      err("Unexpected character '" + c + "'");
    }
    function obj() {
      i++; ws();
      if (text.charAt(i) === '}') { i++; return; }
      for (;;) {
        ws();
        if (here()) err(here());
        if (text.charAt(i) !== '"') {
          err(text.charAt(i) === '}' ? 'Trailing commas are not allowed' : "Keys must be in double quotes, found '" + text.charAt(i) + "'");
        }
        str(); ws();
        if (here()) err(here());
        if (text.charAt(i) !== ':') err("Expected ':' after the key");
        i++;
        value(); ws();
        if (here()) err(here());
        if (text.charAt(i) === ',') { i++; continue; }
        if (text.charAt(i) === '}') { i++; return; }
        err("Expected ',' or '}' but found '" + text.charAt(i) + "'");
      }
    }
    function arr() {
      i++; ws();
      if (text.charAt(i) === ']') { i++; return; }
      for (;;) {
        value(); ws();
        if (here()) err(here());
        if (text.charAt(i) === ',') {
          i++; ws();
          if (text.charAt(i) === ']') err('Trailing commas are not allowed');
          continue;
        }
        if (text.charAt(i) === ']') { i++; return; }
        err("Expected ',' or ']' but found '" + text.charAt(i) + "'");
      }
    }
    try {
      value(); ws();
      if (i < n) err("Unexpected character '" + text.charAt(i) + "' after the end of the JSON");
    } catch (e) {
      if (e && typeof e.pos === 'number') return e;
      throw e;
    }
    return null;
  }

  // Turns a JSON.parse failure into a message with a location.
  function jsonProblem(text, err) {
    var found = jsonScan(text);
    if (found) {
      var at = lineCol(text, Math.min(found.pos, text.length));
      return { line: at.line, col: at.col, message: found.msg };
    }
    var msg = String(err && err.message || err).replace(/^JSON\.parse: /, '');
    return { line: null, col: null, message: msg.length > 120 ? msg.slice(0, 117) + '...' : msg };
  }

  function sortKeys(value) {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value && typeof value === 'object') {
      var out = {};
      Object.keys(value).sort().forEach(function (k) { out[k] = sortKeys(value[k]); });
      return out;
    }
    return value;
  }

  return {
    round2: round2,
    profit: profit,
    markupFromPercent: markupFromPercent,
    markupFromPrice: markupFromPrice,
    discount: discount,
    discountFromPrices: discountFromPrices,
    breakEven: breakEven,
    vatAdd: vatAdd,
    vatRemove: vatRemove,
    percentOf: percentOf,
    whatPercent: whatPercent,
    percentChange: percentChange,
    applyPercent: applyPercent,
    invoiceTotals: invoiceTotals,
    wordStats: wordStats,
    jsonScan: jsonScan,
    jsonProblem: jsonProblem,
    sortKeys: sortKeys
  };
});
