variable = function(initialValue, id, name) {
  if (name == undefined) {
    name = id
  }
  if (savedata[id] != undefined) {
    initialValue = savedata[id]
  }
  return {
    value: initialValue, 
    id: id,
    name: name,
    get: function(){return this.value},
    paint: function() {
      var label = $('#'+id)
      label.text(formatText(label, large(Math.floor(this.get()))))
    }
  }
}  