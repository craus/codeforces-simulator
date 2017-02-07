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
    savedata.realTime = timestamp || Date.now()
    //localStorage[saveName] = JSON.stringify(savedata)
  } 
  
  wipeSave = function() {
    saveWiped = true
    localStorage.removeItem(saveName)
    location.reload()
  }
  
  var processes = []
  
  // rules
  
  // rules balance calculation
  var A = Math.log(100)/100/Math.log(1.17) // на сколько порядков возрастёт множитель алгоритмов, если опыт возрастёт на 1 порядок
  var RA = Math.log(1.05)/Math.log(1.17) // на сколько порядков возрастёт множитель алгоритмов для рейтинга, если опыт возрастёт на 1 порядок
  var B = Math.log(100)/100/Math.log(1.23) // на сколько порядков возрастёт скорость печати, если опыт возрастёт на 1 порядок
  var AB_route = B/(1-A)
  
  var Im = Math.log(100)/100/Math.log(1.19)
  var Id = 0.2 / (Math.log(1.37))
  var u = (B + Im) / (1-A)
  var V = Id * u
  
  var Cmax = 1.0 / V
  var Cnorm = AB_route / V
  var Max_contribution_multiplier_per_contest = Math.exp(Cmax)
  var Norm_contribution_multiplier_per_contest = Math.exp(Cnorm)

  var RC = (RA + B) / (1-A)    // на сколько порядков возрастёт рейтинг, если вклад возрастёт на 1 порядок
  // r – порядок рейтинга, с – порядок вклада
  // тогда r = c * RC + q, где q - на сколько игрок старается держать рейтинг
  // q = r - c * RC
  // q IN (-inf, inf)
  // contribution_multiplier_per_contest IN (0, Max_contribution_multiplier_per_contest)
  // пусть будет contribution_multiplier_per_contest = (atan(q) / (PI/2) + 1) / 2 * Max_contribution_multiplier_per_contest
  var R = Math.log(10) / Math.log(1.07) 
  
  var r_max = (Max_contribution_multiplier_per_contest-1) * 10000
  var id_max = r_max * Id * (B + Im) / R / (A + B)
  
  var r_norm = (Norm_contribution_multiplier_per_contest-1) * 10000
  var id_norm = r_norm * Id * (B + Im) / R / (A + B)
  
  //var V = Id * (1+Im+Im*A/(1-A))
  balance = {
    A: A,
    RA: RA,
    B: B,
    AB_route: AB_route,
    Im: Im,
    Id: Id, 
    Cmax: Cmax,
    Cnorm: Cnorm,
    Max_contribution_multiplier_per_contest: Max_contribution_multiplier_per_contest,
    Norm_contribution_multiplier_per_contest: Norm_contribution_multiplier_per_contest,
    R: R,
    RC: RC,
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
  var algorithms = variable(0, 'algorithms')
  var totalAlgorithms = variable(0, 'totalAlgorithms')
  var algorithmsMastery = variable(0, 'algorithmsMastery', 'algorithms mastery')
  var imagination = variable(0, 'imagination')
  var totalImagination = variable(0, 'totalImagination')
  var imaginationMastery = variable(0, 'imaginationMastery', 'imagination mastery')
  var blindTyping = variable(0, 'blindTyping', 'blind typing')
  var totalBlindTyping = variable(0, 'totalBlindTyping')
  var blindTypingMastery = variable(0, 'blindTypingMastery', 'blind typing mastery')
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
    algorithmsMastery,
    imaginationMastery,
    blindTypingMastery,
    totalAlgorithms,
    totalImagination,
    totalBlindTyping,   
    ideas, 
    totalIdeas, 
    contribution,
    money, 
    cormen,
    keyboard, 
    rating, 
    time,     
  ]
  
  var algorithmCost = calculatable(function(){return 100*Math.pow(1.17, totalAlgorithms.get()) / Math.pow(10, cormen.get())})
  var blindTypingCost = calculatable(function(){return Math.pow(1.23, totalBlindTyping.get()) / Math.pow(10, keyboard.get())})
  var imaginationCost = calculatable(function(){return 1e5*Math.pow(1.19, totalImagination.get())})

  var experiencePerProblem = calculatable(function(){return (1+algorithms.get()) * Math.pow(100, algorithmsMastery.get())})
  var ideasPerProblem = calculatable(function() {return (1+imagination.get()) * Math.pow(100, imaginationMastery.get()) / Math.pow(1.37, totalIdeas.get()) / 100})
  
  var ratingQuality = calculatable(function() {return Math.log(rating.get()+1) - 0.75 * Math.log(contribution.get()+1)})
  var normalizedContributionMultiplier = calculatable(function() {return Math.atan(ratingQuality.get()) / (Math.PI/2)}) // IN (-1, 1)
  var contributionMultiplier = calculatable(function() {return Math.pow(8.8, normalizedContributionMultiplier.get())})

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
      [ideaGet, ideasPerProblem], 
    ],
    dependence: totalIdeas
  })
  
  contestPlayedGainsRating = createUnlinearEvent({
    reward: [
      [rating, 
      calculatable(function(){return Math.pow(1.05, algorithms.get() + 100 * algorithmsMastery.get() - 0.01 * rating.get())})]
    ],
    dependence: rating
  })
  
  var problemSolved = createEvent({
    reward: [
      [experience, experiencePerProblem], 
      [problemSolvedGainsIdea, constant(1)]
    ]
  })
  
  var problemHelpedToSolve = createEvent({
    reward: [
      [experience, experiencePerProblem],
    ]
  })
  
  var secondTicked = createEvent({
    reward: [
      [codeLines, calculatable(function(){return (1+blindTyping.get()) * Math.pow(100, blindTypingMastery.get())})],
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
      reward: [[algorithms, constant(1)], [totalAlgorithms, constant(1)]]
    },   
    {
      name: 'Learn blind typing',
      id: 'learnBlindTyping',
      cost: [[experience, blindTypingCost]],
      reward: [[blindTyping, constant(1)], [totalBlindTyping, constant(1)]]
    },
    {
      name: 'Learn imagination',
      id: 'learnImagination',
      cost: [[experience, imaginationCost]],
      reward: [[imagination, constant(1)], [totalImagination, constant(1)]]
    },
    {
      name: 'Learn algorithms mastery',
      id: 'learnAlgorithmsMastery',
      cost: [[algorithms, constant(100)]],
      reward: [[algorithmsMastery, constant(1)]]
    },   
    {
      name: 'Learn blind typing mastery',
      id: 'learnBlindTypingMastery',
      cost: [[blindTyping, constant(100)]],
      reward: [[blindTypingMastery, constant(1)]]
    },
    {
      name: 'Learn imagination mastery',
      id: 'learnImaginationMastery',
      cost: [[imagination, constant(100)]],
      reward: [[imaginationMastery, constant(1)]]
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
      reward: [[money, constant(1)], [contribution, calculatable(function(){return contribution.get() * contributionMultiplier.get() })]]
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
  
  var playContestButton = $('.playContest')  
  
  var currentContest = null
  
  playContestButton.click(function() { 
    if (currentContest != null) {
      currentContest.remove()
    }
    console.log("Started contest")
    currentContest = createContest()
  })
  
  contestant = {
    paint: function() {
      debug.profile('paint')
      setFormattedText($(".codeLinesPerSecond"), large(secondTicked.getReward(codeLines)))
      setFormattedText($(".experiencePerProblem"), large(problemSolved.getReward(experience)))
      setFormattedText($(".ideasPerProblem"), large(ideasPerProblem.get()))
      setFormattedText($(".ratingQuality"), large(ratingQuality.get()))
      setTitle($(".codeLinesPerSecond"), "+"+secondTicked.getReward(codeLines)+" per second")
      resources.each('paint')
      gameEvents.each('paint')
      if (currentContest != null) {
        currentContest.paint()
      }
      debug.unprofile('paint')
    },
    tick: function() {
      debug.profile('tick')
      var currentTime = Date.now()
      var deltaTime = currentTime - savedata.realTime
      secondTicked.run(deltaTime / 1000)
      if (currentContest != null) {
        currentContest.tick(deltaTime / 1000)
      }
      save(currentTime)
      debug.unprofile('tick')
    },
    wipeSave: function() {
      console.log("wipeSave")
      wipeSave.run(1)
    }
  }
  return contestant
}