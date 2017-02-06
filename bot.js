var createBot = function(contest, participant) {
  return {
    tick: function(t) {
      participant.activeProblem = _.max(
        participant.problems.filter(p => !p.solved), 
        p => p.problem.score / Math.exp(p.timeOrder.m)
      )
    },
    remove: function() {
    }
  }
}