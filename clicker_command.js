function createClickerCommand(params)
{
  var buttonGroup = $('#'+params.id)
  var less = buttonGroup.find('.less')
  var more = buttonGroup.find('.more')
  var buy = buttonGroup.find('.buy')
  var cost = $('#'+params.id+"Cost")
  
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
    paint: function() {
      enable(less, this.canZoomDown())
      enable(more, this.canZoomUp())
      enable(buy, this.canUse())
      buy.text(formatText(buy, large(this.zoom)))
      this.delta = this.getDelta()
      setTitle(buy, this.delta.map(function(resource) {
        return signPrefix(resource.value) + large(resource.value) + " " + resource.name
      }).join("<br>"))
      cost.text(formatText(cost, this.delta.filter(function(resource) { return resource.value < 0 }).map(function(resource) {
        return large(-resource.value) + " " + resource.name
      }).join("<br>")))
    }
  }, params)
  
  buy.click(function() { result.use() })
  more.click(function() { result.zoomUp() })
  less.click(function() { result.zoomDown() })
  
  return result
}