function createFighter(params) {
  
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
    
    if ((command.upButton || 'on') == 'on' && command.canZoomUp()) {
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
  
  var savedata
  if (localStorage.ascenderSaveData != undefined) {
    savedata = JSON.parse(localStorage.ascenderSaveData)
  } else {
    savedata = {
      realTime: new Date().getTime()
    }
  }
  console.log("loaded ascender save: ", savedata)
  
  var saveWiped = false
  
  var save = function(timestamp) {
    if (saveWiped) {
      return
    }
    savedata = {}
    resources.forEach(function(resource) {
      savedata[resource.name] = resource.value
    })
    savedata.realTime = timestamp || new Date().getTime()
    localStorage.ascenderSaveData = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem("ascenderSaveData")
    location.reload()
  }
  
  var v = function(initialValue, name) {
    if (savedata[name] != undefined) {
      initialValue = savedata[name]
    }
    return {
      value: initialValue, 
      name: name,
      get: function(){return this.value}
    }
  }
  
  var c = function(calculator) {
    return {
      get: calculator
    }
  }
  
  var k = function(x){return c(function(){return x})}
  
  // rules
   
  var time = v(0, 'time')
  var money = v(0, 'money')
  var income = v(1, 'income')
  var fatigue = v(1, 'fatigue')
  var endurance = v(1, 'endurance')
  var speed = v(1, 'speed')
  var heritage = v(0, 'heritage')
  var boost = v(0, 'boost')
  var incomeAdvance = v(0.001, 'incomeAdvance')  
  
  var resources = [
    time,
    money,
    income,
    fatigue,
    endurance,
    speed,
    heritage,
    boost
  ]
  
  var secondTicked = createEvent({
    reward: [
      [money, c(function(){return income.get() * speed.get()})],
      [income, c(function(){return incomeAdvance.get() * speed.get()})],
      [time, k(1)]
    ]
  })

  var linear = {}
  
  var dropMoneyToHeritage = {
    run: function() {
      money.value = heritage.get()
    },
    backupSelf: function() {
      money.backup = money.value
    },
    restoreSelf: function() {
      money.value = money.backup
    },
    name: "money <- heritage"
  }
  
  var buyEvents = [
    buyEvent({
      name: "Ascend",
      cost: [
        [income, income]
      ],
      reward: [
        [income, c(function(){return money.get() / fatigue.get()})], 
        [money, c(function(){return -money.get()})],
        [fatigue, c(function(){return fatigue.get() / endurance.get()})],
        [secondTicked, boost]
      ],
      type: linear,
      alwaysTopButton: 'off',
      upButton: 'off'
    }),
    buyEvent({
      name: "Endurance",
      cost: [
        [endurance, endurance]
      ],
      reward: [
        [endurance, c(function(){return 1 + Math.log(money.get()) / Math.log(1e6)})],
        [income, c(function(){return -income.get() + 1})], 
        [dropMoneyToHeritage, k(1)],
        [fatigue, c(function(){return -fatigue.get() + 1})]
      ],
      type: linear,
      alwaysTopButton: 'off',
      upButton: 'off'
    }),
    buyEvent({
      name: "Speed",
      cost: [
        [speed, speed]
      ],
      reward: [
        [speed, c(function(){return 1 + Math.log(money.get()) / Math.log(1e3)})],
        [income, c(function(){return -income.get() + 1})], 
//        [money, c(function(){return -money.get()+heritage.get()})],
        [dropMoneyToHeritage, k(1)],
        [fatigue, c(function(){return -fatigue.get() + 1})]
      ],
      type: linear,
      alwaysTopButton: 'off',
      upButton: 'off'
    }),
    buyEvent({
      name: "Heritage",
      cost: [
        [heritage, heritage]
      ],
      reward: [
        [heritage, c(function(){return Math.pow(money.get(), 0.321)})],
        [income, c(function(){return -income.get() + 1})], 
        [dropMoneyToHeritage, k(1)],
        [fatigue, c(function(){return -fatigue.get() + 1})]
      ],
      type: linear,
      alwaysTopButton: 'off',
      upButton: 'off'
    }),  
    buyEvent({
      name: "Boost",
      cost: [
        [boost, boost]
      ],
      reward: [
        [boost, c(function(){return Math.log(money.get()) / Math.log(1e4)})],
        [income, c(function(){return -income.get() + 1})], 
        [dropMoneyToHeritage, k(1)],
        [fatigue, c(function(){return -fatigue.get() + 1})]
      ],
      type: linear,
      alwaysTopButton: 'off',
      upButton: 'off'
    }),
    buyEvent({
      name: "Refresh",
      cost: [],
      reward: [
        [income, c(function(){return -income.get() + 1})], 
        [dropMoneyToHeritage, k(1)],
        [fatigue, c(function(){return -fatigue.get() + 1})]
      ],
      type: linear,
      alwaysTopButton: 'off',
      upButton: 'off'
    }),   
    buyEvent({
      name: "Advance Second",
      cost: [],
      reward: [[secondTicked, k(1)]],
      type: linear,
      alwaysTopButton: 'off'
    }),     
    buyEvent({
      name: "Wipe Save",
      cost: [],
      reward: [[{
        enabled: true,
        backupSelf: function() { this.enabled = false },
        run: function() {
          if (this.enabled) wipeSave()
        },
        restoreSelf: function() { this.enabled = true }
      }, k(1)]],
      type: linear,
      alwaysTopButton: 'off',
      upButton: 'off'
    })  
  ]
     
  ascender = createUnit($.extend({

    paint: function() {

      buttons = []
      x0 = 250
      y0 = 10
      lines = 0
      resources.forEach(function(resource) {
        print(large(resource.value), 'end')
      })
      x0 = 250
      y0 = 10
      lines = 0
      resources.forEach(function(resource) {
        print(" " + resource.name)
      })
      
      // x0 = 250
      // y0 = 600
      // lines = 0
      // ui_processes.forEach(function(process) {
        // print(signPrefix(process.speed.get()) + large(process.speed.get()), 'end')
      // })
      
      // x0 = 250
      // y0 = 600
      // lines = 0
      // ui_processes.forEach(function(process) {
        // print(" " + process.value.name + " per second")
      // })
      
      x0 = 1000
      y0 = 10
      lines = 0
      buyEvents.forEach(function(buyEvent) {
        commandButton(buyEvent)
        var eventDescription = buyEvent.name
        if (buyEvent.upButton != 'off') {
          eventDescription += " " + large(buyEvent.zoom) + " times"
        }
        print(eventDescription)
        var delta = buyEvent.delta
        print(delta.map(function(resource) {
          return signPrefix(resource.value) + large(resource.value) + " " + resource.name
        }).join("; "), null, null, 20)
      })
    },
    tick: function() {
      var currentTime = new Date().getTime()
      var deltaTime = currentTime - savedata.realTime
      secondTicked.run(deltaTime / 1000)
      save(currentTime)
    },
    click: function(x, y) {
      buttons.forEach(function(button) {
        if (x > button.l && x < button.r && y > button.t && y < button.b) button.onclick()
      }) 
    }
  }, params))
  return ascender
}