var createParticipant = function(contest, createController, name) {
  var participant = {
    name: name,
    activeProblem: null,
    score: function() {
      return this.problems.reduce((total,problem)=>total+problem.myScore(),0)
    },    
    rank: function() {
      return contest.participants.sort((a, b) => b.score()-a.score()).indexOf(this)+1
    },
    solved: function() {
      return this.problems.reduce((total,problem)=>total+(problem.solved?1:0),0)
    },
    tick: function(t) {
      this.controller.tick(t)
      if (this.activeProblem != null) {
        if (this.activeProblem.solved) {
          this.activeProblem = null
        } else {
          this.activeProblem.solve(t)
        }
      }
    },
    paint: function() {
      if (this.panel != null) {
        setFormattedText(this.panel.find(".currentScore"), large(Math.ceil(this.score())))
        setFormattedText(this.panel.find(".problemsSolved"), large(Math.ceil(this.solved())))
      }
      if (this.row != undefined) {
        setFormattedText(this.row.find(".name"), this.name)
        setFormattedText(this.row.find(".rank"), this.rank())
        setFormattedText(this.row.find(".score"), Math.ceil(this.score()))
        setSortableValue(this.row.find(".scoreData"), Math.ceil(this.score()))
      }
      this.problems.each('paint')
    },
    remove: function() {
      this.controller.remove()
    }
  }
  participant.problems = contest.problems.map(function(p) {return participantProblem(contest, participant, p)}),
  participant.controller = createController(contest, participant)
  return participant
}

var participantProblem = function(contest, participant, problem) {
  return {
    problem: problem,
    time: Object.assign({}, problem.time),
    timeSpent: 0,
    solved: false,
    tries: 0,
    lastSubmitTime: null,
    score: function() {
      return problem.score - problem.cheapingSpeed*contest.timeElapsed()
    },
    myScore: function() {
      if (!this.solved) {
        return 0
      }
      return problem.score - problem.cheapingSpeed*this.lastSubmitTime - (this.tries-1)*contest.penalty
    },
    isActive: function() {
      return participant.activeProblem == this
    },
    solve: function(t) {
      if (this.solved) {
        return
      }
      this.timeSpent += t

      if (this.timeSpent > this.time.fixedAnswer) {
        this.submit()
        this.solved = true
        participant.activeProblem = null
      }
      this.time = this.time.know(Math.log((this.timeSpent+100) / (this.timeSpent-t+100))*problem.knowSpeed)
    },
    submit: function() {
      this.tries += 1
      this.lastSubmitTime = contest.time
      this.time = this.time.know(contest.submitDataAmount)
    },
    paint: function() {
      var panel = this.panel
      if (panel != undefined) {      
        setFormattedText(panel.find(".name"), this.problem.name)
        // if (contest.finished()) {
          // this.time = this.time.know(1000)
        // }
        setFormattedText(panel.find(".timeLeft"), round(this.time.m - this.timeSpent), noZero(round(2*this.time.sigma), x => "±" + x))
        setFormattedText(panel.find(".timeSpent"), this.timeSpent.toFixed(2), contest.running() ? "" : "/" + this.time.fixedAnswer.toFixed(2))
        setFormattedText(panel.find(".points"), Math.ceil(this.solved ? this.myScore() : this.score()))
        setFormattedText(panel.find(".maxPoints"), problem.score)
        panel.find(".solve").toggle(!this.isActive() && !this.solved && contest.running())
        panel.find(".solving").toggle(this.isActive() && contest.running())
        panel.find(".solved").toggle(this.solved)
        panel.find(".nonSolved").toggle(!this.solved && !contest.running())
      }
      if (this.td != undefined) {
        setFormattedText(this.td.find(".problemScore"), noZero(round(this.myScore())));
        setFormattedText(this.td.find(".problemTimeSpent"), noZero(this.timeSpent, x => x.toFixed(2)));
        setFormattedText(this.td.find(".submitTime"), noZero(this.lastSubmitTime, x => x.toFixed(2)));
      }
    },
    init: function() {
      if (this.panel == undefined) {
        return
      }
      var me = this      
      this.panel.find(".solve").click(function() { participant.activeProblem = me})
    }
  }
}