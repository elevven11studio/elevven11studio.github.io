(function () {
  var bar = document.querySelector('.b-share');
  if (!bar) return;
  var url = bar.getAttribute('data-url');
  var title = bar.getAttribute('data-title');
  var status = bar.querySelector('.b-share-status');
  var native = bar.querySelector('[data-share="native"]');
  var timer;

  function say(msg) {
    status.textContent = msg;
    clearTimeout(timer);
    timer = setTimeout(function () { status.textContent = ''; }, 2500);
  }

  function track(method) {
    try { if (typeof gtag === 'function') gtag('event', 'share', { method: method, content_type: 'blog_post', item_id: location.pathname }); } catch (e) { /* ignore */ }
  }

  function copy() {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () { say('Link copied'); }, fallback);
    } else fallback();
  }

  function fallback() {
    var ta = document.createElement('textarea');
    ta.value = url;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); say('Link copied'); } catch (e) { say(url); }
    document.body.removeChild(ta);
  }

  if (navigator.share) native.hidden = false;

  bar.addEventListener('click', function (e) {
    var el = e.target.closest('[data-share]');
    if (!el) return;
    var method = el.getAttribute('data-share');
    track(method);
    if (method === 'copy') copy();
    else if (method === 'native') navigator.share({ title: title, url: url }).catch(function () { /* dismissed */ });
  });
})();
