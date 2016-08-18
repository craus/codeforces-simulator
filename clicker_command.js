function createClickerCommand(params)
{
  var result = $.extend({
    zoom: 1,
    onZoomChanged: function(){},
    alwaysTop: false,
    check: function(cnt){return false},
    run: function(cnt){},
    use: function() {
      this.run(this.zoom)
    },
    canUse: function() {
      return this.check(this.zoom)
    },
    canZoomUp: function() {
      return this.check(this.zoom * 10)
    },
    canZoomDown: function() {
      return this.zoom > 1
    },
    zoomUp: function() {
      if (this.canZoomUp()) {
        this.zoom *= 10
        this.onZoomChanged()
      }
    },
    zoomDown: function() {
      if (this.canZoomDown()) {
        this.zoom /= 10
        this.onZoomChanged()
      }
    },
    adjust: function() {
      this.onZoomChanged()
      if (this.canZoomDown() && !this.canUse()) {
        this.zoom /= 10
      }
      if (this.alwaysTop) {
        if (this.canZoomUp()) {
          this.zoom *= 10
        }
      }
    },
    switchAlwaysTop: function() {
      this.alwaysTop = !this.alwaysTop
    },
  }, params)
  return result
}