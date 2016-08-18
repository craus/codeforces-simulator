
debugInfo = 'No data debugged'
debugData = {}
debugCounter = 0
debug = {
  paused: false,
  log: function() {
    debugInfo = arguments
  },
  pause: function() {
    this.paused = !this.paused
  }
}