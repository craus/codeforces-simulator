var problem = function(name, time, score) {
  return {
    name: name, 
    time: time.fixAnswer(),
    score: score,
    knowSpeed: 0.5,
    cheapingSpeed: score * 0.48 / 120,
    paint: function() {
    }
  }
}