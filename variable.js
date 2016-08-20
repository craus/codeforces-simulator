variable = function(initialValue, id, name, params) {
  if (params == undefined) {
    params = {}
  }
  if (name == undefined) {
    name = id
  }
  if (savedata[id] != undefined) {
    initialValue = savedata[id]
  }
  var formatter = params.formatter
  if (formatter == undefined) {
    formatter = function(x) { return large(Math.floor(x)) }
  }
  return {
    value: initialValue, 
    id: id,
    name: name,
    get: function(){return this.value},
    paint: function() {
      var label = $('#'+id)
      label.text(formatText(label, formatter(this.get())))
    }
  }
}  