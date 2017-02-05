var problem = function(name, time, score) {
  return {
    name: name, 
    time: time.fixAnswer(),
    score: score,
    knowSpeed: 10.0 / time.m,
    cheapingSpeed: score * 0.01,
    paint: function() {
    }
  }
}