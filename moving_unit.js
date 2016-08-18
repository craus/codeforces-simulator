function createMovingUnit(params) {
  unit = createUnit($.extend({
    x: 700,
    y: 700,
    vx: 0.002,
    vy: 0.002,
    d: 0,
    vd: 0.002,
    k: 0,
    kd: 0,
    sz: 10,
    a: 0,
    aang: 0,
    details: [],
    paint: function(g) {
      this.details.forEach(call('paint'))
    },
    control: nop,
    collide: function() {
      this.details.forEach(call('collide'))
    },
    force: function(fx, fy) {
      this.vx += fx * space.tickTime
      this.vy += fy * space.tickTime
    },
    tick: function() {
      this.control()
      this.collide()
      
      this.x += this.vx * space.tickTime
      this.y += this.vy * space.tickTime
      this.d += this.vd * space.tickTime

      this.vx += this.a * Math.cos(this.d) * space.tickTime
      this.vy += this.a * Math.sin(this.d) * space.tickTime
      this.vd += this.aang * space.tickTime
      
      this.vx -= this.vx * this.k * space.tickTime
      this.vy -= this.vy * this.k * space.tickTime
      this.vd -= this.vd * this.kd * space.tickTime
    },    
  }, params))
  unit.details.forEach(function(detail) { detail.unit = unit })
  return unit
}