createSetter = function(params) {
  var resource = params.resource
  var value = params.value
  delete params.value
  return $.extend({
    run: function() {
      resource.value = value.get()
    },
    backupSelf: function() {
      resource.backup = resource.value
    },
    restoreSelf: function() {
      resource.value = resource.backup
    },
    name: "money <- heritage"
  }, params)
}