createContest = function() {
  var contest = {
    problems: [],
    totalTime: 120, 
    penalty: 100,
    time: 0,
    submitDataAmount: 10,
    timeElapsed: function() { return this.time },
    timeLeft: function() { return this.totalTime - this.time },
    running: function() { return this.timeLeft() > 0 },
    participants: [],
    paint: function() {
      if (this.panel != null) {
        setFormattedText(this.panel.find(".contestTimeLeft"), this.timeLeft().toFixed(2))
        setFormattedText(this.panel.find(".contestTime"), this.timeElapsed().toFixed(2))
        setFormattedText(this.panel.find(".status"), this.running() ? "CONTEST IS RUNNING" : "CONTEST IS OVER")
      }
      this.problems.each('paint', this)
      this.participants.each('paint', this)
    },
    tick: function(t) {
      if (!this.running()) {
        return
      }
      t = Math.min(t, this.timeLeft())
      this.time += t
      this.participants.each('tick', t)
    },
    remove: function() {
      this.participants.each('remove')
    }
  }
  for (var i = 0; i < 5; i++) {
    contest.problems.push(problem(String.fromCharCode('A'.charCodeAt()+i), gaussed(15*(i+1), 5*(i+1)), 500*(i+1)))
  }    
  for (var i = 0; i < 10; i++) {
    contest.participants.push(createParticipant(
      contest, 
      i == 0 ? createHumanParticipant : createBot,
      i == 0 ? "You" : "Bot#"+i
    ))
  }
  
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