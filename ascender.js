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
  
  var level
  
  resources = [
    
  ]
  
  incomeMultipliers = []
  var money
  
  for (var i = 0; i < 100; i++) {

    var resource = createAscendResource(i, resources, () => level)
    resources.push(resource)
    if (i > 0) {
      incomeMultipliers.push(resource)
    } else {
      money = resource
    }
  }
  
  income = calculatable(() => {
    return incomeMultipliers.reduce((acc, im) => acc * im.get(), 1)
  })
  
  ascender = {
    paint: function() {
      debug.profile('paint')
      
      resources.each('paint')
      
      for (var i = resources.length-1; i >= 0; i--) {
        if (resources[i].get() > 1) {
          level = i
          break
        }
      }
      
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