var createHumanParticipant = function(contest, participant) {
  var contestPanelSample = $(".contestPanelSample")
  var competitions = $("#competitions")
  var contestPanel = contestPanelSample.clone()
  contestPanel.removeClass("hidden contestPanelSample")
  contest.panel = contestPanel
  participant.panel = contestPanel
  competitions.append(contestPanel)
  participant.problems.forEach(function(problem) {
    var problemPanel = $(".problemPanelSample").clone()
    problemPanel.removeClass("problemPanelSample hidden")
    var problemsPanel = contestPanel.find(".problems")
    problemsPanel.append(problemPanel)
    problem.panel = problemPanel
    problem.init()
  })
  participant.problems[0].panel.addClass("col-sm-offset-1")
  
  return {
    tick: function(t) {
    }, 
    remove: function() {
      contestPanel.remove()
    }, 
    isHuman: true
  }
}