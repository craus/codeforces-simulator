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
    resourcesList.forEach(function(resource) {
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
  
  resources = {
    mana: variable(5, 'mana'),
    wisdom: variable(0, 'wisdom'),
    time: variable(0, 'time'),
    globalCooldown: variable(0, 'globalCooldown', '', {
      formatter: x => x.toFixed(2)
    })
  }

  var effects = []

  var signOfWisdom = createSpell({
    name: 'signOfWisdom',
    action: function() {
      effects.push(createEffect({
        name: 'wisdom',
        wisdomIncome: 1,
        tick: function(t) {
          resources.wisdom.value += t
        },
        duration: 10
      })) 
    },
    manaCost: 1
  })
  
  var collectMana = createSpell({
    name: 'collectMana',
    action: function() {
      resources.mana.value += 1
    }
  })

  var spells = [
    signOfWisdom,
    collectMana
  ]

  var resourcesList = [
    resources.wisdom,
    resources.mana, 
    resources.time,  
    resources.globalCooldown
  ]

  spellcaster = {
    paint: function() {
      debug.profile('paint')
      
      resourcesList.each('paint')
      effects.each('paint')
      spells.each('paint')
      
      
      setFormattedText($(".wisdomIncome"), signed(noZero(effects.reduce((acc, cur) => acc + (cur.wisdomIncome || 2), 0))))
      
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = (currentTime - savedata.realTime) / 1000
      
      effects.filter(e => e.expired()).each('destroy')
      effects = effects.filter(e => !e.expired())
      effects.each('tick', deltaTime)
      
      resources.globalCooldown.value -= deltaTime
      if (resources.globalCooldown.value < 0) {
        resources.globalCooldown.value = 0
      }

      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return spellcaster
}