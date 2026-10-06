E11T.calculator('[data-calc="forward"]', function (v, f) {
  var r = E11Calc.discount(v.orig, v.pct);
  return { final: f.money(r.final), saved: f.money(r.saved) };
});
E11T.calculator('[data-calc="reverse"]', function (v, f) {
  var r = E11Calc.discountFromPrices(v.orig, v.sale);
  if (r.error) return r;
  return { pct: f.pct(r.pct), saved: f.money(r.saved) };
});
