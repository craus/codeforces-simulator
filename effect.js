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
    },
    paint: function() {
      setFormattedText(this.panel.find(".duration"), this.duration.toFixed(2))
    }
  }, params, {
    tick: function(t) {
      t = Math.min(t, this.duration)
      params.tick(t)
      this.duration -= t
    }
  })    
}