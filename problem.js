var problem = function(name, time, score, contest) {
  return {
    name: name, 
    time: time.fixAnswer(),
    score: score,
    knowSpeed: Math.max(0.1, gaussianRandom(0.5, 0.15)),
    cheapingSpeed: score * 0.48 / contest.totalTime,
    paint: function() {
    }
  }
}