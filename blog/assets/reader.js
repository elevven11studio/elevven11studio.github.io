/*
 * Reader state for the blog, kept only in this browser (localStorage).
 * Post pages: a reading progress bar, the reader's place saved as they go, and
 * a Resume button when they come back part-way through.
 * Any blog page: post cards show "Read" or "40% read".
 * Everything degrades to the plain page if storage is blocked.
 */
(function () {
  var KEY = 'e11-blog-reading';
  var DONE = 95;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
  }
  var state = load();
  var norm = function (p) { return p.replace(/index\.html$/, '').replace(/\/?$/, '/'); };

  // ---- badges on cards ----
  function badges() {
    var cards = document.querySelectorAll('.b-card');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var entry = state[norm(c.getAttribute('href'))];
      var meta = c.querySelector('.b-meta');
      var old = c.querySelector('.b-state');
      if (old) old.parentNode.removeChild(old);
      c.classList.remove('is-read');
      if (!entry || !meta || entry.p < 5) continue;
      var done = entry.p >= DONE;
      var tag = document.createElement('span');
      tag.className = 'b-state' + (done ? ' is-done' : '');
      tag.textContent = done ? 'Read' : entry.p + '% read';
      meta.appendChild(tag);
      if (done) c.classList.add('is-read');
    }
  }
  badges();

  // ---- post pages ----
  var prose = document.querySelector('.b-prose');
  if (!prose) return;
  var here = norm(location.pathname);
  var prev = state[here];

  var bar = document.createElement('div');
  bar.className = 'b-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<span></span>';
  document.body.appendChild(bar);
  var fill = bar.firstChild;

  // Progress runs from the top of the article text to its last line reaching
  // the bottom of the screen.
  function percent() {
    var r = prose.getBoundingClientRect();
    var total = r.height - window.innerHeight * 0.6;
    if (total <= 0) return r.bottom <= window.innerHeight ? 100 : 0;
    var done = -r.top + window.innerHeight * 0.4;
    return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
  }
  function scrollToPercent(p) {
    var r = prose.getBoundingClientRect();
    var total = r.height - window.innerHeight * 0.6;
    var y = window.pageYOffset + r.top - window.innerHeight * 0.4 + (total * p) / 100;
    // A direct jump: a smooth scroll can drift while the page is still laying
    // out, and the site's CSS would otherwise make even 'auto' smooth.
    window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
  }

  var best = prev ? prev.p : 0;
  var resume;
  var pending = false;

  function update() {
    pending = false;
    var p = percent();
    fill.style.transform = 'scaleX(' + p / 100 + ')';
    // Save the furthest point reached. It only ever grows, so a finished post
    // stays "Read" when someone scrolls back up to re-read part of it.
    if (p > best) {
      best = p;
      state = load();
      state[here] = { p: best, t: Date.now() };
      save(state);
    }
    if (resume && p >= prev.p - 2) hideResume();
  }

  window.addEventListener('scroll', function () {
    if (!pending) { pending = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);

  function hideResume() {
    if (!resume) return;
    resume.parentNode.removeChild(resume);
    resume = null;
  }

  // Offer to pick up where they left off, without jumping on its own.
  if (prev && prev.p >= 5 && prev.p < DONE && percent() < prev.p - 5) {
    resume = document.createElement('button');
    resume.type = 'button';
    resume.className = 'b-resume';
    resume.textContent = 'Resume reading (' + prev.p + '%)';
    resume.addEventListener('click', function () {
      var target = prev.p;
      hideResume();
      scrollToPercent(target);
    });
    document.body.appendChild(resume);
  }

  update();
})();
