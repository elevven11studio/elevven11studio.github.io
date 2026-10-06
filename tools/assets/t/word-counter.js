(function () {
  var box = document.getElementById('text');
  var out = {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-s]'), function (n) { out[n.getAttribute('data-s')] = n; });

  function time(minutes) {
    var secs = Math.round(minutes * 60);
    if (secs < 60) return secs + ' sec';
    var m = Math.floor(secs / 60), s = secs % 60;
    return m + ' min' + (s ? ' ' + s + ' sec' : '');
  }

  function update() {
    var s = E11Calc.wordStats(box.value);
    out.words.textContent = s.words.toLocaleString();
    out.chars.textContent = s.chars.toLocaleString();
    out.charsNoSpaces.textContent = s.charsNoSpaces.toLocaleString();
    out.sentences.textContent = s.sentences.toLocaleString();
    out.paragraphs.textContent = s.paragraphs.toLocaleString();
    out.reading.textContent = time(s.readingMinutes);
    out.speaking.textContent = time(s.speakingMinutes);
  }

  box.addEventListener('input', function () { E11T.trackOnce('tool_used'); update(); });
  document.querySelector('[data-clear]').addEventListener('click', function () { box.value = ''; update(); box.focus(); });
  update();
})();
