var createBot = function(contest, participant) {
  return {
    tick: function(t) {
      var filtered = participant.problems.filter(p => !p.solved)
      if (filtered.length == 0) {
        participant.activeProblem = null
      } else {
        participant.activeProblem = _.max(filtered, p => p.problem.score / p.time.m)
      }
    },
    remove: function() {
    }
  }
}