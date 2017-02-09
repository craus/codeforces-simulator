var createSpell = function(params) {
  var panel = $('.' + params.name)
  var available = function() {
    if (resources.globalCooldown.get() > 0) {
      return false
    }
    if (!params.cost) {
      return true
    }
    return resources.mana.get() > params.cost.get() - eps
  }
  panel.find(".cast").click(function() {
    if (!available()) {
      return
    }
    if (params.cost) {
      resources.mana.value -= params.cost.get()
    }
    resources.globalCooldown.value += 0.01
    params.action()
  })
  return Object.assign({
    available: available,
    panel: panel,
  }, params, {    
    paint: function() {
      if (params.cost) {
        setFormattedText(panel.find(".cost"), large(params.cost.get()))
      }
      panel.find(".cast").prop('disabled', !this.available())
      
      if (this.power) {
        setFormattedText(panel.find(".power"), large(this.power.get()))
      }
      if (this.power2) {
        setFormattedText(panel.find(".power2"), large(this.power2.get()))
      }
      
      if (params.paint) {
        params.paint.apply(this)
      }
    }
  })
}