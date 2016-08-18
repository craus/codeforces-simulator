
Array.prototype.last = function() {
  return this[this.length-1]
}

Array.prototype.remove = function(element) {
  var i = this.indexOf(element);
  if(i != -1) {
    this.splice(i, 1);
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

Math.sign = function(x) {
  if (x > 0) {
    return 1
  } else if (x < 0) {
    return -1
  } else {
    return 0
  }
}