(function () {
  var input = document.getElementById('tool-search');
  var grid = document.getElementById('tool-grid');
  var empty = document.getElementById('tool-empty');
  var live = document.getElementById('tool-live');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.t-chip'));
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.t-card'));
  var cat = 'all';

  function apply() {
    var q = input.value.trim().toLowerCase();
    var terms = q ? q.split(/\s+/) : [];
    var shown = 0;
    cards.forEach(function (c) {
      var hay = c.getAttribute('data-search');
      var ok = (cat === 'all' || c.getAttribute('data-cat') === cat) && terms.every(function (t) { return hay.indexOf(t) !== -1; });
      c.hidden = !ok;
      if (ok) shown++;
    });
    empty.hidden = shown !== 0;
    grid.hidden = shown === 0;
    live.textContent = shown + (shown === 1 ? ' tool' : ' tools') + ' shown';
    chips.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === cat)); });
  }

  function setCat(c, updateHash) {
    cat = chips.some(function (b) { return b.getAttribute('data-cat') === c; }) ? c : 'all';
    if (updateHash) {
      try { history.replaceState(null, '', cat === 'all' ? location.pathname : '#' + cat); } catch (e) { /* ignore */ }
    }
    apply();
  }

  input.addEventListener('input', apply);
  chips.forEach(function (b) { b.addEventListener('click', function () { setCat(b.getAttribute('data-cat'), true); }); });
  document.getElementById('tool-reset').addEventListener('click', function () { input.value = ''; setCat('all', true); input.focus(); });
  window.addEventListener('hashchange', function () { setCat(location.hash.slice(1), false); });
  setCat(location.hash.slice(1), false);
  live.textContent = '';
})();
