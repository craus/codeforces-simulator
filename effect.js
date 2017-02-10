var createEffect = function(params) {
  var panel = instantiate(params.name + "EffectSample")
  $(".effects").append(panel)
  return Object.assign({
    panel: panel, 
    duration: params.duration,
    expired: function() {
      return this.duration < eps
    },
    destroy: function() {
      panel.remove()
    }
  }, params, {
    tick: function(t) {
      t = Math.min(t, this.duration)
      if (params.tick) {
        params.tick.apply(this, [t])
      }
      this.duration -= t
    },
    paint: function() {
      setFormattedText(this.panel.find(".duration"), precision(this.duration))
      if (params.paint) {
        params.paint.apply(this)
      }
    }
  })    
}