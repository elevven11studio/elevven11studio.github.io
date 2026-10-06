/**
 * Checks the logic behind Elevven11 Tools.
 *
 *   cd scripts && npm run test-tools
 *
 * The QR encoder is checked two ways: every output is decoded by jsQR (a real
 * reader) and must return the input, and the module grid is compared with the
 * `qrcode` package when both are forced to the same mask.
 */
const assert = require('assert');
const path = require('path');
const calc = require(path.join(__dirname, '..', 'tools', 'assets', 'calc.js'));
const E11QR = require(path.join(__dirname, '..', 'tools', 'assets', 'qr.js'));
const jsQR = require('jsqr');
const QRCode = require('qrcode');

let passed = 0;
const test = (name, fn) => {
  try { fn(); passed++; } catch (e) { console.log('FAIL  ' + name + '\n      ' + e.message); process.exitCode = 1; }
};
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, a + ' != ' + b);

// ---- business maths ----
test('profit', () => {
  const r = calc.profit(60, 100, 10);
  near(r.totalCost, 600); near(r.revenue, 1000); near(r.profit, 400);
  near(r.margin, 40); near(r.markup, 400 / 600 * 100);
});
test('profit with zero revenue has no margin', () => {
  const r = calc.profit(10, 0, 5);
  assert.strictEqual(r.margin, null); near(r.profit, -50);
});
test('profit with zero cost has no markup', () => assert.strictEqual(calc.profit(0, 5, 2).markup, null));
test('markup from percent', () => {
  const r = calc.markupFromPercent(80, 25);
  near(r.amount, 20); near(r.price, 100); near(r.margin, 20);
});
test('markup from price', () => {
  const r = calc.markupFromPrice(80, 100);
  near(r.markup, 25); near(r.margin, 20);
  assert.ok(calc.markupFromPrice(0, 100).error);
});
test('discount', () => {
  const r = calc.discount(200, 15);
  near(r.saved, 30); near(r.final, 170);
});
test('discount from prices', () => {
  near(calc.discountFromPrices(200, 150).pct, 25);
  assert.ok(calc.discountFromPrices(100, 150).error);
});
test('break-even', () => {
  const r = calc.breakEven(5000, 6, 10, 0);
  assert.strictEqual(r.units, 1250); near(r.revenue, 12500);
  assert.strictEqual(calc.breakEven(1000, 3, 10, 0).units, 143);
  assert.strictEqual(calc.breakEven(1000, 3, 10, 700).targetUnits, 243);
  assert.ok(calc.breakEven(100, 10, 10, 0).error);
  assert.ok(calc.breakEven(100, 12, 10, 0).error);
});
test('vat', () => {
  const a = calc.vatAdd(1000, 7.5);
  near(a.vat, 75); near(a.gross, 1075);
  const r = calc.vatRemove(1075, 7.5);
  near(r.net, 1000); near(r.vat, 75);
  near(calc.vatRemove(100, 0).vat, 0);
});
test('percentages', () => {
  near(calc.percentOf(15, 200).value, 30);
  near(calc.whatPercent(30, 200).pct, 15);
  assert.ok(calc.whatPercent(1, 0).error);
  near(calc.percentChange(50, 75).pct, 50);
  near(calc.percentChange(80, 60).pct, -25);
  assert.ok(calc.percentChange(0, 5).error);
  near(calc.applyPercent(200, 10, 'increase').result, 220);
  near(calc.applyPercent(200, 10, 'decrease').result, 180);
});
test('invoice totals round per line', () => {
  const t = calc.invoiceTotals([{ qty: 3, price: 19.99 }, { qty: 1, price: 0.05 }], 10, 7.5);
  near(t.lines[0], 59.97); near(t.subtotal, 60.02); near(t.discount, 6.0);
  near(t.tax, 4.05); near(t.total, 58.07);
});
test('word stats', () => {
  const s = calc.wordStats('Hello world. This is a test!\n\nSecond paragraph here?');
  assert.strictEqual(s.words, 9); assert.strictEqual(s.sentences, 3); assert.strictEqual(s.paragraphs, 2);
  assert.strictEqual(calc.wordStats('').words, 0);
  assert.strictEqual(calc.wordStats('   ').paragraphs, 0);
  assert.strictEqual(calc.wordStats('a b').charsNoSpaces, 2);
});
test('json problem location', () => {
  const text = '{\n  "a": 1,\n  "b": }';
  let err;
  try { JSON.parse(text); } catch (e) { err = e; }
  const p = calc.jsonProblem(text, err);
  assert.ok(p.message.length > 0);
  if (p.line !== null) assert.strictEqual(p.line, 3);
});
test('json scanner locates errors and accepts valid text', () => {
  const cases = [['{\n "a": 1,\n "b": }', 3, 7], ['[1,2,]', 1, 6], ['{"a":1,}', 1, 8], ['{a:1}', 1, 2], ['[1 2]', 1, 4], ['{"a":1', 1, 7]];
  for (const [text, line, col] of cases) {
    let err;
    try { JSON.parse(text); } catch (e) { err = e; }
    assert.ok(err, 'JSON.parse should reject ' + text);
    const p = calc.jsonProblem(text, err);
    assert.deepStrictEqual([p.line, p.col], [line, col], text);
  }
  const valid = [JSON.stringify({ a: [1, 2, { b: null, c: 'é\n"\\', d: -1.5e3, e: true }] }), '0', '"x"', '[]', '{}', ' [ ] '];
  valid.forEach((text) => { JSON.parse(text); assert.strictEqual(calc.jsonScan(text), null, text); });
});
test('sortKeys', () => {
  assert.strictEqual(JSON.stringify(calc.sortKeys({ b: 1, a: { d: 1, c: [{ z: 1, y: 2 }] } })), '{"a":{"c":[{"y":2,"z":1}],"d":1},"b":1}');
});

