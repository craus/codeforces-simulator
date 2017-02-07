var problem = function(name, time, score, contest) {
  return {
    name: name, 
    time: time.fixAnswer(),
    score: score,
    knowSpeed: 0.5,
    cheapingSpeed: score * 0.48 / contest.totalTime,
    paint: function() {
    }
  }
}