function createContestant(params) {
  
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
    
  var gameName = "contestant"
  var saveName = gameName+"SaveData"
  
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
  
  var processes = []

  var k = function(x){return c(function(){return x})}
  
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
  
  var digitFunction = function(base, resource)
  {
    return function() {
      return Math.pow(base, Math.floor(resource.get()/base)) * ((resource.get())%base+1) 
    }
  }
  // var testResource = v(0, 'test resource')
  // var f = digitFunction(10, testResource)
  // for (var i = 0; i < 100; i++) {
    // testResource.value = i
    // console.log("testResource.value: " + testResource.get())
    // console.log("f: " + f())
  // }
  
  var codeLines = v(0, 'code lines')
  var experience = v(0, 'experience')
  var algorithms = v(0, 'algorithms')
  var imagination = v(0, 'imagination')
  var blindTyping = v(0, 'blind typing')
  var ideas = v(0, 'ideas')
  var totalIdeas = v(0, 'total ideas') 
  var contribution = v(0, 'contribution')
  var money = v(0, 'money')
  var cormen = v(0, 'cormen level')
  var keyboard = v(0, 'keyboard level')
  var rating = v(0, 'rating')
  var time = v(0, 'time')

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
      [ideas, k(1)],
      [totalIdeas, k(1)]
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
      [ideaGet, c(function() {return digitFunction(100,imagination)() / Math.pow(1.11, totalIdeas.get())})], 
    ],
    dependence: totalIdeas
  })
  
  contestPlayedGainsRating = createUnlinearEvent({
    reward: [
      [rating, c(function(){return Math.pow(10, algorithms.get()) / Math.floor(Math.pow(1.07, rating.get()))})]
    ],
    dependence: rating
  })
  
  var problemSolved = createEvent({
    reward: [
      [experience, c(digitFunction(100, algorithms))], 
      [problemSolvedGainsIdea, k(1)]
    ]
  })
  
  var problemHelpedToSolve = createEvent({
    reward: [
      [experience, c(digitFunction(100, algorithms))],
    ]
  })
  
  var secondTicked = createEvent({
    reward: [
      [codeLines, c(digitFunction(100, blindTyping))]
    ]
  })
  
  var events = [problemSolved]

  var ticker = derivative({
    speed: k(1),
    value: secondTicked
  })
  var timer = derivative({
    speed: k(1),
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
      cost: [[codeLines, k(10)]],
      reward: problemSolved,
      type: linear
    },
    {
      name: 'Learn algorithm',
      cost: [[experience, c(function(){return Math.pow(1.17, algorithms.get()) / Math.pow(10, cormen.get())})]],
      reward: [[algorithms, k(1)]]
    },   
    {
      name: 'Learn blind typing',
      cost: [[experience, c(function(){return Math.pow(1.23, blindTyping.get()) / Math.pow(10, keyboard.get())})]],
      reward: [[blindTyping, k(1)]]
    },
    {
      name: 'Learn imagination',
      cost: [[experience, c(function(){return Math.pow(1.19, imagination.get())})]],
      reward: [[imagination, k(1)]]
    },
    {
      name: 'Play contest',
      cost: [[codeLines, k(50)]],
      reward: contestPlayedGainsRating,
      type: linear,
    },
    {
      name: 'Create contest',
      cost: [[codeLines, k(500)], [ideas, k(5)]],
      reward: [[money, k(1)], [contribution, c(function(){return contribution.get() * rating.get() / 10000 })]]
    },  
    {
      name: 'Upgrade Cormen',
      cost: [[money, c(function(){return 1 * Math.pow(cormen.get()+1, 0.37)})]],
      reward: [[cormen, k(1)]]
    },
    {
      name: 'Upgrade keyboard',
      cost: [[money, c(function(){return 1 * Math.pow(keyboard.get()+1, 0.29)})]],
      reward: [[keyboard, k(1)]]
    },
    {
      name: 'Ask for help',
      cost: [[contribution, k(1)]],
      reward: [[problemHelpedToSolve, k(1)]],
      type: linear, 
    },
    {
      name: 'Help somebody',
      cost: [[codeLines, k(11)]],
      reward: [[contribution, k(1)]],
      type: linear,
    },
    {
      name: 'Tick a second',
      cost: [],
      reward: [[time, k(1)], [secondTicked, k(1)]],
      type: linear,
      alwaysTopButton: 'off'
    }
  ].map(function(event) {
    return ((event.type == linear) ? buyEvent : unlinearBuyEvent)(event)
  })
  
  var advanceSecond = buyEvent({
    name: "Advance Second",
    cost: [],
    reward: [[secondTicked, k(1)]],
    type: linear,
    alwaysTopButton: 'off'
  })
  
  var wipeSave = buyEvent({
    name: "Wipe Save",
    cost: [],
    reward: [[unpredictableEvent({effect: wipeSave}), k(1)]],
    type: linear,
    alwaysTopButton: 'off',
    upButton: 'off'
  })
    
  contestant = {
    paint: function() {
      $("#codeLines").text(large(codeLines.get()))
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