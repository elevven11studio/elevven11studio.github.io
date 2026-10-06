(function () {
  var KEY = 'e11-invoice-draft';
  var $ = function (id) { return document.getElementById(id); };
  var itemsBox = $('items');
  var sheet = $('invoice-preview');
  var saveTimer;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function niceDate(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d) ? iso : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function addItem(desc, qty, price) {
    var row = document.createElement('div');
    row.className = 'inv-item';
    row.innerHTML =
      '<input class="form-input" data-f="desc" type="text" aria-label="Item description" placeholder="Item" autocomplete="off" />' +
      '<input class="form-input" data-f="qty" type="number" inputmode="decimal" step="any" min="0" aria-label="Quantity" placeholder="1" />' +
      '<input class="form-input" data-f="price" type="number" inputmode="decimal" step="any" min="0" aria-label="Unit price" placeholder="0.00" />' +
      '<button class="inv-del" type="button" aria-label="Remove item">&times;</button>';
    row.querySelector('[data-f="desc"]').value = desc || '';
    row.querySelector('[data-f="qty"]').value = qty === undefined ? '' : qty;
    row.querySelector('[data-f="price"]').value = price === undefined ? '' : price;
    itemsBox.appendChild(row);
    return row;
  }

  function readItems() {
    return Array.prototype.map.call(itemsBox.children, function (row) {
      return {
        desc: row.querySelector('[data-f="desc"]').value.trim(),
        qty: row.querySelector('[data-f="qty"]').value,
        price: row.querySelector('[data-f="price"]').value
      };
    });
  }

  function read() {
    return {
      fromName: $('from-name').value, fromDetails: $('from-details').value,
      toName: $('to-name').value, toDetails: $('to-details').value,
      no: $('inv-no').value, date: $('inv-date').value, due: $('inv-due').value,
      disc: $('inv-disc').value, tax: $('inv-tax').value, notes: $('inv-notes').value,
      items: readItems()
    };
  }

  function write(d) {
    $('from-name').value = d.fromName || ''; $('from-details').value = d.fromDetails || '';
    $('to-name').value = d.toName || ''; $('to-details').value = d.toDetails || '';
    $('inv-no').value = d.no || ''; $('inv-date').value = d.date || ''; $('inv-due').value = d.due || '';
    $('inv-disc').value = d.disc || ''; $('inv-tax').value = d.tax || ''; $('inv-notes').value = d.notes || '';
    itemsBox.innerHTML = '';
    (d.items && d.items.length ? d.items : [{}]).forEach(function (it) { addItem(it.desc, it.qty, it.price); });
  }

  function problem(d) {
    var disc = d.disc === '' ? 0 : Number(d.disc), tax = d.tax === '' ? 0 : Number(d.tax);
    if (isNaN(disc) || disc < 0 || disc > 100) return 'Enter a discount between 0 and 100.';
    if (isNaN(tax) || tax < 0) return 'Enter a tax rate of zero or more.';
    for (var i = 0; i < d.items.length; i++) {
      var it = d.items[i];
      if ((it.qty !== '' && Number(it.qty) < 0) || (it.price !== '' && Number(it.price) < 0)) {
        return 'Quantities and prices cannot be negative.';
      }
    }
    return '';
  }

  function render() {
    var d = read();
    var err = problem(d);
    $('inv-error').hidden = !err;
    $('inv-error').textContent = err;

    var f = E11T.fmt;
    var items = d.items.filter(function (it) { return it.desc || it.qty !== '' || it.price !== ''; })
      .map(function (it) { return { desc: it.desc, qty: it.qty === '' ? 1 : Number(it.qty), price: it.price === '' ? 0 : Number(it.price) }; });
    var t = E11Calc.invoiceTotals(items, err ? 0 : Number(d.disc || 0), err ? 0 : Number(d.tax || 0));

    var rows = items.map(function (it, i) {
      return '<tr><td>' + esc(it.desc || 'Item') + '</td><td class="r">' + f.num(it.qty, 4) + '</td><td class="r">' + f.money(it.price) +
        '</td><td class="r">' + f.money(t.lines[i]) + '</td></tr>';
    }).join('');

    sheet.innerHTML =
      '<div class="inv-top"><div><h3>INVOICE</h3>' +
      (d.fromName ? '<div class="inv-name">' + esc(d.fromName) + '</div>' : '') +
      (d.fromDetails ? '<div class="inv-text">' + esc(d.fromDetails) + '</div>' : '') + '</div>' +
      '<div class="inv-meta">' +
      (d.no ? '<div><b>No.</b> ' + esc(d.no) + '</div>' : '') +
      (d.date ? '<div><b>Date</b> ' + esc(niceDate(d.date)) + '</div>' : '') +
      (d.due ? '<div><b>Due</b> ' + esc(niceDate(d.due)) + '</div>' : '') + '</div></div>' +
      '<div class="inv-party"><div><div class="inv-label">Bill to</div>' +
      (d.toName ? '<div class="inv-name">' + esc(d.toName) + '</div>' : '<div class="inv-text">Customer name</div>') +
      (d.toDetails ? '<div class="inv-text">' + esc(d.toDetails) + '</div>' : '') + '</div></div>' +
      '<table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="4" style="color:#6b6a75">Add an item to begin.</td></tr>') + '</tbody></table>' +
      '<div class="inv-totals"><div><span>Subtotal</span><span>' + f.money(t.subtotal) + '</span></div>' +
      (t.discount ? '<div><span>Discount (' + f.num(Number(d.disc), 2) + '%)</span><span>-' + f.money(t.discount) + '</span></div>' : '') +
      (Number(d.tax) ? '<div><span>Tax (' + f.num(Number(d.tax), 2) + '%)</span><span>' + f.money(t.tax) + '</span></div>' : '') +
      '<div class="grand"><span>Total</span><span>' + f.money(t.total) + '</span></div></div>' +
      (d.notes ? '<div class="inv-notes">' + esc(d.notes) + '</div>' : '');
  }

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      E11T.store(KEY, JSON.stringify(read()));
      $('saved').textContent = 'Draft saved on this device.';
    }, 400);
  }

  function load() {
    var raw = E11T.store(KEY);
    if (raw) {
      try { write(JSON.parse(raw)); $('saved').textContent = 'Draft restored from this device.'; return; } catch (e) { /* fall through */ }
    }
    write({ no: 'INV-001', date: today(), items: [{}] });
  }

  document.querySelector('.t-form-col').addEventListener('input', function () {
    E11T.trackOnce('tool_used');
    render(); save();
  });
  itemsBox.addEventListener('click', function (e) {
    var del = e.target.closest('.inv-del');
    if (!del) return;
    del.parentNode.remove();
    if (!itemsBox.children.length) addItem();
    render(); save();
  });
  $('add-item').addEventListener('click', function () {
    var row = addItem();
    row.querySelector('[data-f="desc"]').focus();
  });
  E11T.onCurrency(render);

  var oldTitle = document.title;
  $('print').addEventListener('click', function () {
    if (problem(read())) { render(); $('inv-error').scrollIntoView({ block: 'center' }); return; }
    var no = $('inv-no').value.trim();
    document.title = 'Invoice' + (no ? ' ' + no : '');
    E11T.track('tool_downloaded', { method: 'print' });
    E11T.trackOnce('tool_completed');
    window.print();
  });
  window.addEventListener('afterprint', function () { document.title = oldTitle; });

  $('clear').addEventListener('click', function () {
    if (!window.confirm('Clear this invoice and delete the saved draft?')) return;
    E11T.store(KEY, null);
    write({ no: 'INV-001', date: today(), items: [{}] });
    $('saved').textContent = '';
    render();
  });

  load();
  render();
})();
