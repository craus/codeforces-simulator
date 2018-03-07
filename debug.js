
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
  profileInit: function(label) {      
    debugData.profile[label] = {
      min: Number.POSITIVE_INFINITY, 
      max: 0,
      cnt: 0,
      sum: 0,
      started: null,
      total: 0,
      average: function() {
        return this.sum / Math.max(1, this.cnt)
      }
    }
  },
  profile: function(label) {  
    if (debugData.profile[label] == undefined) {
      this.profileInit(label)
    }
    var d = debugData.profile[label]
    d.started = Date.now()
  }, 
  profilePause: function(label) {   
    if (debugData.profile[label] == undefined) {
      this.profileInit(label)
    }

    var d = debugData.profile[label]
    if (!d.started) {
      return
    }
    d.total += Date.now() - d.started
    d.started = null
  },
  unprofile: function(label) {
    if (debugData.profile[label] == undefined) {
      this.profileInit(label)
    }
    var d = debugData.profile[label]
    if (!d.started) {
      return
    }
    this.profilePause(label)
    var t = d.total
    d.total = 0
    d.max = Math.max(d.max, t)
    d.min = Math.min(d.max, t)
    d.sum += t
    d.cnt += 1
  }
}