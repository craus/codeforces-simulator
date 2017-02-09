function createSpellcaster(params) {
  
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
    //localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  var mana = variable(5, 'mana')
  var wisdom = variable(0, 'wisdom')
  var time = variable(0, 'time')

  var effects = []

  var lastEffectID = 0

  var addEffect = function(effect) {
    effects.push(effect) 
  }

  var signOfWisdom = createSpell('signOfWisdom', () => { addEffect(createWisdomEffect(1, 10)) })

  var spells = [
    signOfWisdom
  ]

  var resources = [
    wisdom,
    mana, 
    time,     
  ]

  spellcaster = {
    paint: function() {
      debug.profile('paint')
      resources.each('paint')
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      effects.each('tick')

      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return spellcaster
}