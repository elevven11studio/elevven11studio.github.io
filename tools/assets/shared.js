/*
 * Shared behaviour for Elevven11 Tools pages: number parsing, validation,
 * formatting, copy, download, share and anonymous usage events.
 *
 * Nothing the visitor types is ever sent anywhere. Analytics events carry only
 * the tool id, never a value.
 */
(function () {
  'use strict';

  var toolId = (document.body && document.body.getAttribute('data-tool')) || '';
  var CURRENCY_KEY = 'e11-tools-currency';

  // ---- analytics: names only, never values ----
  var sent = {};
  function track(name, extra) {
    try {
      if (typeof gtag !== 'function') return;
      var p = { tool_id: toolId };
      if (extra) for (var k in extra) p[k] = extra[k];
      gtag('event', name, p);
    } catch (e) { /* analytics must never break a tool */ }
  }
  function trackOnce(name) {
    if (sent[name]) return;
    sent[name] = true;
    track(name);
  }

  // ---- storage that survives private mode ----
  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
    } catch (e) { /* storage unavailable: carry on without it */ }
    return null;
  }

  // ---- currency ----
  var currency = store(CURRENCY_KEY) || 'NGN';
  var listeners = [];
  function money(n, opts) {
    if (!isFinite(n)) return '';
    var code = currency;
    var digits = opts && opts.digits !== undefined ? opts.digits : 2;
    if (code === 'NONE') return n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    try {
      return n.toLocaleString(undefined, { style: 'currency', currency: code, minimumFractionDigits: digits, maximumFractionDigits: digits });
    } catch (e) {
      return code + ' ' + n.toFixed(digits);
    }
  }
  function num(n, max) {
    if (!isFinite(n)) return '';
    return n.toLocaleString(undefined, { maximumFractionDigits: max === undefined ? 2 : max });
  }
  function pct(n) {
    if (n === null || n === undefined || !isFinite(n)) return 'Not defined';
    return num(n, 2) + '%';
  }
  var fmt = { money: money, num: num, pct: pct };

  function initCurrency() {
    var sel = document.querySelector('[data-currency]');
    if (!sel) return;
    if (Array.prototype.some.call(sel.options, function (o) { return o.value === currency; })) sel.value = currency;
    sel.addEventListener('change', function () {
      currency = sel.value;
      store(CURRENCY_KEY, currency);
      listeners.forEach(function (fn) { fn(); });
    });
  }

  // ---- fields and validation ----
  function parse(el) {
    var raw = String(el.value).trim().replace(/,/g, '');
    if (raw === '') return NaN;
    var n = Number(raw);
    return isFinite(n) ? n : NaN;
  }

  function errorBox(el) {
    var id = el.id + '-err';
    var box = document.getElementById(id);
    if (!box) {
      box = document.createElement('div');
      box.id = id;
      box.className = 't-error';
      box.setAttribute('role', 'alert');
      box.hidden = true;
      el.parentNode.appendChild(box);
      el.setAttribute('aria-describedby', ((el.getAttribute('aria-describedby') || '') + ' ' + id).trim());
    }
    return box;
  }
  function showError(el, msg) {
    var box = errorBox(el);
    if (msg) { box.textContent = msg; box.hidden = false; el.setAttribute('aria-invalid', 'true'); }
    else { box.textContent = ''; box.hidden = true; el.removeAttribute('aria-invalid'); }
  }

  function check(el, touched) {
    var rule = el.getAttribute('data-rule') || 'gte0';
    var label = el.getAttribute('data-label') || 'value';
    var optional = el.hasAttribute('data-optional');
    var v = parse(el);
    var empty = String(el.value).trim() === '';
    if (empty) {
      if (optional) return { ok: true, value: 0, empty: true };
      return { ok: false, msg: touched ? 'Enter ' + label + '.' : '', empty: true };
    }
    if (isNaN(v)) return { ok: false, msg: 'Enter ' + label + ' as a number.' };
    if (rule === 'gt0' && v <= 0) return { ok: false, msg: 'Enter ' + label + ' greater than zero.' };
    if (rule === 'gte0' && v < 0) return { ok: false, msg: 'Enter ' + label + ' of zero or more.' };
    if (rule === 'pct100' && (v < 0 || v > 100)) return { ok: false, msg: 'Enter ' + label + ' between 0 and 100.' };
    if (rule === 'int1' && (v < 1 || Math.floor(v) !== v)) return { ok: false, msg: 'Enter ' + label + ' as a whole number of 1 or more.' };
    return { ok: true, value: v };
  }

  function setOutputs(form, out) {
    var nodes = form.querySelectorAll('[data-out]');
    Array.prototype.forEach.call(nodes, function (n) {
      var key = n.getAttribute('data-out');
      if (out && out[key] !== undefined) n.textContent = out[key];
      else n.textContent = n.getAttribute('data-default') || '';
      n.classList.toggle('neg', /^-/.test(n.textContent));
    });
    form.classList.toggle('has-result', !!out);
  }

  /*
   * calculator(form, compute): live calculator on a <form>.
   * Inputs carry data-name, data-label and data-rule. compute(values, fmt)
   * returns { key: text } for [data-out="key"], or { error: { field, msg } }.
   */
  function calculator(form, compute) {
    if (typeof form === 'string') form = document.querySelector(form);
    if (!form) return;
    var inputs = Array.prototype.slice.call(form.querySelectorAll('[data-name]'));
    var touched = {};

    function run() {
      var values = {}, ok = true, firstBad = null;
      inputs.forEach(function (el) {
        var name = el.getAttribute('data-name');
        var r = check(el, !!touched[name]);
        var show = r.ok ? '' : r.msg;
        if (r.empty && !touched[name]) show = '';
        showError(el, show);
        if (!r.ok) { ok = false; firstBad = firstBad || el; }
        else values[name] = r.value;
      });
      if (!ok) { setOutputs(form, null); return; }
      var out = compute(values, fmt);
      if (out && out.error) {
        var target = form.querySelector('[data-name="' + out.error.field + '"]');
        if (target) showError(target, out.error.msg);
        setOutputs(form, null);
        return;
      }
      setOutputs(form, out);
      trackOnce('tool_completed');
    }

    form.addEventListener('input', function (e) {
      var n = e.target.getAttribute && e.target.getAttribute('data-name');
      if (n) touched[n] = true;
      trackOnce('tool_used');
      run();
    });
    form.addEventListener('focusout', function (e) {
      var n = e.target.getAttribute && e.target.getAttribute('data-name');
      if (n && !touched[n]) { touched[n] = true; run(); }
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    var reset = form.querySelector('[data-reset]');
    if (reset) reset.addEventListener('click', function () {
      form.reset();
      touched = {};
      inputs.forEach(function (el) { showError(el, ''); });
      setOutputs(form, null);
      if (inputs[0]) inputs[0].focus();
    });
    listeners.push(run);
    run();
    return run;
  }

  // ---- clipboard, download, toast ----
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 't-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  function copyText(text, okMsg) {
    var done = function () { toast(okMsg || 'Copied'); };
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
      if (ok) done(); else toast('Copy is not available in this browser. Select the text and copy it.');
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
  }

  function download(filename, data, mime) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    track('tool_downloaded');
  }

  function initShare() {
    var btn = document.querySelector('[data-share]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var data = { title: document.title, url: location.href.split('#')[0] };
      track('tool_shared');
      if (navigator.share) {
        navigator.share(data).catch(function () { /* dismissed */ });
      } else copyText(data.url, 'Link copied');
    });
  }

  document.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('[data-copy-target]');
    if (!c) return;
    var t = document.querySelector(c.getAttribute('data-copy-target'));
    if (!t) return;
    var text = 'value' in t ? t.value : t.textContent;
    if (text) copyText(text);
  });

  document.addEventListener('DOMContentLoaded', function () {
    initCurrency();
    initShare();
    track('tool_opened');
  });

  window.E11T = {
    calculator: calculator, fmt: fmt, parse: parse, check: check, showError: showError,
    copy: copyText, download: download, toast: toast, track: track, trackOnce: trackOnce,
    store: store, onCurrency: function (fn) { listeners.push(fn); }
  };
})();
