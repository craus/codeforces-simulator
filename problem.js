var problem = function(name, time, score) {
  return {
    name: name, 
    time: time,
    score: score,
    timeSpent: 0,
    isActive: false,
    solved: false,
    knowSpeed: 10.0 / time.m,
    paint: function(contest) {
      var panel = this.panel
      if (panel == undefined) {
        return
      }
      setFormattedText(panel.find(".name"), this.name)
      setFormattedText(panel.find(".timeLeft"), round(this.time.m), round(3*this.time.sigma))
      setFormattedText(panel.find(".timeSpent"), round(this.timeSpent))
      setFormattedText(panel.find(".points"), this.score)
      panel.find(".solve").toggle(!this.isActive && !this.solved && contest.running())
      panel.find(".solving").toggle(this.isActive && contest.running())
      panel.find(".solved").toggle(this.solved)
    },
    tick: function(contest, t) {
      if (!this.isActive || !contest.running()) {
        return
      }
      this.timeSpent += t
      this.time.m -= t
      if (this.time.m < 0) {
        this.time.m = 0
        this.time.sigma = 0
        this.solved = true
        contest.solved += 1
        contest.score += score
        this.isActive = false
      }
      this.time = this.time.know(t*this.knowSpeed)
    },
    initPanel: function(contest) {
      var me = this
      this.panel.find(".solve").click(function() {
        contest.problems.forEach(function(p) {p.isActive = false})
        me.isActive = true
      })
    }
  }
}