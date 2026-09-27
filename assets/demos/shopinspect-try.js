/* Wires /shopinspect/try/ to the bundled pipeline in shopinspect.js. Product
   names, prices, sellers and evidence are quoted from someone else's page, so
   they go in with textContent only. */
(function () {
	'use strict';
	var S = window.ShopInspectDemo;
	if (!S) return;

	function el(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text != null) node.textContent = text;
		return node;
	}

	var MAX_FINDINGS = 8;
	var form = document.getElementById('shop-form');
	var input = document.getElementById('shop-input');
	var submit = document.getElementById('shop-submit');
	var result = document.getElementById('shop-result');

	function fact(list, name, value) {
		if (!value) return;
		var row = el('div');
		row.append(el('dt', null, name), el('dd', null, value));
		list.append(row);
	}

	function renderProduct(product) {
		var facts = el('dl', 'try-facts');
		fact(facts, 'Product', product.name && product.name.value);
		if (product.price) {
			var price = S.formatMoney(product.price.value);
			if (product.originalPrice) price += ', was ' + S.formatMoney(product.originalPrice.value);
			fact(facts, 'Price', price);
		}
		if (product.rating) {
			var rating = product.rating.value + ' out of ' + (product.ratingScale || 5);
			if (product.reviewCount) rating += ' from ' + product.reviewCount.value.toLocaleString() + ' reviews';
			fact(facts, 'Rating', rating);
		}
		fact(facts, 'Seller', product.seller && product.seller.name && product.seller.name.value);
		fact(facts, 'Store', product.platformName);
		return facts;
	}

	function renderReport(report) {
		if (report.restricted) {
			result.append(el('p', 'try-note', report.restricted));
			return;
		}
		if (report.notAProduct) {
			var head = el('div', 'try-verdict band-none');
			head.append(el('span', null, 'Not a product page'), el('span', 'score', report.hostname));
			result.append(head, el('p', 'try-note', report.notAProduct.reason));
			if (report.notAProduct.signals.length) {
				var signals = el('ul', 'try-list');
				report.notAProduct.signals.slice(0, 6).forEach(function (s) {
					signals.append(el('li', null, s));
				});
				result.append(signals);
			}
			result.append(el('p', 'try-note', 'Paste the address of a single product rather than a search or category page.'));
			return;
		}

		var score = report.score;
		var band = S.verdictBand(score.verdict);
		var verdict = el('div', 'try-verdict band-' + band);
		verdict.append(el('span', null, S.verdictLabel(score.verdict)));
		// A withheld verdict shows no number, as on the toolbar badge: a lone 80 would read as an endorsement.
		var figure = band === 'none' || score.overall == null ? '' : score.overall + ' / 100 on ';
		verdict.append(el('span', 'score', figure + report.hostname));
		result.append(verdict);

		// The popup's own wording for what the verdict claims, or why there is none.
		var withheld = score.verdict === 'not-enough-information';
		var meaning = score.withheld === 'assessed'
			? 'Too few of the checks could run for a verdict. ShopInspect will not guess one.'
			: S.VERDICT_MEANINGS[score.verdict];
		if (withheld && score.overall != null) meaning = 'The checks that ran average ' + score.overall + ', which is too little to go on. ' + meaning;
		result.append(el('p', 'try-meaning', meaning));

		if (S.disclosed(report)) {
			var note = el('p', 'try-note');
			note.append(el('span', 'try-tag', S.PROMO_TAG), S.AFFILIATE_DISCLOSURE);
			result.append(note);
		}

		var coverage = S.coverageLabel(score.coverage) + ' (' + Math.round(score.coverage * 100) + '% stated)';
		coverage += withheld && score.coverage < S.MIN_COVERAGE_FOR_VERDICT ? '. ShopInspect will not give a verdict on this little.' : '.';
		result.append(el('p', 'try-note', coverage));

		result.append(renderProduct(report.product));

		var cats = el('div', 'try-grades try-cats');
		score.categories.forEach(function (cat) {
			if (cat.score == null) return;
			var tile = el('div');
			tile.append(el('span', 'value', String(Math.round(cat.score))));
			tile.append(el('span', 'name', S.CATEGORY_LABELS[cat.category] || cat.category));
			cats.append(tile);
		});
		if (cats.childNodes.length) result.append(cats);

		var findings = report.findings.filter(function (f) { return f.severity !== 'info'; });
		if (!findings.length) {
			result.append(el('p', 'try-note', 'Nothing worth flagging in what the listing states.'));
			return;
		}
		var list = el('ul', 'try-list');
		findings.slice(0, MAX_FINDINGS).forEach(function (f) {
			var item = el('li');
			var title = el('strong');
			title.append(el('span', 'try-tag', S.SEVERITY_LABELS[f.severity] || f.severity), f.title);
			item.append(title, el('p', null, f.description));
			if (f.recommendation) item.append(el('p', 'try-fix', f.recommendation));
			(f.evidence || []).slice(0, 2).forEach(function (line) {
				item.append(el('div', 'detail', line));
			});
			list.append(item);
		});
		result.append(list);
		if (findings.length > MAX_FINDINGS) {
			result.append(el('p', 'try-note', (findings.length - MAX_FINDINGS) + ' more in the full report in the extension.'));
		}
	}

	form.addEventListener('submit', function (event) {
		event.preventDefault();
		submit.disabled = true;
		submit.textContent = 'Inspecting...';
		result.hidden = false;
		result.replaceChildren(el('p', 'try-note', 'Fetching and reading the listing. This takes a few seconds.'));
		S.inspectUrl(input.value).then(function (report) {
			result.replaceChildren();
			renderReport(report);
			if (typeof gtag === 'function') gtag('event', 'extension_demo', { tool: 'shop' });
		}, function (error) {
			result.replaceChildren(el('p', 'try-note', error.message));
		}).then(function () {
			submit.disabled = false;
			submit.textContent = 'Inspect';
		});
	});
})();
