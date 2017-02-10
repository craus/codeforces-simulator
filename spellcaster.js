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
    mana: variable(5, 'mana', 'mana', {
      formatter: x => x.toFixed(0)
    }),
    wisdom: variable(0, 'wisdom', 'wisdom', {
      formatter: x => x.toFixed(0)
    }),
    time: variable(0, 'time', 'time', {
      formatter: x => x.toFixed(2)
    }),
    readiness: variable(5, 'readiness', 'readiness', {
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
  var durationMultiplier = calculatable(() => {
    return effects.reduce((acc, cur) => acc * (cur.durationMultiplier || 1), 1)
  })
  var duration = calculatable(() => 10 * durationMultiplier.get())
  
  var spells = {
    signOfWisdom: createSpell({
      name: 'signOfWisdom',
      power: effectMultiplier,
      duration: duration,
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
          duration: this.duration.get()
        })) 
      },
      cost: costMultiplier,
      hotkey: "1"
    }),
  
    collectMana: createSpell({
      name: 'collectMana',
      power: effectMultiplier,
      action: function() {
        resources.mana.value += this.power.get()
      },
      cost: {wisdom: calculatable(() => 0.1 * costMultiplier.get())},
      hotkey: "2"
    }),
  
    empower: createSpell({
      name: 'empower',
      power: calculatable(() => Math.pow(2, effectMultiplier.get())),
      power2: calculatable(() => Math.pow(3, effectMultiplier.get())),
      duration: duration,
      action: function() {
        effects.push(createEffect({
          name: 'empower',
          effectMultiplier: this.power.get(),
          costMultiplier: this.power2.get(),
          duration: this.duration.get(),
          paint: function() {
            setFormattedText(this.panel.find(".effectMultiplier"), large(this.effectMultiplier))
            setFormattedText(this.panel.find(".costMultiplier"), large(this.costMultiplier))
          }
        })) 
      },
      cost: costMultiplier,
      hotkey: "3"
    }),
    
    cancel: createSpell({
      name: 'cancel',
      power: effectMultiplier,
      action: function() {
        var actualPower = Math.min(effects.length, this.power.get())
        for (var i = 0; i < actualPower; i++) {
          effects[0].destroy()
          effects.shift()
        }
      },
      hotkey: "4", 
      paint: function() {
        setFormattedText(this.panel.find(".cancelWhat"), this.power.get() == 1 ? "the oldest effect" : this.power.get() + " oldest effects")
      }
    }),
    
    prolong: createSpell({
      name: 'prolong',
      power: calculatable(() => Math.pow(2, effectMultiplier.get())),
      power2: calculatable(() => Math.pow(3, effectMultiplier.get())),
      duration: duration,
      action: function() {
        effects.push(createEffect({
          name: 'prolong',
          durationMultiplier: this.power.get(),
          prolongCostMultiplier: this.power2.get(),
          duration: this.duration.get(),
          paint: function() {
            setFormattedText(this.panel.find(".durationMultiplier"), large(this.durationMultiplier))
            setFormattedText(this.panel.find(".prolongCostMultiplier"), large(this.prolongCostMultiplier))
          }
        })) 
      },
      cost: calculatable(() => {
        return effects.reduce((acc, cur) => acc * (cur.prolongCostMultiplier || 1), 1) * costMultiplier.get()
      }),
      hotkey: "5"
    }),
  }

  var spellsList = [
    spells.signOfWisdom,
    spells.collectMana,
    spells.empower,
    spells.cancel, 
    spells.prolong
  ]

  var resourcesList = [
    resources.wisdom,
    resources.mana, 
    resources.time,  
    resources.readiness
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
      
      resources.readiness.value = (resources.readiness.value + deltaTime).clamp(0,5)

      save(currentTime)
      debug.unprofile('tick')
    }
  }
  return spellcaster
}