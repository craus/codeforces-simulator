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

var loadProblem = function(problemRecord) {
  return Object.assign({}, problemRecord, {
    paint: function() {
    },
    time: Object.assign(gaussed(0,1), problemRecord.time)
  })
}