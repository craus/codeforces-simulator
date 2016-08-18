function createUnit(params) {
  return $.extend({
    paint: nop,
    tick: nop,
  }, params)
}