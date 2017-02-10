var createSpell = function(params) {
  params.cost = params.cost || {}
  if (params.cost.get) {
    params.cost = {mana: params.cost}
  }
  var panel = $('.' + params.name)
  var available = function() {
    if (resources.globalCooldown.get() > 0) {
      return false
    }
    return Object.entries(params.cost).every(r => resources[r[0]].get() > r[1].get() - eps)
  }
  panel.find(".cast").click(function() {
    if (!available()) {
      return
    }
    Object.entries(params.cost).forEach(r => resources[r[0]].value -= r[1].get())
    resources.globalCooldown.value += 0.01
    params.action()
  })
  return Object.assign({
    available: available,
    panel: panel,
  }, params, {    
    paint: function() {
      if (params.cost) {
        setFormattedText(panel.find(".cost"), Object.entries(params.cost).map(r => large(r[1].get()) + " " + resources[r[0]].name).join(', '))
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