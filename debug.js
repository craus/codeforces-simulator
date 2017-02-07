
debugInfo = 'No data debugged'
debugData = {
  profile: {}
}
debugCounter = 0
debug = {
  paused: false,
  log: function() {
    debugInfo = arguments
  },
  pause: function() {
    this.paused = !this.paused
  },
  profile: function(label) {  
    if (debugData.profile[label] == undefined) {
      debugData.profile[label] = {
        min: Number.POSITIVE_INFINITY, 
        max: 0,
        cnt: 0,
        sum: 0,
        started: 0,
        total: 0,
        average: function() {
          return this.sum / Math.max(1, this.cnt)
        }
      }
    }
    var d = debugData.profile[label]
    d.started = Date.now()
  }, 
  profilePause: function(label) {
    var d = debugData.profile[label]
    d.total += Date.now() - d.started
  },
  unprofile: function(label) {
    this.profilePause(label)
    var d = debugData.profile[label]
    var t = d.total
    d.total = 0
    d.max = Math.max(d.max, t)
    d.min = Math.min(d.max, t)
    d.sum += t
    d.cnt += 1
  }
}