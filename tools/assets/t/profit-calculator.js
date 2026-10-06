E11T.calculator('[data-calc="profit"]', function (v, f) {
  var r = E11Calc.profit(v.cost, v.price, v.qty);
  return {
    profit: f.money(r.profit),
    profit_label: r.profit < 0 ? 'Loss' : 'Profit',
    margin: f.pct(r.margin),
    markup: f.pct(r.markup),
    revenue: f.money(r.revenue),
    totalCost: f.money(r.totalCost)
  };
});
