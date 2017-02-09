var createSpell = function(name, action) {
  var panel = $('.' + name)
  panel.find(".cast").click(action)
  return {
  }
}