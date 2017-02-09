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
  
  var effectMultiplier = calculatable(() => {
    return effects.reduce((acc, cur) => acc * (cur.effectMultiplier || 1), 1)
  })
  var costMultiplier = calculatable(() => {
    return effects.reduce((acc, cur) => acc * (cur.costMultiplier || 1), 1)
  })

  var spells = {
    signOfWisdom: createSpell({
      name: 'signOfWisdom',
      power: effectMultiplier,
      action: function() {
        effects.push(createEffect({
          name: 'wisdom',
          wisdomIncome: this.power.get(),
          tick: function(t) {
            resources.wisdom.value += t * this.wisdomIncome
          },
          paint: function() {
            setFormattedText(this.panel.find(".income"), large(this.wisdomIncome))
          },
          duration: 10
        })) 
      },
      cost: costMultiplier
    }),
  
    collectMana: createSpell({
      name: 'collectMana',
      power: effectMultiplier,
      action: function() {
        resources.mana.value += this.power.get()
      }
    }),
  
    empower: createSpell({
      name: 'empower',
      power: calculatable(() => Math.pow(2, effectMultiplier.get())),
      power2: calculatable(() => Math.pow(3, effectMultiplier.get())),
      action: function() {
        effects.push(createEffect({
          name: 'empower',
          effectMultiplier: this.power.get(),
          costMultiplier: this.power2.get(),
          duration: 10,
          paint: function() {
            setFormattedText(this.panel.find(".effectMultiplier"), large(this.effectMultiplier))
            setFormattedText(this.panel.find(".costMultiplier"), large(this.costMultiplier))
          }
        })) 
      },
      cost: costMultiplier
    })
  }

  var spellsList = [
    spells.signOfWisdom,
    spells.collectMana,
    spells.empower
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
      spellsList.each('paint')
      
      
      setFormattedText($(".wisdomIncome"), signed(noZero(effects.reduce((acc, cur) => acc + (cur.wisdomIncome || 0), 0))))
      
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