var createParticipant = function({contest, createController, member, record}) {
  if (record) {
    createController = eval(record.createController)
    member = members.find(m => m.id == record.memberID)
  }
  var participant = {
    member: member,
    memberID: member.id,
    activeProblem: null,
    createController: createController.name,
    deltaRating: record ? record.deltaRating : 0,
    score: function() {
      return this.problems.reduce((total,problem)=>total+problem.myScore(),0)
    },    
    rank: function() {
      return contest.participants.indexOf(this)+1
    },
    expectedPlace: function(imaginedRating) {
      return contest.participants.filter(p => p != this).reduce((total, foe) => total + (1-this.member.winProbability(foe.member, imaginedRating)), 0)+1
    },
    recalculateRating: function() {
      var m = Math.sqrt(this.rank()*this.expectedPlace())
      var requiredRating = greatestPossible(this.member.rating-100000, this.member.rating+100000, r => this.expectedPlace(r) > m)
      this.deltaRating = (requiredRating - this.member.rating) / 2
    },
    solved: function() {
      return this.problems.reduce((total,problem)=>total+(problem.solved?1:0),0)
    },
    tick: function(t) {
      this.controller.tick(t)
      if (this.activeProblem) {
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
        setFormattedText(this.row.find(".name"), this.member.name)
        setFormattedText(this.row.find(".rank"), this.rank())
        setFormattedText(this.row.find(".score"), Math.ceil(this.score()))
        setFormattedText(this.row.find(".deltaRating"), signed(Math.round(this.deltaRating)))
        setFormattedText(this.row.find(".expectedPlace"), this.expectedPlace().toFixed(2))
        setSortableValue(this.row.find(".scoreData"), Math.ceil(this.score()))
      }
      this.problems.each('paint')
    },
    remove: function() {
      this.controller.remove()
    },
    save: function() {
      this.activeProblemIndex = this.problems.indexOf(this.activeProblem)
    }
  }
  participant.problems = contest.problems.map(function(p,i) {return participantProblem({
    contest: contest, 
    participant: participant, 
    problem: p,
    record: record ? record.problems[i] : null
  })})
  if (record) {
    participant.activeProblem = participant.problems[record.activeProblemIndex]
  }
  participant.controller = createController(contest, participant)
  return participant
}

var participantProblem = function({contest, participant, problem, record}) {
  if (record) {
    record.time = Object.assign(gaussed(0,1), record.time)
  }
  return Object.assign({
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
    activate: function() {
      participant.activeProblem = this
    },
    init: function() {
      if (this.panel == undefined) {
        return
      }     
      var me = this
      this.panel.find(".solve").click(() => me.activate())
      this.panel.find(".hotkey").attr('title', 'Hotkey: ' + this.problem.hotkey).tooltip('fixTitle')
      window.addEventListener("keydown", (e) => {
        if (e.key == me.problem.hotkey) {
          me.activate()
        }
      })
    }
  }, record || {})
}