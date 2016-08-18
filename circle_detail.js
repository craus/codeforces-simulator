function circleDetail(params) {    
  return $.extend({ 
    x: 0,
    y: 0,
    globalX: function() { 
      result = this.unit.x + (this.x * Math.cos(this.unit.d) + this.y * Math.sin(this.unit.d)) * this.unit.sz 
      //if (isNaN(result)) { debugInfo = ball.x }
      return result
    },
    globalY: function() { 
      return this.unit.y - (this.x * Math.cos(this.unit.d+Math.PI/2) + this.y * Math.sin(this.unit.d+Math.PI/2)) * this.unit.sz 
    },
    globalR: function() { return this.unit.sz },
    left: function() { return this.globalX() - this.globalR() },
    top: function() { return this.globalY() - this.globalR() },
    right: function() { return this.globalX() + this.globalR() },
    bottom: function() { return this.globalY() + this.globalR() },
    paint: function(){
      //ui.circle(this.globalX(), this.globalY(), this.globalR(), 'red')
    },
    collide: function(){
      if (this.left() < bounds.left) this.unit.force(bounds.k * (bounds.left - this.left()), 0)
      if (this.top() < bounds.top) this.unit.force(0, bounds.k * (bounds.top - this.top()))
      if (this.right() > bounds.right) this.unit.force(bounds.k * (bounds.right - this.right()), 0)
      if (this.bottom() > bounds.bottom) this.unit.force(0, bounds.k * (bounds.bottom - this.bottom()))
    }
  }, params);
}