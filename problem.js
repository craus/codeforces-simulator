var problem = function(name, timeOrder, score) {
  return {
    name: name, 
    timeOrder: timeOrder.fixAnswer(),
    score: score,
    knowSpeed: 0.1,
    cheapingSpeed: score * 0.01,
    paint: function() {
    }
  }
}