// ---- QR ----
function decode(qr, scale = 4, border = 4) {
  const dim = (qr.size + border * 2) * scale;
  const px = new Uint8ClampedArray(dim * dim * 4).fill(255);
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (!qr.modules[y][x]) continue;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const i = (((y + border) * scale + dy) * dim + (x + border) * scale + dx) * 4;
          px[i] = px[i + 1] = px[i + 2] = 0;
        }
      }
    }
  }
  const out = jsQR(px, dim, dim);
  return out && out.data;
}

const sample = (n) => {
  let s = '';
  for (let i = 0; i < n; i++) s += String.fromCharCode(97 + (i * 7 + (i >> 3)) % 26);
  return s;
};

test('QR round trip across versions and levels', () => {
  const lengths = [1, 12, 26, 60, 150, 300, 700, 1200, 2000];
  let versions = new Set();
  for (const ecl of ['L', 'M', 'Q', 'H']) {
    for (const n of lengths) {
      const text = sample(n);
      let qr;
      try { qr = E11QR.encode(text, { ecl }); } catch (e) { assert.ok(/Too much data/.test(e.message)); continue; }
      versions.add(qr.version);
      assert.strictEqual(decode(qr), text, 'ecl ' + ecl + ' length ' + n + ' version ' + qr.version);
    }
  }
  assert.ok(versions.size >= 8, 'covered ' + versions.size + ' versions');
});
test('QR every version and level matches the qrcode package', () => {
  // The package is the reference grid. jsQR has trouble with a few large
  // versions (23 at small scales), so a decode miss only counts as a failure
  // when the reference grid decodes and ours does not.
  const asQr = (ref) => ({ size: ref.modules.size, modules: Array.from({ length: ref.modules.size }, (_, y) =>
    Array.from({ length: ref.modules.size }, (_, x) => !!ref.modules.get(y, x))) });
  for (const ecl of ['L', 'M', 'Q', 'H']) {
    for (let v = 1; v <= 40; v++) {
      const text = 'v' + v;
      const mine = E11QR.encode(text, { ecl, minVersion: v, mask: 3 });
      const ref = asQr(QRCode.create(text, { errorCorrectionLevel: ecl, maskPattern: 3, version: v }));
      assert.strictEqual(mine.version, v);
      assert.deepStrictEqual(mine.modules, ref.modules, ecl + ' version ' + v);
      const auto = E11QR.encode(text, { ecl, minVersion: v });
      const got = decode(auto, 3) || decode(auto, 6);
      if (got !== text) {
        const refAuto = decode(asQr(QRCode.create(text, { errorCorrectionLevel: ecl, version: v })), 3);
        assert.ok(refAuto !== text, 'ours failed to decode but the reference decodes: ' + ecl + ' ' + v);
      }
    }
  }
});
test('QR handles unicode and urls', () => {
  for (const text of ['https://elevven11studio.github.io/tools/?a=1&b=2', 'Café ₦5,000 日本語', 'WIFI:T:WPA;S:Home;P:pass;;']) {
    assert.strictEqual(decode(E11QR.encode(text, { ecl: 'M' })), text);
  }
});
test('QR matches the qrcode package for the same mask', () => {
  for (const ecl of ['L', 'M', 'Q', 'H']) {
    for (const text of ['hello', 'https://example.com/a/very/long/path?with=query&and=more#hash', sample(400)]) {
      const mine = E11QR.encode(text, { ecl, mask: 3 });
      const ref = QRCode.create(text, { errorCorrectionLevel: ecl, maskPattern: 3, version: mine.version });
      assert.strictEqual(ref.modules.size, mine.size);
      for (let y = 0; y < mine.size; y++) {
        for (let x = 0; x < mine.size; x++) {
          assert.strictEqual(!!ref.modules.get(y, x), mine.modules[y][x], ecl + ' ' + text.length + ' @' + x + ',' + y);
        }
      }
    }
  }
});
test('QR rejects oversize input', () => {
  assert.throws(() => E11QR.encode(sample(3000), { ecl: 'L' }), /Too much data/);
});
test('QR svg output', () => {
  const svg = E11QR.toSvg(E11QR.encode('x'), { border: 2 });
  assert.ok(svg.startsWith('<svg') && svg.includes('viewBox="0 0 25 25"'));
});

console.log(passed + ' passed' + (process.exitCode ? ', some FAILED' : ''));
