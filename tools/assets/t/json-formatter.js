(function () {
  var box = document.getElementById('json');
  var status = document.getElementById('status');
  var indent = document.getElementById('indent');
  var sort = document.getElementById('sort');
  var timer;

  function parse() {
    var text = box.value;
    if (!text.trim()) return { empty: true };
    try { return { value: JSON.parse(text) }; }
    catch (e) { return { problem: E11Calc.jsonProblem(text, e) }; }
  }

  function show(r) {
    status.className = 't-status';
    if (r.empty) { status.textContent = ''; return; }
    if (r.problem) {
      var p = r.problem;
      status.className = 't-status bad';
      status.textContent = (p.line ? 'Line ' + p.line + ', column ' + p.col + ': ' : '') + p.message + '.';
      return;
    }
    status.className = 't-status ok';
    status.textContent = '';
  }

  function check() { show(parse()); }

  function write(minify) {
    var r = parse();
    show(r);
    if (r.empty || r.problem) return false;
    var value = sort.checked ? E11Calc.sortKeys(r.value) : r.value;
    var space = minify ? 0 : indent.value === 'tab' ? '\t' : Number(indent.value);
    box.value = JSON.stringify(value, null, space);
    E11T.trackOnce('tool_completed');
    return true;
  }

  box.addEventListener('input', function () {
    E11T.trackOnce('tool_used');
    clearTimeout(timer);
    timer = setTimeout(check, 250);
  });

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'format') write(false);
    else if (act === 'minify') write(true);
    else if (act === 'clear') { box.value = ''; check(); box.focus(); }
    else if (act === 'download') {
      var r = parse();
      show(r);
      if (r.empty) { E11T.toast('Nothing to download yet'); return; }
      if (r.problem) { E11T.toast('Fix the error before downloading'); return; }
      E11T.download('data.json', box.value, 'application/json');
    }
  });

  [indent, sort].forEach(function (el) {
    el.addEventListener('change', function () { if (parse().value !== undefined) write(false); });
  });
})();
