var createSpell = function(params) {
  params.cost = params.cost || {}
  if (params.cost.get) {
    params.cost = {mana: params.cost}
  }
  params.cost.readiness = constant(1)
  var panel = $('.' + params.name)
  var available = function() {
    return Object.entries(params.cost).every(r => resources[r[0]].get() > r[1].get() - eps)
  }
  var cast = function() {
    if (!available()) {
      return
    }
    Object.entries(params.cost).forEach(r => resources[r[0]].value -= r[1].get())
    params.action()
  }
  panel.find(".cast").click(cast)
  window.addEventListener("keydown", (e) => {
    if (e.key == params.hotkey) {
      cast()
    }
  })
  return Object.assign({
    available: available,
    panel: panel,
  }, params, {    
    paint: function() {
      if (params.cost) {
        setFormattedText(panel.find(".cost"), Object.entries(params.cost).filter(r => r[0] != 'readiness').map(r => large(r[1].get()) + " " + resources[r[0]].name).join(', '))
      }
      panel.find(".cast").prop('disabled', !this.available())
      
      if (this.power) {
        setFormattedText(panel.find(".power"), large(this.power.get()))
      }
      if (this.power2) {
        setFormattedText(panel.find(".power2"), large(this.power2.get()))
      }
      if (this.duration) {
        setFormattedText(panel.find(".duration"), large(this.duration.get()))
      }
      
      if (params.paint) {
        params.paint.apply(this)
      }
    }
  })
}