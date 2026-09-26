/* Wires /webguard/try/ to the bundled extension checks in webguard.js.
   Everything a visitor types is attacker-shaped input as far as this page is
   concerned, so results are built with textContent, never innerHTML. */
(function () {
	'use strict';
	var W = window.WebGuardDemo;
	if (!W) return;

	function el(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text != null) node.textContent = text;
		return node;
	}

	function track(tool) {
		if (typeof gtag === 'function') gtag('event', 'extension_demo', { tool: tool });
	}

	/* ---------------------------------------------------------- link --- */
	var LEVELS = { low: 'Low Risk', suspicious: 'Suspicious', high: 'High Risk', unknown: 'Unknown' };
	var linkForm = document.getElementById('link-form');
	var linkInput = document.getElementById('link-input');
	var linkResult = document.getElementById('link-result');

	linkForm.addEventListener('submit', function (event) {
		event.preventDefault();
		W.checkLink(linkInput.value).then(function (report) {
			linkResult.replaceChildren();
			linkResult.hidden = false;
			if (!report) {
				linkResult.append(el('p', 'try-note', 'That does not look like a web address.'));
				return;
			}
			var verdict = el('div', 'try-verdict ' + report.level);
			verdict.append(el('span', null, LEVELS[report.level]));
			verdict.append(el('span', 'score', report.securityScore + ' / 100 on ' + report.hostname));
			linkResult.append(verdict);

			var signals = report.signals.filter(function (s) { return s.severity !== 'info'; });
			if (!signals.length) {
				linkResult.append(el('p', 'try-note', 'No warning signs in the address itself.'));
			} else {
				var list = el('ul', 'try-list');
				signals.forEach(function (signal) {
					var item = el('li');
					var title = el('strong');
					title.append(el('span', 'try-tag', signal.severity), signal.title);
					item.append(title, el('p', null, signal.description));
					if (signal.detail) item.append(el('div', 'detail', signal.detail));
					list.append(item);
				});
				linkResult.append(list);
			}
			track('link');
		});
	});

	/* ------------------------------------------------------ password --- */
	var pwInput = document.getElementById('pw-input');
	var pwToggle = document.getElementById('pw-toggle');
	var pwResult = document.getElementById('pw-result');
	var pwMeter = document.getElementById('pw-meter');
	var pwLabel = document.getElementById('pw-label');
	var pwList = document.getElementById('pw-list');
	var pwBreach = document.getElementById('pw-breach');
	var pwBreachResult = document.getElementById('pw-breach-result');
	var breachNote = pwBreachResult.textContent;
	var pwTracked = false;

	pwInput.addEventListener('input', function () {
		var value = pwInput.value;
		pwBreachResult.textContent = breachNote;
		if (!value) {
			pwResult.hidden = true;
			return;
		}
		var result = W.checkPassword(value);
		pwResult.hidden = false;
		pwMeter.setAttribute('data-score', String(result.score));
		pwLabel.textContent = result.label;
		pwList.replaceChildren();
		result.warnings.forEach(function (text) {
			var item = el('li');
			item.append(el('p', null, text));
			pwList.append(item);
		});
		if (!pwTracked) { pwTracked = true; track('password'); }
	});

	pwToggle.addEventListener('click', function () {
		var show = pwInput.type === 'password';
		pwInput.type = show ? 'text' : 'password';
		pwToggle.textContent = show ? 'Hide' : 'Show';
		pwToggle.setAttribute('aria-pressed', String(show));
	});

	pwBreach.addEventListener('click', function () {
		if (!pwInput.value) return;
		pwBreach.disabled = true;
		pwBreachResult.textContent = 'Checking...';
		W.checkBreach(pwInput.value).then(function (result) {
			pwBreach.disabled = false;
			if (result.status === 'found') {
				pwBreachResult.textContent = 'Seen ' + result.count.toLocaleString() +
					' times in known breaches. Do not use it.';
			} else if (result.status === 'clean') {
				pwBreachResult.textContent = 'Not found in known breaches.';
			} else {
				pwBreachResult.textContent = 'The breach service could not be reached. Try again later.';
			}
			track('breach');
		});
	});

	/* ---------------------------------------------------------- text --- */
	var textForm = document.getElementById('text-form');
	var textInput = document.getElementById('text-input');
	var textResult = document.getElementById('text-result');

	textForm.addEventListener('submit', function (event) {
		event.preventDefault();
		var result = W.checkText(textInput.value);
		textResult.replaceChildren();
		textResult.hidden = false;
		if (!result.findings.length) {
			textResult.append(el('p', 'try-note', 'Nothing sensitive found.'));
			track('secrets');
			return;
		}
		var verdict = el('div', 'try-verdict ' + (result.serious ? 'high' : 'suspicious'));
		verdict.append(el('span', null, result.summary));
		textResult.append(verdict);
		var list = el('ul', 'try-list');
		result.findings.forEach(function (finding) {
			var item = el('li');
			item.append(el('strong', null, finding.label));
			item.append(el('div', 'detail', finding.preview));
			list.append(item);
		});
		textResult.append(list);
		track('secrets');
	});
})();
