E11T.calculator('[data-calc="forward"]', function (v, f) {
  var r = E11Calc.markupFromPercent(v.cost, v.pct);
  return { price: f.money(r.price), amount: f.money(r.amount), margin: f.pct(r.margin) };
});
E11T.calculator('[data-calc="reverse"]', function (v, f) {
  var r = E11Calc.markupFromPrice(v.cost, v.price);
  if (r.error) return r;
  return { markup: f.pct(r.markup), amount: f.money(r.amount), margin: f.pct(r.margin) };
});
