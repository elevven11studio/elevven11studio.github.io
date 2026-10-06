/*
 * Small QR code encoder: byte mode, versions 1 to 40, error correction L/M/Q/H.
 * Written for Elevven11 Tools so the QR page needs no library and nothing is
 * sent anywhere. Checked against a real decoder in scripts/test-tools.js.
 *
 *   var qr = E11QR.encode('https://example.com', { ecl: 'M' });
 *   qr.size, qr.modules[y][x] (true = dark)
 *   E11QR.toSvg(qr, { border: 4, fg: '#000', bg: '#fff' })
 *   E11QR.toCanvas(qr, canvas, { scale: 8, border: 4, fg: '#000', bg: '#fff' })
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.E11QR = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Index 0 is unused so the tables read by version number.
  var ECC_PER_BLOCK = {
    L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
  };
  var NUM_BLOCKS = {
    L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
  };
  var FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 };

  function rawModules(ver) {
    var n = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var a = Math.floor(ver / 7) + 2;
      n -= (25 * a - 10) * a - 55;
      if (ver >= 7) n -= 36;
    }
    return n;
  }

  function dataCodewords(ver, ecl) {
    return Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ecl][ver] * NUM_BLOCKS[ecl][ver];
  }

  function utf8(text) {
    if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(text));
    var s = unescape(encodeURIComponent(text)), out = [];
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }

  function rsDivisor(degree) {
    var r = [], i, j;
    for (i = 0; i < degree; i++) r.push(0);
    r[degree - 1] = 1;
    var rootPow = 1;
    for (i = 0; i < degree; i++) {
      for (j = 0; j < degree; j++) {
        r[j] = gfMul(r[j], rootPow);
        if (j + 1 < degree) r[j] ^= r[j + 1];
      }
      rootPow = gfMul(rootPow, 0x02);
    }
    return r;
  }

  function rsRemainder(data, divisor) {
    var r = divisor.map(function () { return 0; });
    data.forEach(function (b) {
      var factor = b ^ r.shift();
      r.push(0);
      divisor.forEach(function (coef, i) { r[i] ^= gfMul(coef, factor); });
    });
    return r;
  }

  function alignPositions(ver) {
    if (ver === 1) return [];
    var n = Math.floor(ver / 7) + 2;
    var step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
    var out = [6];
    for (var pos = ver * 4 + 10; out.length < n; pos -= step) out.splice(1, 0, pos);
    return out;
  }

  function bit(x, i) { return ((x >>> i) & 1) !== 0; }

  function buildData(bytes, ver, ecl) {
    var bits = [];
    var push = function (val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    push(0x4, 4);
    push(bytes.length, ver <= 9 ? 8 : 16);
    bytes.forEach(function (b) { push(b, 8); });
    var cap = dataCodewords(ver, ecl) * 8;
    push(0, Math.min(4, cap - bits.length));
    push(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) push(pad, 8);
    var out = [];
    for (var i = 0; i < bits.length; i += 8) {
      var v = 0;
      for (var j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
      out.push(v);
    }
    return out;
  }

  function interleave(data, ver, ecl) {
    var nb = NUM_BLOCKS[ecl][ver];
    var eccLen = ECC_PER_BLOCK[ecl][ver];
    var raw = Math.floor(rawModules(ver) / 8);
    var shortBlocks = nb - raw % nb;
    var shortLen = Math.floor(raw / nb);
    var divisor = rsDivisor(eccLen);
    var blocks = [], k = 0;
    for (var i = 0; i < nb; i++) {
      var len = shortLen - eccLen + (i < shortBlocks ? 0 : 1);
      var dat = data.slice(k, k + len);
      k += len;
      var ecc = rsRemainder(dat, divisor);
      if (i < shortBlocks) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var out = [];
    for (var c = 0; c < blocks[0].length; c++) {
      for (var b = 0; b < blocks.length; b++) {
        if (c !== shortLen - eccLen || b >= shortBlocks) out.push(blocks[b][c]);
      }
    }
    return out;
  }

  function penalty(m, size) {
    var score = 0, x, y, run, prev;
    var lineScore = function (get) {
      var s = '';
      for (var a = 0; a < size; a++) {
        run = 1; prev = get(a, 0);
        s = prev ? '1' : '0';
        for (var b = 1; b < size; b++) {
          var cur = get(a, b);
          s += cur ? '1' : '0';
          if (cur === prev) { run++; if (run === 5) score += 3; else if (run > 5) score += 1; }
          else { run = 1; prev = cur; }
        }
        s += ';';
      }
      var re = /(?=(10111010000|00001011101))/g, hit;
      while ((hit = re.exec(s))) { score += 40; re.lastIndex = hit.index + 1; }
    };
    lineScore(function (a, b) { return m[a][b]; });
    lineScore(function (a, b) { return m[b][a]; });
    for (y = 0; y < size - 1; y++) {
      for (x = 0; x < size - 1; x++) {
        var c = m[y][x];
        if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) score += 3;
      }
    }
    var dark = 0;
    m.forEach(function (row) { row.forEach(function (v) { if (v) dark++; }); });
    var total = size * size;
    score += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
    return score;
  }

  function maskFn(mask) {
    return [
      function (x, y) { return (x + y) % 2 === 0; },
      function (x, y) { return y % 2 === 0; },
      function (x, y) { return x % 3 === 0; },
      function (x, y) { return (x + y) % 3 === 0; },
      function (x, y) { return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; },
      function (x, y) { return x * y % 2 + x * y % 3 === 0; },
      function (x, y) { return (x * y % 2 + x * y % 3) % 2 === 0; },
      function (x, y) { return ((x + y) % 2 + x * y % 3) % 2 === 0; }
    ][mask];
  }

  function encode(text, opts) {
    opts = opts || {};
    var ecl = opts.ecl || 'M';
    if (!ECC_PER_BLOCK[ecl]) throw new Error('Unknown error correction level.');
    var bytes = utf8(text);

    var ver = Math.max(1, opts.minVersion || 1);
    for (;; ver++) {
      if (ver > 40) throw new Error('Too much data for a QR code. Shorten the text or lower the error correction.');
      var need = 4 + (ver <= 9 ? 8 : 16) + bytes.length * 8;
      if (need <= dataCodewords(ver, ecl) * 8) break;
    }

    var size = ver * 4 + 17;
    var mod = [], isFn = [], i, j;
    for (i = 0; i < size; i++) {
      mod.push(new Array(size).fill(false));
      isFn.push(new Array(size).fill(false));
    }
    var setFn = function (x, y, dark) { mod[y][x] = dark; isFn[y][x] = true; };

    for (i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }
    var finder = function (cx, cy) {
      for (var dy = -4; dy <= 4; dy++) {
        for (var dx = -4; dx <= 4; dx++) {
          var d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy;
          if (x >= 0 && x < size && y >= 0 && y < size) setFn(x, y, d !== 2 && d !== 4);
        }
      }
    };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    var ap = alignPositions(ver);
    for (i = 0; i < ap.length; i++) {
      for (j = 0; j < ap.length; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === ap.length - 1) || (i === ap.length - 1 && j === 0)) continue;
        for (var ay = -2; ay <= 2; ay++) {
          for (var ax = -2; ax <= 2; ax++) setFn(ap[i] + ax, ap[j] + ay, Math.max(Math.abs(ax), Math.abs(ay)) !== 1);
        }
      }
    }

    var drawFormat = function (mask) {
      var d = (FORMAT_BITS[ecl] << 3) | mask, rem = d, k;
      for (k = 0; k < 10; k++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var bits = ((d << 10) | rem) ^ 0x5412;
      for (k = 0; k <= 5; k++) setFn(8, k, bit(bits, k));
      setFn(8, 7, bit(bits, 6)); setFn(8, 8, bit(bits, 7)); setFn(7, 8, bit(bits, 8));
      for (k = 9; k < 15; k++) setFn(14 - k, 8, bit(bits, k));
      for (k = 0; k < 8; k++) setFn(size - 1 - k, 8, bit(bits, k));
      for (k = 8; k < 15; k++) setFn(8, size - 15 + k, bit(bits, k));
      setFn(8, size - 8, true);
    };
    drawFormat(0);
    if (ver >= 7) {
      var rem = ver, k;
      for (k = 0; k < 12; k++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var vbits = (ver << 12) | rem;
      for (k = 0; k < 18; k++) {
        var a = size - 11 + k % 3, b = Math.floor(k / 3);
        setFn(a, b, bit(vbits, k)); setFn(b, a, bit(vbits, k));
      }
    }

    var codewords = interleave(buildData(bytes, ver, ecl), ver, ecl);
    var n = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (j = 0; j < 2; j++) {
          var x = right - j;
          var y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
          if (!isFn[y][x] && n < codewords.length * 8) {
            mod[y][x] = bit(codewords[n >>> 3], 7 - (n & 7));
            n++;
          }
        }
      }
    }

    var applyMask = function (mask) {
      var f = maskFn(mask);
      for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) if (!isFn[y][x] && f(x, y)) mod[y][x] = !mod[y][x];
      }
    };

    var best = opts.mask, bestScore = Infinity;
    if (best === undefined || best === null) {
      for (var mk = 0; mk < 8; mk++) {
        applyMask(mk); drawFormat(mk);
        var p = penalty(mod, size);
        if (p < bestScore) { bestScore = p; best = mk; }
        applyMask(mk);
      }
    }
    applyMask(best);
    drawFormat(best);
    return { version: ver, size: size, mask: best, ecl: ecl, modules: mod };
  }

  function toSvg(qr, o) {
    o = o || {};
    var border = o.border === undefined ? 4 : o.border;
    var fg = o.fg || '#000000', bg = o.bg || '#ffffff';
    var dim = qr.size + border * 2;
    var d = '';
    for (var y = 0; y < qr.size; y++) {
      for (var x = 0; x < qr.size; x++) {
        if (qr.modules[y][x]) d += 'M' + (x + border) + ',' + (y + border) + 'h1v1h-1z';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + dim + ' ' + dim + '" shape-rendering="crispEdges">' +
      '<rect width="100%" height="100%" fill="' + bg + '"/><path d="' + d + '" fill="' + fg + '"/></svg>';
  }

  function toCanvas(qr, canvas, o) {
    o = o || {};
    var border = o.border === undefined ? 4 : o.border;
    var scale = o.scale || 8;
    var dim = (qr.size + border * 2) * scale;
    canvas.width = dim; canvas.height = dim;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = o.bg || '#ffffff';
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = o.fg || '#000000';
    for (var y = 0; y < qr.size; y++) {
      for (var x = 0; x < qr.size; x++) {
        if (qr.modules[y][x]) ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
      }
    }
  }

  return { encode: encode, toSvg: toSvg, toCanvas: toCanvas };
});
