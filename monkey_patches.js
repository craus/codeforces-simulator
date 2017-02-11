
Array.prototype.last = function() {
  return this[this.length-1]
}

Array.prototype.remove = function(element) {
  var i = this.indexOf(element);
  if(i != -1) {
    this.splice(i, 1);
  }
}

Array.prototype.each = function(method) {
  var args = Array.prototype.slice.call(arguments,1)
  for (var i = 0; i < this.length; i++) {
    this[i][method].apply(this[i],args)
  }
}

Array.prototype.find = function(criteria) {
  for (var i = 0; i < this.length; i++) {
    if (criteria(this[i])) {
      return this[i]
    }
  }
  return null
}

Array.prototype.rndSubset = function(cnt) {
  var result = []
  for (var i = 0; i < this.length; i++) {
    if (rndEvent((cnt - result.length) / (this.length - i))) {
      result.push(this[i])
    }
  }
  return result
}

Math.sign = function(x) {
  if (x > 0) {
    return 1
  } else if (x < 0) {
    return -1
  } else {
    return 0
  }
}

Math.clamp = function(x, a, b) {
  return Math.max(a, Math.min(x, b))
}