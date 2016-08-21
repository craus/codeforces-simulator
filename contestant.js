function createContestant(params) {
  
  // Rules common things
    
  var gameName = "contestant"
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
    savedata.realTime = timestamp || new Date().getTime()
    localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  var processes = []
  
  // rules
  
  // rules balance calculation
  var A = Math.log(100)/100/Math.log(1.17)
  var B = Math.log(100)/100/Math.log(1.23)
  var AB_route = B/(1-A)
  
  var Im = Math.log(100)/100/Math.log(1.19)
  var Id = 0.2 / (Math.log(2))
  var u = (B + Im) / (1-A)
  var V = Id * u
  
  var Cmax = 1.0 / V
  var Cnorm = AB_route / V
  var Max_contribution_multiplier_per_contest = Math.exp(Cmax)
  var Norm_contribution_multiplier_per_contest = Math.exp(Cnorm)

  var R = Math.log(10) / Math.log(1.07) 
  
  var r_max = (Max_contribution_multiplier_per_contest-1) * 10000
  var id_max = r_max * Id * (B + Im) / R / (A + B)
  
  var r_norm = (Norm_contribution_multiplier_per_contest-1) * 10000
  var id_norm = r_norm * Id * (B + Im) / R / (A + B)
  
  //var V = Id * (1+Im+Im*A/(1-A))
  balance = {
    A: A,
    B: B,
    AB_route: AB_route,
    Im: Im,
    Id: Id, 
    Cmax: Cmax,
    Cnorm: Cnorm,
    Max_contribution_multiplier_per_contest: Max_contribution_multiplier_per_contest,
    Norm_contribution_multiplier_per_contest: Norm_contribution_multiplier_per_contest,
    R: R,
    r_max: r_max,
    id_max: id_max,
    r_norm: r_norm,
    id_norm: id_norm
  }
  console.log("Balance: ", balance)
  
  // var testResource = v(0, 'test resource')
  // var f = digitFunction(10, testResource)
  // for (var i = 0; i < 100; i++) {
    // testResource.value = i
    // console.log("testResource.value: " + testResource.get())
    // console.log("f: " + f())
  // }
  
  var codeLines = variable(7, 'codeLines', 'code lines')
  var experience = variable(0, 'experience', 'experience', {formatter: large})
  var algorithms = variable(1, 'algorithms')
  var imagination = variable(1, 'imagination')
  var blindTyping = variable(1, 'blindTyping', 'blind typing')
  var ideas = variable(0, 'ideas', 'ideas', {formatter: large})
  var totalIdeas = variable(0, 'totalIdeas', 'total ideas') 
  var contribution = variable(0, 'contribution', 'contribution', {formatter: large})
  var money = variable(0, 'money', 'money', {formatter: large})
  var cormen = variable(0, 'cormenLevel', 'cormen level')
  var keyboard = variable(0, 'keyboardLevel', 'keyboard level')
  var rating = variable(0, 'rating', 'rating', {formatter: large})
  var time = variable(0, 'time')

  var resources = [
    codeLines, 
    experience,
    algorithms,
    imagination,
    blindTyping,
    ideas, 
    totalIdeas, 
    contribution,
    money, 
    cormen,
    keyboard, 
    rating, 
    time,     
  ]
  
  var ideaGet = createEvent({
    reward: [
      [ideas, constant(1)],
      [totalIdeas, constant(1)]
    ]
  })
  // problemSolvedGainsIdea = {
    // run: function(cnt) {
      // while (cnt > 0) {
        // var nextIntTotalIdeas = 1 + Math.floor(totalIdeas.get())
        // var partOfIdea = nextIntTotalIdeas - totalIdeas.get()
        // var problemForNextIdea = partOfIdea / ideasPerProblem()
        // if (cnt >= problemForNextIdea) {
          // cnt -= problemForNextIdea
          // ideaGet.run(partOfIdea)
        // }
        // else {
          // ideaGet.run(cnt * ideasPerProblem())
          // cnt = 0
        // }
      // }
    // }, 
    // reward: [
      // [ideas],
      // [totalIdeas]
    // ]
  // }
  
  problemSolvedGainsIdea = createUnlinearEvent({
    reward: [
      [ideaGet, calculatable(function() {return imagination.get() / Math.pow(1.11, totalIdeas.get())})], 
    ],
    dependence: totalIdeas
  })
  
  contestPlayedGainsRating = createUnlinearEvent({
    reward: [
      [rating, calculatable(function(){return Math.pow(10, algorithms.get()) / Math.floor(Math.pow(1.07, rating.get()))})]
    ],
    dependence: rating
  })
  
  var problemSolved = createEvent({
    reward: [
      [experience, algorithms], 
      [problemSolvedGainsIdea, constant(1)]
    ]
  })
  
  var problemHelpedToSolve = createEvent({
    reward: [
      [experience, algorithms],
    ]
  })
  
  var secondTicked = createEvent({
    reward: [
      [codeLines, blindTyping],
      [time, constant(1)]
    ]
  })
  
  var events = [problemSolved]

  var ticker = derivative({
    speed: constant(1),
    value: secondTicked
  })
  var timer = derivative({
    speed: constant(1),
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
  
  var algorithmCost = calculatable(function(){return 100*Math.pow(1.17, algorithms.get()-1) / Math.pow(10, cormen.get())})
  var blindTypingCost = calculatable(function(){return Math.pow(1.23, blindTyping.get()-1) / Math.pow(10, keyboard.get())})
  var imaginationCost = calculatable(function(){return 1e5*Math.pow(1.19, imagination.get()-1)})
  var gameEvents = [
    {
      name: 'Solve problem',
      id: 'solve',
      cost: [[codeLines, constant(10)]],
      reward: problemSolved,
      type: linear
    },
    {
      name: 'Learn algorithm',
      id: 'learnAlgorithms',
      cost: [[experience, algorithmCost]],
      reward: [[algorithms, constant(1)]]
    },   
    {
      name: 'Learn blind typing',
      id: 'learnBlindTyping',
      cost: [[experience, blindTypingCost]],
      reward: [[blindTyping, constant(1)]]
    },
    {
      name: 'Learn imagination',
      id: 'learnImagination',
      cost: [[experience, imaginationCost]],
      reward: [[imagination, constant(1)]]
    },
    {
      name: 'Play contest',
      id: 'playContest',
      cost: [[codeLines, constant(50)]],
      reward: contestPlayedGainsRating,
      type: linear,
    },
    {
      name: 'Create contest',
      id: 'createContest',
      cost: [[codeLines, constant(500)], [ideas, constant(5)]],
      reward: [[money, constant(1)], [contribution, calculatable(function(){return contribution.get() * rating.get() / 10000 })]]
    },  
    {
      name: 'Upgrade Cormen',
      id: 'upgradeCormen',
      cost: [[money, calculatable(function(){return 1 * Math.pow(cormen.get()+1, 0.37)})]],
      reward: [[cormen, constant(1)]]
    },
    {
      name: 'Upgrade keyboard',
      id: 'upgradeKeyboard',
      cost: [[money, calculatable(function(){return 1 * Math.pow(keyboard.get()+1, 0.29)})]],
      reward: [[keyboard, constant(1)]]
    },
    {
      name: 'Ask for help',
      id: 'askForHelp',
      cost: [[contribution, constant(1)]],
      reward: [[problemHelpedToSolve, constant(1)]],
      type: linear, 
    },
    {
      name: 'Help somebody',
      id: 'helpSomebody',
      cost: [[codeLines, constant(11)]],
      reward: [[contribution, constant(1)]],
      type: linear,
    },
    {
      name: "Advance Second",
      id: "skip",
      cost: [],
      reward: [[secondTicked, constant(1)]],
      type: linear,
      alwaysTopButton: 'off'
    }
  ].map(function(event) {
    return ((event.type == linear) ? buyEvent : unlinearBuyEvent)(event)
  })
  
  var wipeSave = buyEvent({
    name: "Wipe Save",
    cost: [],
    reward: [[unpredictableEvent({effect: wipeSave}), constant(1)]],
    type: linear,
    alwaysTopButton: 'off',
    upButton: 'off'
  })
  
    
  contestant = {
    paint: function() {
      setFormattedText($("#codeLinesPerSecond"), secondTicked.getReward(codeLines))
      setFormattedText($("#experiencePerProblem"), problemSolved.getReward(experience))
      setTitle($("#codeLinesPerSecond"), "+"+secondTicked.getReward(codeLines)+" per second")
      resources.each('paint')
      gameEvents.each('paint')
    },
    tick: function() {
      var currentTime = new Date().getTime()
      var deltaTime = currentTime - savedata.realTime
      secondTicked.run(deltaTime / 1000)
      save(currentTime)
    },
    wipeSave: function() {
      console.log("wipeSave")
      wipeSave.run(1)
    }
  }
  return contestant
}