calculatable = function(calculator) {
  return {
    get: calculator
  }
}

var constant = function(x){return calculatable(function(){return x})}