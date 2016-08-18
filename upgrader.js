function createUpgrader(params) {
  
  // UI 
 
  var x0
  var y0
  var sz = 40
        
  var lines
  var print = function(text, align, baseline, font) {
    ui.text(text, x0, y0+sz*lines, colors.white, font || sz, align || "start", baseline || "top")
    lines += 1
  }
  var button = function(onclick) {
    var d = sz * 0.1
    ui.rect(x0-sz+d,y0+sz*lines+d,sz-2*d,sz-2*d,colors.green)
    buttons.push({l: x0-sz+d, t: y0+sz*lines+d, r: x0-d, b: y0+sz+sz*lines-d, onclick: onclick})
  }
  var commandButton = function(command) {
    command.adjust()
    var d = 0.1
    var arrow = function() {
      ui.polygon([
        {x: 0, y: -0.5+d},
        {x: -0.5+d, y: 0.5-d},
        {x: 0.5-d, y: 0.5-d}
      ])          
    }
    ui.transform(x0-4*sz+sz/2,y0+sz*lines+sz/2,sz)
    if ((command.alwaysTopButton || 'on') == 'on') {
      ui.move(0,0)  
      ui.color(command.alwaysTop ? colors.red : colors.green)
      arrow()
      ui.line(-0.5+d, -0.5+d, 0.5-d, -0.5+d,3)
      ui.untransform()
      buttons.push({
        l: x0-4*sz+d, 
        t: y0+sz*lines+d, 
        r: x0-4*sz+sz-d, 
        b: y0+sz+sz*lines-d, 
        onclick: function(){command.switchAlwaysTop()}
      })       
    }
    
    if (command.canZoomUp()) {
      ui.move(1,0)
      ui.color(colors.green)
      arrow()
      ui.untransform()
      buttons.push({
        l: x0-3*sz+d,
        t: y0+sz*lines+d, 
        r: x0-3*sz+sz-d, 
        b: y0+sz+sz*lines-d, 
        onclick: function(){command.zoomUp()}       
      })
    }

    if (command.canZoomDown() && !command.alwaysTop) {
      ui.move(2,0)
      ui.rotate(Math.PI)
      ui.color(colors.green)
      arrow()
      ui.untransform()
      ui.untransform()
      buttons.push({
        l: x0-2*sz+d, 
        t: y0+sz*lines+d, 
        r: x0-2*sz+sz-d, 
        b: y0+sz+sz*lines-d, 
        onclick: function(){command.zoomDown()}
      })       
    }
    
    if (command.canUse()) {
      ui.move(3,0)
      ui.rotate(Math.PI/2)
      ui.color(colors.green)
      arrow()
      ui.untransform()
      ui.untransform()
      buttons.push({
        l: x0-1*sz+d, 
        t: y0+sz*lines+d, 
        r: x0-1*sz+sz-d, 
        b: y0+sz+sz*lines-d, 
        onclick: function(){command.use()}
      })       
    }
    ui.untransform()
  }
  
  var signPrefix = function(x) { 
    if (x > 0) return "+";
    return "";
  }
  large = function(x) {
    if (x == 0) return 0
    if (Math.abs(x) > 1e4*(1+eps) || Math.abs(x) < 1-eps) return x.toPrecision(4) 
    if (Math.abs(x - Math.floor(x+eps)) < eps) return Math.floor(x+eps)
    return x.toPrecision(4) 
  }
  
  // Rules common things
  
  var processes = []
  
  var v = function(initialValue, name) {
    return {
      value: initialValue, 
      name: name,
      get: function(){return this.value},
      show: function() { return true }
    }
  }
  
  var c = function(calculator) {
    return {
      get: calculator
    }
  }
  
  var k = function(x){return c(function(){return x})}
  
  // rules
  
  var discountMultiplier = function() { return 1 + discount.total() }
  var upgrades = []
  
  var upgrade = function(value, name) {
    var result = v(value, name)
    var resultFree = v(0, 'free ' + name)
    result.free = resultFree
    result.total = function() { return result.get()+result.free.get() }
    upgrades.push(result)
    return result
  }
  
  var money = v(10, 'money')
  var time = v(0, 'time')
  var science = upgrade(0, 'science')
  var workers = upgrade(0, 'workers')
  var economics = upgrade(0, 'economics')
  var discount = upgrade(0, 'discount')
  var freeUpgradeSlots = v(0, 'free upgrade slots')
  freeUpgradeSlots.show = function() { return freeUpgradeSlots.value > 0 }
  var freeUpgradeSlotsTotal = v(0, 'free upgrade slots total')
  freeUpgradeSlotsTotal.show = function() { return freeUpgradeSlots.value > 0 }
  
  var resources = [
    money,
    time,
    science, science.free,
    workers, workers.free,
    economics, economics.free,
    discount, discount.free,
    freeUpgradeSlots,
    freeUpgradeSlotsTotal
  ]
  
  var secondTicked = createEvent({
    reward: [[money, c(function(){return workers.total() * (1 + economics.total())})]]
  })

  var ticker = derivative({
    speed: k(1),
    value: secondTicked
  })
  var timer = derivative({
    speed: k(1),
    value: time
  })
  var processes = [
    ticker, 
    timer
  ]
  
  var ui_processes = [
    ticker  
  ]

  var linear = {}
  
  var upgradeBuyEvent = function(resource, scienceRequired, extraRewards, toTheRight) {
    extraRewards = extraRewards || []
    return unlinearBuyEvent({
      name: 'Upgrade ' + resource.name,
      cost: [[money, c(function(){return Math.pow(10, resource.get()) / discountMultiplier()})]],
      reward: [[resource, k(1)]].concat(extraRewards),
      alwaysTopButton: 'off',
      show: function() { return science.total() >= scienceRequired },
      toTheRight: toTheRight || freeUpgrade(resource.free, scienceRequired, extraRewards)
    })
  }
  
  var freeUpgrade = function(resource, scienceRequired, extraRewards) {
    extraRewards = extraRewards || []
    return unlinearBuyEvent({
      name: 'Free ' + resource.name,
      cost: [[freeUpgradeSlots, k(1)]],
      reward: [[resource, k(1)]].concat(extraRewards),
      alwaysTopButton: 'off',
      show: function() { return science.total() >= scienceRequired && freeUpgradeSlotsTotal.get() > 0 }
    })
  }
  
  buyEvents = [
    upgradeBuyEvent(science, 0),
    upgradeBuyEvent(workers, 1),
    upgradeBuyEvent(economics, 2),
    upgradeBuyEvent(discount, 3),
    upgradeBuyEvent(freeUpgradeSlotsTotal, 4, [[freeUpgradeSlots, k(1)]], buyEvent({
      name: 'Reset all free upgrades',
      cost: [[money, k(0)]],
      reward: [[money, k(0)]],
      alwaysTopButton: 'off',
      show: function() { return freeUpgradeSlotsTotal > 0 }
    })),

    buyEvent({
      name: 'Tick a second',
      cost: [],
      reward: [[time, k(1)], [secondTicked, k(1)]],
      alwaysTopButton: 'off'
    })
  ]
    
  upgrader = createUnit($.extend({

    paint: function() {

      buttons = []
      x0 = 200
      y0 = 10
      lines = 0
      resources.filter(function(resource){return resource.show()}).forEach(function(resource) {
        print(large(resource.value), 'end')
      })
      x0 = 200
      y0 = 10
      lines = 0
      resources.filter(function(resource){return resource.show()}).forEach(function(resource) {
        print(" " + resource.name)
      })
      
      x0 = 200
      y0 = 600
      lines = 0
      ui_processes.forEach(function(process) {
        print(signPrefix(process.speed.get()) + large(process.speed.get()), 'end')
      })
      
      x0 = 200
      y0 = 600
      lines = 0
      ui_processes.forEach(function(process) {
        print(" " + process.value.name + " per second")
      })
      
      x0 = 600
      y0 = 10
      lines = 0
      buyEvents.forEach(function(buyEvent) {
        if (!buyEvent.show()) return
        commandButton(buyEvent)
        print(buyEvent.name + " " + large(buyEvent.zoom) + " times")
        var delta = buyEvent.delta
        print(delta.map(function(resource) {
          return signPrefix(resource.value) + large(resource.value) + " " + resource.name
        }).join("; "), null, null, 20)
      })
      
      x0 = 1400
      y0 = 10
      lines = 0
      buyEvents.forEach(function(buyEvent) {
        buyEvent = buyEvent.toTheRight
        console.log(buyEvent)
        if (buyEvent == undefined) return
        if (!buyEvent.show()) return
        commandButton(buyEvent)
        print(buyEvent.name + " " + large(buyEvent.zoom) + " times")
        var delta = buyEvent.delta
        print(delta.map(function(resource) {
          return signPrefix(resource.value) + large(resource.value) + " " + resource.name
        }).join("; "), null, null, 20)
      })
    },
    tick: function() {
      processes.forEach(call('tick'))
    },
    click: function(x, y) {
      buttons.forEach(function(button) {
        if (x > button.l && x < button.r && y > button.t && y < button.b) button.onclick()
      }) 
    }
  }, params))
  return upgrader
}