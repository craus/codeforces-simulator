var createAscendResource = function(i, resources, getLevel) {
  var previous = resources[i-1]
  var name
  if (i == 0) {
    name = "Money"
  } else if (i == 1) {
    name = "Income"
  } else if (i == 2) {
    name = "Income multiplier"
  } else {
    name = "Income multiplier #" + (i-1)
  }
  var id = "resource" + i
  var panel = instantiate("resourcePanelSample")
  panel.find('.value').addClass(id)
  panel.find('.name').text(name)
  $('.resources').append(panel)
  
  var result = variable(1, id, name)
  
  if (i == 0) {
    panel.find('.ascend').toggle(false)
    var basePaint = result.paint
    result.paint = function() {
      panel.toggle(i <= getLevel()+1)
      setFormattedText(panel.find('.income'), "+"+large(income.get()))
      
      basePaint.apply(this)
    }    
  } else {
    panel.find('.income').remove()
    var ascendValue = () => Math.floor(Math.sqrt(previous.get()))
  
    var basePaint = result.paint
    result.paint = function() {
      panel.toggle(i <= getLevel()+1)
      panel.find('.ascend').prop('disabled', ascendValue() <= result.value)
      setFormattedText(panel.find('.newValue'), large(ascendValue()))
      
      basePaint.apply(this)
    }
    
    panel.find('.ascend').click(() => {
      result.value = ascendValue()
      for (var j = 0; j < i; j++) {
        resources[j].value = 1
      }
    })
  }
  
  return result
}