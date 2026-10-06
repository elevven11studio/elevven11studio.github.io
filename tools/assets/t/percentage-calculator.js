E11T.calculator('[data-calc="of"]', function (v, f) {
  return { value: f.num(E11Calc.percentOf(v.x, v.y).value, 4) };
});
E11T.calculator('[data-calc="what"]', function (v, f) {
  var r = E11Calc.whatPercent(v.x, v.y);
  if (r.error) return r;
  return { pct: f.pct(r.pct) };
});
E11T.calculator('[data-calc="change"]', function (v, f) {
  var r = E11Calc.percentChange(v.from, v.to);
  if (r.error) return r;
  return {
    pct: f.pct(Math.abs(r.pct)),
    dir: r.pct > 0 ? 'Increase' : r.pct < 0 ? 'Decrease' : 'No change',
    diff: f.num(r.diff, 4)
  };
});
E11T.calculator('[data-calc="apply"]', function (v, f) {
  return {
    up: f.num(E11Calc.applyPercent(v.value, v.pct, 'increase').result, 4),
    down: f.num(E11Calc.applyPercent(v.value, v.pct, 'decrease').result, 4)
  };
});
