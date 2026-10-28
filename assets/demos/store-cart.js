/**
 * WhatsApp cart for the online-store demos (examples/online-store*).
 *
 * Static on purpose: no backend, no payment processor. The cart lives in
 * localStorage and checkout opens WhatsApp with the order written out, which is
 * how most of our clients already take orders. A real build only needs `phone`
 * set; the demos leave it empty so wa.me lets the visitor pick any chat.
 *
 * The page declares its products in HTML and passes the rest in window.E11Store:
 *
 *   <article class="product" data-id="tote" data-name="Leather Tote"
 *            data-price="25000" data-cat="bags" data-soldout>
 *     <select class="variant">...</select>   (optional; value joins the name)
 *     <button class="add">Add to cart</button>
 *   </article>
 *   <button data-filter="bags">Bags</button>  (optional; "all" shows everything)
 *
 *   window.E11Store = { name, phone, delivery: [{ label, fee }], minOrder };
 *
 * Styling comes from the page's own --bg, --text, --muted, --accent and
 * --on-accent, so each demo keeps its palette.
 */
(function () {
  const cfg = Object.assign({ name: 'our store', phone: '', delivery: [], minOrder: 0 }, window.E11Store);
  const KEY = 'e11-cart:' + location.pathname;
  // demo-localize.js flips the page to its international copy for visitors
  // outside Nigeria. Prices then come from data-price-intl, and delivery and
  // minimum order from deliveryIntl / minOrderIntl.
  let intl = !!window.E11Intl;
  const money = (n) => (intl ? '$' + n.toLocaleString('en-US') : '₦' + n.toLocaleString('en-NG'));
  const deliveries = () => (intl && cfg.deliveryIntl ? cfg.deliveryIntl : cfg.delivery);
  const minOrder = () => (intl && cfg.minOrderIntl != null ? cfg.minOrderIntl : cfg.minOrder);
  const priceOf = (l) => {
    const card = document.querySelector('.product[data-id="' + l.id.split(':')[0] + '"]');
    return card ? +((intl && card.dataset.priceIntl) || card.dataset.price) : l.price;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { /* private mode: start empty */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* not persisted */ } };

  const css = `
	.sc-fab { position: fixed; right: 1.25rem; bottom: 1.25rem; z-index: 900; display: flex; align-items: center; gap: .5rem;
		background: var(--accent); color: var(--on-accent, #fff); border: 0; border-radius: 999px; padding: .85rem 1.2rem;
		font: 700 .95rem/1 system-ui, sans-serif; cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,.25); }
	.sc-fab b { background: var(--bg); color: var(--text); border-radius: 999px; min-width: 1.5rem; padding: .2rem .45rem; font-size: .8rem; }
	.sc-scrim { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 1000; opacity: 0; pointer-events: none; transition: opacity .2s; }
	.sc-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(420px, 100%); z-index: 1001; background: var(--bg); color: var(--text);
		display: flex; flex-direction: column; transform: translateX(100%); transition: transform .25s ease;
		font-family: system-ui, sans-serif; box-shadow: -10px 0 30px rgba(0,0,0,.3); }
	.sc-open .sc-scrim { opacity: 1; pointer-events: auto; }
	.sc-open .sc-drawer { transform: none; }
	.sc-head { display: flex; justify-content: space-between; align-items: center; padding: 1.1rem 1.25rem; border-bottom: 1px solid rgba(127,127,127,.25); }
	.sc-head h2 { font-size: 1.15rem; margin: 0; }
	.sc-x { background: none; border: 0; color: inherit; font-size: 1.6rem; line-height: 1; cursor: pointer; }
	.sc-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }
	.sc-empty { color: var(--muted); text-align: center; padding: 3rem 0; }
	.sc-line { display: grid; grid-template-columns: 1fr auto; gap: .35rem .75rem; padding: .85rem 0; border-bottom: 1px solid rgba(127,127,127,.18); }
	.sc-line .nm { font-weight: 600; font-size: .95rem; }
	.sc-line .pr { text-align: right; font-weight: 700; }
	.sc-qty { display: flex; align-items: center; gap: .5rem; }
	.sc-qty button { width: 1.8rem; height: 1.8rem; border-radius: 50%; border: 1px solid rgba(127,127,127,.4); background: none; color: inherit; cursor: pointer; }
	.sc-rm { background: none; border: 0; color: var(--muted); font-size: .8rem; text-decoration: underline; cursor: pointer; justify-self: end; }
	.sc-form { display: grid; gap: .6rem; margin-top: 1.25rem; }
	.sc-form label { font-size: .8rem; color: var(--muted); display: grid; gap: .25rem; }
	.sc-form input, .sc-form select, .sc-form textarea { font: inherit; font-size: .92rem; padding: .6rem .7rem; border-radius: 8px;
		border: 1px solid rgba(127,127,127,.35); background: rgba(127,127,127,.08); color: inherit; }
	.sc-form option { color: #111; }
	.sc-foot { padding: 1rem 1.25rem 1.25rem; border-top: 1px solid rgba(127,127,127,.25); }
	.sc-row { display: flex; justify-content: space-between; font-size: .92rem; color: var(--muted); margin-bottom: .3rem; }
	.sc-row.total { color: var(--text); font-weight: 700; font-size: 1.05rem; margin: .5rem 0 .9rem; }
	.sc-go { width: 100%; border: 0; border-radius: 10px; padding: .95rem; background: #25d366; color: #0b1f12; font: 700 1rem system-ui, sans-serif; cursor: pointer; }
	.sc-go:disabled { opacity: .45; cursor: not-allowed; }
	.sc-hint { color: var(--muted); font-size: .78rem; text-align: center; margin-top: .6rem; }
	.sc-toast { position: fixed; left: 50%; bottom: 5.5rem; transform: translate(-50%, 1rem); z-index: 1002; opacity: 0; pointer-events: none;
		background: var(--text); color: var(--bg); padding: .6rem 1rem; border-radius: 999px; font: 600 .88rem system-ui, sans-serif; transition: all .2s; }
	.sc-toast.on { opacity: 1; transform: translate(-50%, 0); }
	.product[hidden], .sc-drawer [hidden] { display: none !important; }`;
  document.head.insertAdjacentHTML('beforeend', '<style>' + css + '</style>');

  const deliveryOptions = () => deliveries().map((d, i) =>
    `<option value="${i}">${esc(d.label)}${d.fee ? ' (' + money(d.fee) + ')' : ''}</option>`).join('');
  const deliveryField = cfg.delivery.length
    ? `<label>Delivery<select name="delivery">${deliveryOptions()}</select></label>`
    : '';

  document.body.insertAdjacentHTML('beforeend', `
	<button class="sc-fab" type="button" aria-label="Open cart">Cart <b class="sc-count">0</b></button>
	<div class="sc-scrim"></div>
	<aside class="sc-drawer" role="dialog" aria-modal="true" aria-labelledby="sc-title" aria-hidden="true">
		<div class="sc-head"><h2 id="sc-title">Your order</h2><button class="sc-x" type="button" aria-label="Close cart">&times;</button></div>
		<div class="sc-body">
			<div class="sc-lines"></div>
			<form class="sc-form" hidden>
				<label>Name<input name="customer" autocomplete="name" required /></label>
				${deliveryField}
				<label class="sc-addr">Address<textarea name="address" rows="2" autocomplete="street-address"></textarea></label>
				<label>Note (optional)<input name="note" /></label>
			</form>
		</div>
		<div class="sc-foot">
			<div class="sc-row"><span>Subtotal</span><span class="sc-sub"></span></div>
			<div class="sc-row sc-del-row"><span>Delivery</span><span class="sc-del"></span></div>
			<div class="sc-row total"><span>Total</span><span class="sc-total"></span></div>
			<button class="sc-go" type="button">Order on WhatsApp</button>
			<p class="sc-hint"></p>
		</div>
	</aside>
	<div class="sc-toast" role="status"></div>`);

  const $ = (s) => document.querySelector(s);
  const drawer = $('.sc-drawer');
  const form = $('.sc-form');
  const F = form.elements;
  const go = $('.sc-go');
  const hint = $('.sc-hint');
  const toast = $('.sc-toast');
  let toastTimer;

  const deliveryChoice = () => deliveries()[F.delivery ? +F.delivery.value : -1];
  const subtotal = () => cart.reduce((s, l) => s + priceOf(l) * l.qty, 0);

  function render() {
    const count = cart.reduce((s, l) => s + l.qty, 0);
    $('.sc-count').textContent = count;
    $('.sc-lines').innerHTML = cart.length
      ? cart.map((l, i) => `
		<div class="sc-line">
			<span class="nm">${esc(l.name)}</span><span class="pr">${money(priceOf(l) * l.qty)}</span>
			<span class="sc-qty"><button type="button" data-i="${i}" data-d="-1" aria-label="Fewer">&minus;</button>${l.qty}<button type="button" data-i="${i}" data-d="1" aria-label="More">+</button></span>
			<button class="sc-rm" type="button" data-rm="${i}">Remove</button>
		</div>`).join('')
      : '<p class="sc-empty">Your cart is empty.</p>';
    form.hidden = !cart.length;

    const d = deliveryChoice();
    const sub = subtotal();
    const fee = d ? d.fee : 0;
    $('.sc-sub').textContent = money(sub);
    $('.sc-del-row').hidden = !d;
    $('.sc-del').textContent = fee ? money(fee) : 'Free';
    $('.sc-total').textContent = money(sub + fee);
    // Pickup options have no address to collect.
    $('.sc-addr').hidden = !!(d && d.pickup);

    const short = minOrder() - sub;
    go.disabled = !cart.length || short > 0;
    hint.textContent = !cart.length ? ''
      : short > 0 ? 'Minimum order ' + money(minOrder()) + '. Add ' + money(short) + ' more.'
      : cfg.phone ? '' : 'Demo store: pick any WhatsApp chat to see the order.';
  }

  function setOpen(open) {
    document.documentElement.classList.toggle('sc-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if (open) $('.sc-x').focus();
  }

  function add(card) {
    const variant = card.querySelector('.variant');
    const v = variant ? variant.value : '';
    const id = card.dataset.id + (v ? ':' + v : '');
    const name = card.dataset.name + (v ? ' (' + v + ')' : '');
    const line = cart.find((l) => l.id === id);
    if (line) line.qty++;
    else cart.push({ id, name, price: +card.dataset.price, qty: 1 });
    save();
    render();
    toast.textContent = name + ' added';
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('on'), 1600);
  }

  function checkout() {
    if (!form.reportValidity()) return;
    const d = deliveryChoice();
    const fee = d ? d.fee : 0;
    const lines = [
      'Hello ' + cfg.name + ', I would like to order:',
      '',
      ...cart.map((l, i) => `${i + 1}. ${l.name} x${l.qty} - ${money(priceOf(l) * l.qty)}`),
      '',
      'Subtotal: ' + money(subtotal()),
    ];
    if (d) lines.push('Delivery: ' + d.label + (fee ? ' - ' + money(fee) : ''));
    lines.push('Total: ' + money(subtotal() + fee), '', 'Name: ' + F.customer.value.trim());
    if (!(d && d.pickup) && F.address.value.trim()) lines.push('Address: ' + F.address.value.trim());
    if (F.note.value.trim()) lines.push('Note: ' + F.note.value.trim());
    window.open('https://wa.me/' + cfg.phone.replace(/\D/g, '') + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  }

  // Sold-out cards keep their place in the grid but can't be added.
  document.querySelectorAll('.product[data-soldout] .add').forEach((b) => { b.disabled = true; b.textContent = 'Sold out'; });

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('.product .add')) add(t.closest('.product'));
    else if (t.closest('.sc-fab, [data-open-cart]')) setOpen(true);
    else if (t.closest('.sc-x, .sc-scrim')) setOpen(false);
    else if (t.dataset.d) {
      const l = cart[+t.dataset.i];
      l.qty += +t.dataset.d;
      if (l.qty < 1) cart.splice(+t.dataset.i, 1);
      save(); render();
    } else if (t.dataset.rm) { cart.splice(+t.dataset.rm, 1); save(); render(); }
    else if (t === go) checkout();
    else if (t.dataset.filter) {
      document.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === t)));
      document.querySelectorAll('.product').forEach((p) => {
        p.hidden = t.dataset.filter !== 'all' && p.dataset.cat !== t.dataset.filter;
      });
    }
  });
  form.addEventListener('change', render);
  document.addEventListener('e11:intl', () => {
    intl = true;
    if (F.delivery) F.delivery.innerHTML = deliveryOptions();
    render();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  render();
})();
