var createBot = function(contest, participant) {
  return {
    tick: function(t) {
      participant.activeProblem = participant.problems.find(p => !p.solved)
    },
    remove: function() {
    }
  }
}