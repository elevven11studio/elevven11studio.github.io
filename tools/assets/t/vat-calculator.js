E11T.calculator('[data-calc="add"]', function (v, f) {
  var r = E11Calc.vatAdd(v.net, v.rate);
  return { gross: f.money(r.gross), vat: f.money(r.vat), net: f.money(r.net) };
});
E11T.calculator('[data-calc="remove"]', function (v, f) {
  var r = E11Calc.vatRemove(v.gross, v.rate);
  return { net: f.money(r.net), vat: f.money(r.vat), gross: f.money(r.gross) };
});
