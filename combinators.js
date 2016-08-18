function call(method) {
  args = Array.prototype.slice.call(arguments,1)
  return function(object) {
    object[method].apply(object, args)
  }
}

nop = function(){}
