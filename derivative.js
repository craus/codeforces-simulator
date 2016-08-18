function derivative(params) {
  return $.extend({
    tick: function() {
      var power = params.speed.get() * space.tickTime
      if (params.value.run != undefined) {
        params.value.run(power)
      } else {
        params.value.value += power
      }
    },    
  }, params)
}