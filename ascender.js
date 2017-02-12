function createAscender(params) {
  
  // Rules common things
    
  var gameName = "spellcaster"
  var saveName = gameName+"SaveData"

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
      savedata[resource.id] = resource.value
    })
    savedata.realTime = timestamp || Date.now()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  resources = [
    
  ]
  
  incomeMultipliers = []
  var money
  
  for (var i = 0; i < 100; i++) {
    var name
    if (i == 0) {
      name = "Money"
    } else if (i == 1) {
      name = "Income"
    } else if (i == 2) {
      name = "Income multiplier"
    } else {
      name = "Income multiplier #" + (i-1)
    }
    var id = "resource" + i
    var panel = instantiate("resourcePanelSample")
    panel.find('.value').addClass(id)
    panel.find('.name').text(name)
    $('.resources').append(panel)
    var resource = variable(1, id, name)
    resources.push(resource)
    if (i > 0) {
      incomeMultipliers.push(resource)
    } else {
      money = resource
    }
  }
  
  var income = calculatable(() => {
    return incomeMultipliers.reduce((acc, im) => acc * im.get(), 1)
  })

  ascender = {
    paint: function() {
      debug.profile('paint')
      
      resources.each('paint')
      
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      money.value += income.get() * deltaTime
      
      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return ascender
}