(function () {
  var $ = function (id) { return document.getElementById(id); };
  var type = 'url';
  var current = null;   // last encoded code
  var canvas = $('qr-canvas');

  function wifiEscape(s) { return s.replace(/([\\;,:"])/g, '\\$1'); }

  // Returns { text } or { error } or {} while the form is still empty.
  function payload() {
    var v;
    if (type === 'url') {
      v = $('q-url').value.trim();
      if (!v) return {};
      if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v) && !/^(mailto|tel|sms):/i.test(v)) v = 'https://' + v;
      try {
        var u = new URL(v);
        if (/^https?:$/.test(u.protocol) && u.hostname.indexOf('.') === -1 && u.hostname !== 'localhost') throw new Error();
      } catch (e) { return { error: 'Enter a valid web address, like example.com.' }; }
      return { text: v };
    }
    if (type === 'text') {
      v = $('q-text').value;
      return v.trim() ? { text: v } : {};
    }
    if (type === 'email') {
      v = $('q-email').value.trim();
      if (!v) return {};
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { error: 'Enter a valid email address, like name@example.com.' };
      var q = [];
      if ($('q-subject').value.trim()) q.push('subject=' + encodeURIComponent($('q-subject').value.trim()));
      if ($('q-body').value.trim()) q.push('body=' + encodeURIComponent($('q-body').value.trim()));
      return { text: 'mailto:' + v + (q.length ? '?' + q.join('&') : '') };
    }
    if (type === 'phone') {
      v = $('q-phone').value.trim();
      if (!v) return {};
      var digits = v.replace(/[^\d]/g, '');
      if (!/^\+?[\d\s().-]+$/.test(v) || digits.length < 5) return { error: 'Enter a phone number with at least 5 digits.' };
      return { text: 'tel:' + (v.charAt(0) === '+' ? '+' : '') + digits };
    }
    var ssid = $('q-ssid').value;
    if (!ssid.trim()) return {};
    var sec = $('q-sec').value;
    if (sec !== 'nopass' && !$('q-pass').value) return { error: 'Enter the Wi-Fi password, or choose None for an open network.' };
    return {
      text: 'WIFI:T:' + sec + ';S:' + wifiEscape(ssid) + ';' +
        (sec === 'nopass' ? '' : 'P:' + wifiEscape($('q-pass').value) + ';') +
        ($('q-hidden').checked ? 'H:true;' : '') + ';'
    };
  }

  function luminance(hex) {
    var n = parseInt(hex.slice(1), 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (x) {
      x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function opts() { return { border: 4, fg: $('q-fg').value, bg: $('q-bg').value }; }

  function render() {
    var p = payload();
    var err = $('q-error');
    err.hidden = !p.error;
    err.textContent = p.error || '';
    current = null;
    if (p.text) {
      try { current = E11QR.encode(p.text, { ecl: $('q-ecl').value }); }
      catch (e) { err.hidden = false; err.textContent = e.message; }
    }
    $('qr-frame').hidden = !current;
    $('qr-actions').hidden = !current;
    $('qr-empty').hidden = !!current;
    var warn = $('qr-warn');
    warn.hidden = true;
    if (current) {
      var o = opts();
      E11QR.toCanvas(current, canvas, { scale: 8, border: 4, fg: o.fg, bg: o.bg });
      var l1 = luminance(o.fg), l2 = luminance(o.bg);
      var ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      if (l1 > l2) { warn.hidden = false; warn.textContent = 'The code is lighter than the background. Many scanners cannot read this.'; }
      else if (ratio < 4) { warn.hidden = false; warn.textContent = 'Low contrast. Use a darker code or a lighter background so it scans.'; }
      E11T.trackOnce('tool_completed');
    }
  }

  function setType(t) {
    type = t;
    Array.prototype.forEach.call(document.querySelectorAll('.t-tab'), function (b) {
      b.setAttribute('aria-selected', String(b.getAttribute('data-type') === t));
      b.tabIndex = b.getAttribute('data-type') === t ? 0 : -1;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-for]'), function (d) {
      d.hidden = d.getAttribute('data-for') !== t;
    });
    $('qr-fields').setAttribute('aria-labelledby', 'tab-' + t);
    render();
  }

  var tabs = document.querySelector('.t-tabs');
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('.t-tab');
    if (b) setType(b.getAttribute('data-type'));
  });
  tabs.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var list = Array.prototype.slice.call(tabs.querySelectorAll('.t-tab'));
    var i = list.indexOf(document.activeElement);
    if (i < 0) return;
    var next = list[(i + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length];
    next.focus();
    setType(next.getAttribute('data-type'));
    e.preventDefault();
  });

  document.querySelector('.t-layout').addEventListener('input', function () { E11T.trackOnce('tool_used'); render(); });
  document.querySelector('.t-layout').addEventListener('change', render);

  document.querySelector('#qr-actions').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || !current) return;
    var o = opts();
    var act = b.getAttribute('data-act');
    if (act === 'svg') {
      E11T.download('qr-code.svg', E11QR.toSvg(current, o), 'image/svg+xml');
    } else {
      var big = document.createElement('canvas');
      E11QR.toCanvas(current, big, { scale: Math.max(8, Math.ceil(1024 / (current.size + 8))), border: 4, fg: o.fg, bg: o.bg });
      big.toBlob(function (blob) {
        if (!blob) { E11T.toast('Could not create the image in this browser'); return; }
        if (act === 'png') { E11T.download('qr-code.png', blob); return; }
        if (navigator.clipboard && window.ClipboardItem) {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            .then(function () { E11T.toast('Image copied'); }, function () { E11T.toast('Copying images is not allowed here. Use Download PNG.'); });
        } else E11T.toast('Copying images is not supported here. Use Download PNG.');
      }, 'image/png');
    }
  });

  setType('url');
})();
