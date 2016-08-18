function createElemental(params) {
  
	// UI settings
	
	var colorOn = colors.green
	var textColor = colors.white
	
  // UI 
 
  var x0
  var y0
  var sz = 40
        
  var lines
  var print = function(text, align, baseline, font) {
    ui.text(text, x0, y0+sz*lines, textColor, font || sz, align || "start", baseline || "top")
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
      ui.color(command.alwaysTop ? colors.red : colorOn)
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
      ui.color(colorOn)
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
      ui.color(colorOn)
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
      ui.color(colorOn)
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
  
  var gameName = "elemental"
  var saveName = gameName+"SaveData"
  
  var processes = []
  
  var savedata
  if (localStorage[saveName] != undefined) {
    savedata = JSON.parse(localStorage[saveName])
  } else {
    savedata = {
      realTime: new Date().getTime()
    }
  }
  console.log("loaded " + gameName + " save: ", savedata)
  
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
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
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
  //var clicks = v(0, 'clicks')
  
  var water = v(0, 'water')
  var earth = v(0, 'earth')
  var air = v(0, 'air')
  var fire = v(0, 'fire')
  var waterIncome = v(1, 'water income')
  var earthIncome = v(1, 'earth income')
  var airIncome = v(1, 'air income')
  var fireIncome = v(1, 'fire income')
  
  var resources = [
    time,
		water,
		waterIncome,
		earth,
		earthIncome,
    air,
    airIncome,
    fire,
    fireIncome
  ]
  
  var secondTicked = createEvent({
    reward: [
      [time, k(1)],
			[water, waterIncome],
			[earth, earthIncome],
			[air, airIncome],
			[fire, fireIncome],
    ]
  })

  var linear = {}
  var singular = {}
	
	var gameEvents = [  
		buyEvent({
      name: "Water Income",
      cost: [
				[water, k(10)],
        [earth, k(1)],
			],
      reward: [[waterIncome, k(1)]],
      type: linear,
    }),  
		buyEvent({
      name: "Earth Income",
      cost: [
				[water, k(100)],
        [air, k(1)],
			],
      reward: [[earthIncome, k(1)]],
      type: linear,
    }),  
		buyEvent({
      name: "Air Income",
      cost: [
				[water, k(10000)],
        [fire, k(1)],
			],
      reward: [[airIncome, k(1)]],
      type: linear,
    }),  
		buyEvent({
      name: "Fire Income",
      cost: [
				[water, k(1e8)],
			],
      reward: [[fireIncome, k(1)]],
      type: linear,
    }),  
	]
    
  var buyEvents = gameEvents.concat([
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
      reward: [[unpredictableEvent({effect: wipeSave}), k(1)]],
      type: linear,
      alwaysTopButton: 'off',
      upButton: 'off'
    })  
  ])
     
  result = createUnit($.extend({

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
      
      x0 = 250
      y0 = 600
      lines = 0
      //print("Income: " + large(moneyPerSecond.get()))
      
      x0 = 1000
      y0 = 10
      lines = 0
      buyEvents.forEach(function(buyEvent) {
        commandButton(buyEvent)
        var eventDescription = buyEvent.name
        if (buyEvent.zoom != 1) {
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
  return result
}