function createSpace(params) {
  var space = $.extend({
    ticksPerSecond: 100,
    speed: 1,
    setIntervals: function() {
      spaceTick = setInterval(this.tick.bind(this), 9)
      spacePaint = setInterval(this.paint.bind(this), 9)
    },
    frameCount: 0,
    tickCount: 0,
    time: 0,
    minLayer: 0, 
    maxLayer: 0,
    expandLayers: function(layer) {
      this.minLayer = Math.min(this.minLayer, layer)
      this.maxLayer = Math.max(this.maxLayer, layer)
    },
    paint: function() {
      this.frameCount++
      debugCounter = 0
      ui.clearDisplay()
      ui.context()
      ui.fillDisplay(colors.black)
      for (ui.layer = this.minLayer; ui.layer <= this.maxLayer; ui.layer++) {
        units.forEach(call('paint')) 
      }
    },
    tick: function() {
      for (var i = 0; i < this.ticksPerSecond / 100; i++) {
        this.tickCount++
        this.time += this.tickTime
        units.forEach(call('tick'))
      }
    },
    click: function(x, y) {
      units.forEach(call('click', x, y))
    }
  }, params)
  space.tickTime = space.speed / space.ticksPerSecond
  return space
}