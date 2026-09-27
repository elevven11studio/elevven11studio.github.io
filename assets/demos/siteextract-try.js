/* Wires /siteextract/try/ to the bundled pipeline in siteextract.js. Titles,
   paths, fonts and URLs are quoted from someone else's page, so they go in
   with textContent only. */
(function () {
	'use strict';
	var S = window.SiteExtractDemo;
	if (!S) return;

	function el(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text != null) node.textContent = text;
		return node;
	}

	var form = document.getElementById('extract-form');
	var input = document.getElementById('extract-input');
	var submit = document.getElementById('extract-submit');
	var result = document.getElementById('extract-result');
	var boxes = {
		images: document.getElementById('opt-images'),
		fonts: document.getElementById('opt-fonts'),
		tokens: document.getElementById('opt-tokens')
	};
	var download = null;

	/* ------------------------------------------------------- progress --- */
	var STATES = { done: 'Done', failed: 'Failed', off: 'Off', running: '...', waiting: '' };

	function step(name, state, value) {
		var row = el('div', 'try-step');
		row.dataset.state = state;
		row.append(el('span', null, name), el('span', 'value', value == null ? STATES[state] : value));
		return row;
	}

	/* Counters exist once CSS is done, because that is when discovery runs. */
	function counter(name, c, enabled, discovered) {
		if (!enabled) return step(name, 'off');
		if (!discovered) return step(name, 'waiting');
		var state = c.done < c.total ? 'running' : 'done';
		if (!c.total) return step(name, state, 'None');
		var value = (c.done - c.failed) + ' / ' + c.total + (c.failed ? ' (' + c.failed + ' remote)' : '');
		return step(name, state, value);
	}

	function renderProgress(steps, p, options) {
		var discovered = p.css === 'done';
		steps.replaceChildren(
			step('HTML', p.html),
			step('CSS', p.css),
			counter('Images', p.images, options.images, discovered),
			counter('Fonts', p.fonts, options.fonts, discovered)
		);
		if (p.other.total) steps.append(counter('Other files', p.other, true, true));
		steps.append(step('Design tokens', p.tokens));
	}

	/* --------------------------------------------------------- result --- */
	function folderChips(files) {
		var counts = {};
		Object.keys(files).forEach(function (path) {
			var key = path.indexOf('/') === -1 ? path : path.split('/')[0] + '/';
			counts[key] = (counts[key] || 0) + 1;
		});
		var chips = el('div', 'try-chips');
		chips.append(el('span', 'try-tag', 'In the ZIP'));
		Object.keys(counts).sort().forEach(function (key) {
			chips.append(el('span', 'try-chip', key.slice(-1) === '/' ? key + ' ' + counts[key] : key));
		});
		return chips;
	}

	function renderTokens(tokens, files) {
		var wrap = document.createDocumentFragment();
		if (tokens.colors.length) {
			var swatches = el('div', 'try-swatches');
			swatches.setAttribute('aria-label', 'Colours used on the page');
			tokens.colors.forEach(function (c) {
				var item = el('div', 'try-swatch');
				var chip = el('span', 'color');
				chip.style.background = c.value;
				item.append(chip, el('span', null, c.value));
				swatches.append(item);
			});
			wrap.append(swatches);
		}
		if (tokens.fonts.length) {
			var fonts = el('div', 'try-chips');
			fonts.append(el('span', 'try-tag', 'Fonts'));
			tokens.fonts.forEach(function (f) {
				fonts.append(el('span', 'try-chip', f.value.split(',')[0].replace(/["']/g, '')));
			});
			wrap.append(fonts);
		}
		var css = files['css/tokens.css'];
		if (css) {
			var details = el('details', 'try-details');
			details.append(el('summary', null, 'View tokens.css'));
			details.append(el('pre', 'try-code', new TextDecoder().decode(css)));
			wrap.append(details);
		}
		return wrap;
	}

	function renderFailures(failed) {
		var details = el('details', 'try-details');
		details.append(el('summary', null, S.plural(failed.length, 'file') + ' kept a remote URL'));
		details.append(el('p', 'try-note', 'Usually because their servers do not let this page download them. The extension asks for access to other domains, so it can. The project still loads them while online.'));
		var list = el('ul', 'try-list');
		failed.slice(0, 40).forEach(function (f) {
			var item = el('li');
			var title = el('strong');
			title.append(el('span', 'try-tag', f.type), f.reason);
			item.append(title, el('div', 'detail', f.url));
			list.append(item);
		});
		details.append(list);
		if (failed.length > 40) details.append(el('p', 'try-note', (failed.length - 40) + ' more in report.json.'));
		return details;
	}

	function renderDone(out) {
		var report = out.report;
		if (download) URL.revokeObjectURL(download);
		download = URL.createObjectURL(out.blob);

		var head = el('div', 'try-download');
		var link = el('a', 'btn btn-primary', 'Download ZIP');
		link.href = download;
		link.download = out.name + '.zip';
		link.addEventListener('click', function () {
			if (typeof gtag === 'function') gtag('event', 'extension_demo', { tool: 'extract-download' });
		});
		head.append(link, el('span', 'try-meta', S.plural(report.files, 'file') + ' · ' + S.formatBytes(out.blob.size)));
		result.append(head);

		result.append(folderChips(out.files));
		if (report.tokens) result.append(renderTokens(report.tokens, out.files));
		if (report.failed.length) result.append(renderFailures(report.failed));
	}

	/* ------------------------------------------------------------ run --- */
	form.addEventListener('submit', function (event) {
		event.preventDefault();
		var options = {
			images: boxes.images.checked,
			fonts: boxes.fonts.checked,
			tokens: boxes.tokens.checked
		};
		submit.disabled = true;
		submit.textContent = 'Extracting...';
		result.hidden = false;
		var status = el('p', 'try-note', 'Fetching the page. This takes a few seconds.');
		var steps = el('div', 'try-steps');
		result.replaceChildren(status, steps);

		S.extractUrl(input.value, options, function (p) {
			status.textContent = 'Building the project.';
			renderProgress(steps, p, options);
		}).then(function (out) {
			status.remove();
			renderDone(out);
			if (typeof gtag === 'function') gtag('event', 'extension_demo', { tool: 'extract' });
		}, function (error) {
			result.replaceChildren(el('p', 'try-note', error.message));
		}).then(function () {
			submit.disabled = false;
			submit.textContent = 'Extract';
		});
	});
})();
