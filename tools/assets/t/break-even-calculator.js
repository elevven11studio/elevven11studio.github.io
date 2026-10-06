E11T.calculator('[data-calc="breakeven"]', function (v, f) {
  var r = E11Calc.breakEven(v.fixed, v.variable, v.price, v.target);
  if (r.error) return r;
  var out = {
    units: f.num(r.units, 0),
    revenue: f.money(r.revenue),
    unitMargin: f.money(r.unitMargin)
  };
  if (r.targetUnits !== undefined) {
    out.targetUnits = f.num(r.targetUnits, 0);
    out.targetRevenue = f.money(r.targetRevenue);
  }
  return out;
});
