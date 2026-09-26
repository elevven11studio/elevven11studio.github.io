/* Wires /webinspect/try/ to the bundled checks in webinspect.js. Report text
   is quoted from someone else's page, so it goes in with textContent only. */
(function () {
	'use strict';
	var I = window.WebInspectDemo;
	if (!I) return;

	function el(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text != null) node.textContent = text;
		return node;
	}

	/* ------------------------------------------------------------ page --- */
	var MAX_ISSUES = 10;
	var urlForm = document.getElementById('url-form');
	var urlInput = document.getElementById('url-input');
	var urlSubmit = document.getElementById('url-submit');
	var urlResult = document.getElementById('url-result');

	function renderReport(report) {
		var score = report.score;
		var head = el('div', 'try-verdict band-' + I.scoreBand(score.overall));
		head.append(el('span', null, I.scoreLabel(score.overall)));
		head.append(el('span', 'score', (score.overall == null ? '-' : score.overall) + ' / 100 on ' + report.hostname));
		urlResult.append(head);

		var cats = el('div', 'try-grades try-cats');
		score.categories.forEach(function (cat) {
			if (cat.score == null) return;
			var tile = el('div');
			tile.append(el('span', 'value band-' + I.scoreBand(cat.score), String(cat.score)));
			tile.append(el('span', 'name', I.CATEGORY_LABELS[cat.category] || cat.category));
			cats.append(tile);
		});
		urlResult.append(cats);

		if (report.technology.length) {
			var tech = el('div', 'try-chips');
			tech.append(el('span', 'try-tag', 'Built with'));
			report.technology.forEach(function (t) { tech.append(el('span', 'try-chip', t.name)); });
			urlResult.append(tech);
		}

		var issues = report.issues.filter(function (i) { return i.severity !== 'info'; });
		if (!issues.length) {
			urlResult.append(el('p', 'try-note', 'No issues found by the checks that ran.'));
			return;
		}
		var list = el('ul', 'try-list');
		issues.slice(0, MAX_ISSUES).forEach(function (issue) {
			var item = el('li');
			var title = el('strong');
			title.append(el('span', 'try-tag', issue.severity), issue.title);
			item.append(title, el('p', null, issue.description));
			if (issue.recommendation) item.append(el('p', 'try-fix', issue.recommendation));
			(issue.evidence || []).slice(0, 3).forEach(function (line) {
				item.append(el('div', 'detail', line));
			});
			list.append(item);
		});
		urlResult.append(list);
		if (issues.length > MAX_ISSUES) {
			urlResult.append(el('p', 'try-note', (issues.length - MAX_ISSUES) + ' more in the full report in the extension.'));
		}
	}

	urlForm.addEventListener('submit', function (event) {
		event.preventDefault();
		urlSubmit.disabled = true;
		urlSubmit.textContent = 'Inspecting...';
		urlResult.hidden = false;
		urlResult.replaceChildren(el('p', 'try-note', 'Fetching and checking the page. This takes a few seconds.'));
		I.inspectUrl(urlInput.value).then(function (report) {
			urlResult.replaceChildren();
			renderReport(report);
			if (typeof gtag === 'function') gtag('event', 'extension_demo', { tool: 'inspect' });
		}, function (error) {
			urlResult.replaceChildren(el('p', 'try-note', error.message));
		}).then(function () {
			urlSubmit.disabled = false;
			urlSubmit.textContent = 'Inspect';
		});
	});

	/* -------------------------------------------------------- contrast --- */
	var fgPick = document.getElementById('fg-pick');
	var bgPick = document.getElementById('bg-pick');
	var fgText = document.getElementById('fg-text');
	var bgText = document.getElementById('bg-text');
	var preview = document.getElementById('preview');
	var ratio = document.getElementById('ratio');
	var normal = document.getElementById('normal');
	var large = document.getElementById('large');
	var note = document.getElementById('contrast-note');
	var tracked = false;

	function grade(node, level) {
		node.textContent = level === 'fail' ? 'Fail' : level;
		node.className = 'value ' + (level === 'fail' ? 'fail' : 'pass');
	}

	/* The extension reads computed styles, which are always rgb()/rgba(). A
	   visitor can type hsl(), a name or any other syntax, so the browser turns
	   it into the computed form first. Invalid input comes back null. */
	var probe = document.createElement('span');
	function computed(value) {
		value = value.trim();
		if (!value || !CSS.supports('color', value)) return null;
		probe.style.color = value;
		document.body.append(probe);
		var out = getComputedStyle(probe).color;
		probe.remove();
		return out;
	}

	function update() {
		var fg = computed(fgText.value);
		var bg = computed(bgText.value);
		var result = fg && bg ? I.checkContrast(fg, bg) : null;
		if (!result) {
			ratio.textContent = normal.textContent = large.textContent = '-';
			normal.className = large.className = 'value';
			note.textContent = 'Use a colour like #1a1a1a, rgb(26, 26, 26) or hsl(0 0% 10%).';
			return;
		}
		preview.style.color = fg;
		preview.style.background = bg;
		ratio.textContent = result.label;
		grade(normal, result.normal);
		grade(large, result.large);
		note.textContent = 'WCAG asks for 4.5:1 on body text and 3:1 on large text (AA), 7:1 and 4.5:1 for AAA.';
		if (!tracked && typeof gtag === 'function') {
			tracked = true;
			gtag('event', 'extension_demo', { tool: 'contrast' });
		}
	}

	function syncPicker(picker, text) {
		// The native picker only takes #rrggbb; leave it alone for other syntaxes.
		if (/^#[0-9a-f]{6}$/i.test(text.value.trim())) picker.value = text.value.trim();
	}

	fgPick.addEventListener('input', function () { fgText.value = fgPick.value; update(); });
	bgPick.addEventListener('input', function () { bgText.value = bgPick.value; update(); });
	fgText.addEventListener('input', function () { syncPicker(fgPick, fgText); update(); });
	bgText.addEventListener('input', function () { syncPicker(bgPick, bgText); update(); });
	update();
})();
