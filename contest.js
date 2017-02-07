createContest = function() {
  var contest = {
    problems: [],
    totalTime: 120, 
    penalty: 100,
    time: -5,
    submitDataAmount: 10,
    timeElapsed: function() { return Math.max(0,this.time) },
    timeLeft: function() { return this.totalTime - this.time },
    countdown: function() { return this.time < 0 },
    running: function() { return this.timeLeft() > 0 && !this.countdown() },
    finished: function() { return !this.countdown() && !this.running() },
    status: function() {
      if (this.countdown()) return "CONTEST STARTS IN " + Math.ceil(-this.time)
      if (this.running()) return this.player.rank() == this.participants.length ? "CONTEST IS RUИNING" : "CONTEST IS RUNNING"
      if (this.finished()) return "CONTEST IS OVER"
      return "?"
    },
    participants: [],
    paint: function() {
      if (this.panel != null) {
        setFormattedText(this.panel.find(".contestTimeLeft"), this.timeLeft().toFixed(2))
        setFormattedText(this.panel.find(".contestTime"), this.timeElapsed().toFixed(2))
        setFormattedText(this.panel.find(".status"), this.status())
        setFormattedText(this.panel.find(".standings"), this.finished() ? "Final standings" : "Standings")
      }
      this.problems.each('paint', this)
      this.participants.each('paint', this)
    },
    tick: function(t) {
      if (!this.finished()) {
        t = Math.min(t, this.timeLeft())
        this.time += t
      }
      if (this.running()) {
        this.participants.each('tick', t)
      }
    },
    remove: function() {
      this.participants.each('remove')
    }
  }  
  var cnt = 5

  var difficulty = Math.max(8, Math.round(gaussianRandom(75/cnt, 3)))
  var sigma = Math.max(1, Math.min(difficulty/2, Math.round(gaussianRandom(25/cnt, 0.5))))
  var ks = Math.max(0.1, gaussianRandom(1, 0.3))
  for (var i = 0; i < cnt; i++) {
    var d = Math.max(1,Math.round(gaussianRandom(i+1, 0.5)))
    var knowSpeed = Math.max(0.1, gaussianRandom(10 * ks, 3 * ks))
    contest.problems.push(problem('?', gaussed(difficulty*d, sigma*d), 500*d, knowSpeed, contest))
  }   
  contest.problems.sort((a,b) => a.score-b.score)
  for (var i = 0; i < cnt; i++) {
    contest.problems[i].name = String.fromCharCode('A'.charCodeAt()+i)
  } 
  
  var players = Math.max(2, gaussianRandom(10, 1))
  for (var i = 0; i < players; i++) {
    contest.participants.push(createParticipant(
      contest, 
      i == 0 ? createHumanParticipant : createBot,
      i == 0 ? "You" : "Bot#"+i
    ))
  }
  contest.player = contest.participants[0]
  
  var contestPanel = contest.panel
  var standings = contestPanel.find(".participantsStandings")
  contest.participants.forEach(participant => {
    var row = instantiate("participantRowSample")
    standings.append(row)
    participant.row = row
    if (participant.controller.isHuman) {
      row.addClass("info")
    }
    participant.problems.forEach(problem => {
      var td = instantiate("participantProblemCellSample")
      row.append(td)
      problem.td = td
    })
  })
  // var contestPanel = contestPanelSample.clone()
  // contestPanel.removeClass("hidden contestPanelSample")
  // contest.panel = contestPanel
  // participant.panel = contestPanel
  // competitions.append(contestPanel)
  // participant.problems.forEach(function(problem) {
    // var problemPanel = $(".problemPanelSample").clone()
    // problemPanel.removeClass("problemPanelSample hidden")
    // var problemsPanel = contestPanel.find(".problems")
    // problemsPanel.append(problemPanel)
    // problem.panel = problemPanel
    // problem.init()
  // })
  // participant.problems[0].panel.addClass("col-sm-offset-1")
  
  return contest
}