var problem = function(name, time, score, knowSpeed, contest) {
  return {
    name: name, 
    time: time.fixAnswer(),
    score: score,
    knowSpeed: knowSpeed,
    cheapingSpeed: score * 0.48 / contest.totalTime,
    paint: function() {
    }
  }
}