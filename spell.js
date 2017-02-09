var createSpell = function(params) {
  var panel = $('.' + params.name)
  var available = function() {
    if (resources.globalCooldown.get() > 0) {
      return false
    }
    if (!params.manaCost) {
      return true
    }
    return resources.mana.get() > params.manaCost - eps
  }
  panel.find(".cast").click(function() {
    if (!available()) {
      return
    }
    if (params.manaCost) {
      resources.mana.value -= params.manaCost
    }
    resources.globalCooldown.value += 1
    params.action()
  })
  return {
    available: available,
    paint: function() {
      setFormattedText(panel.find(".manaCost"), params.manaCost)
      panel.find(".cast").prop('disabled', !this.available())
    }
  }
}