function createContestant(params) {
  
  var x0 = 160
  var y0 = 10
  var sz = 40
        
  var lines
  var print = function(text) {
    ui.text(text, x0, y0+sz*lines, colors.white, 40, "start", "top")
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
    if (true) {
      ui.move(0,0)  
      ui.color(command.alwaysTop ? colors.red : colors.green)
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
    
    if (command.canZoomUp()) {
      ui.move(1,0)
      ui.color(colors.green)
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
      ui.color(colors.green)
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
      ui.color(colors.green)
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
  
  var income = function(x) { 
    var sign 
    if (x < 0) sign = ""
    else sign = "+"
    return sign + x.toFixed(2)
  }
  var large = function(x) {
    return x > 1e4 || x < 1 ? x.toPrecision(4) : x.toFixed(2)
  }
  
  
  var experience = 0
  var algorithms = 0
  var rating = 1200
  var contribution = 0
  var codeLines = 0
  var linesPerSecond = 10
  var ideas = 0
  var money = 0
  var totalIdeas = 0
  var problemCreation = 0
  var experiencePerProblemCreation = function(problemCreation){
    return 1 * Math.pow(4.0,problemCreation) / Math.pow(1.1, algorithms)
  }
  var ideasPerProblem = function(){
    return Math.pow(2, problemCreation) / Math.pow(1.1, Math.floor(totalIdeas))
  }
  var experiencePerAlgorithm = function(algorithms) {
    return 1 * Math.pow(1.1, algorithms)
  }
  
  var contributionPercentagePerContest = function(){return 0.5}
  
  var experiencePerProblem = function(){return 1+algorithms}
  var linesPerProblem = 10
  var linesPerContest = 50
  var ideasPerContest = 5
  var contributionPerHelp = 2
  var contributionPerAnswer = 1
  var linesPerAnswer = 20
  
  
  // "saved" game
  totalIdeas = 252.81
  ideas = 2.81
  algorithms = 145
  problemCreation = 22
  contribution = 1.5e11
  
  totalIdeas = 320
  ideas = 2.81
  algorithms = 145
  problemCreation = 22
  contribution = 4e13

  
  var buttons = []
  
  var gainSomeIdeas = function(cnt) {
    ideas += cnt
    totalIdeas += cnt
  }
  
  var solvedSomeProblems = function(cnt) {
    experience += experiencePerProblem() * cnt
    
    while (cnt > 0) {
      var nextIntTotalIdeas = 1 + Math.floor(totalIdeas)
      var partOfIdea = nextIntTotalIdeas - totalIdeas
      var problemForNextIdea = Math.ceil(partOfIdea / ideasPerProblem())
      if (cnt >= problemForNextIdea) {
        cnt -= problemForNextIdea
        gainSomeIdeas(partOfIdea)
      }
      else {
        gainSomeIdeas(cnt * ideasPerProblem())
        cnt = 0
      }
    }
  }
  
  var solveProblem = createClickerCommand({
    check: function(cnt) {
      return codeLines >= linesPerProblem * cnt
    },
    run: function(cnt) {
      codeLines -= linesPerProblem * cnt
      solvedSomeProblems(cnt)
    },
  })
  
  var learnAlgorithm = createClickerCommand({
    check: function(cnt) {
      return experience >= this.requiredExperience(cnt)
    },
    requiredExperience: function(cnt) {
      var result = 0
      var virtualAlgorithms = algorithms
      for(var i = 0; i<cnt; i++) {
        result += experiencePerAlgorithm(virtualAlgorithms)
        virtualAlgorithms += 1
      }
      return result
    },
    currentRequiredExperience: function() {
      return this.requiredExperience(this.zoom)
    },
    run: function(cnt) {
      for(var i = 0; i<cnt; i++) {
        experience -= experiencePerAlgorithm(algorithms)
        algorithms += 1
      }
    }
  })
  
  var learnProblemCreation = createClickerCommand({
    check: function(cnt) {
      return experience >= this.requiredExperience(cnt)
    },
    requiredExperience: function(cnt) {
      var result = 0
      var virtualProblemCreation = problemCreation
      for(var i = 0; i<cnt; i++) {
        result += experiencePerProblemCreation(virtualProblemCreation)
        virtualProblemCreation += 1
      }
      return result
    },
    currentRequiredExperience: function() {
      return this.requiredExperience(this.zoom)
    },
    run: function(cnt) {
      for(var i = 0; i<cnt; i++) {
        experience -= experiencePerProblemCreation(problemCreation)
        problemCreation += 1
      }
    }
  })
  
  var createContest = createClickerCommand({
    check: function(cnt) {
      return ideas >= ideasPerContest*cnt-eps
    },
    run: function(cnt) {
      ideas -= ideasPerContest*cnt
      for (var i = 0; i < cnt; i++) {
        contribution += Math.floor(contribution*contributionPercentagePerContest())
      }
    },
  })
  
  var postHelp = createClickerCommand({
    check: function(cnt) {
      return contribution >= contributionPerHelp*cnt
    },
    run: function(cnt) {
      contribution -= contributionPerHelp*cnt
      solvedSomeProblems(cnt)
    },
  })
  
  var postAnswer = createClickerCommand({
    check: function(cnt) {
      return codeLines >= linesPerAnswer * cnt
    },
    run: function(cnt) {
      contribution += contributionPerAnswer*cnt
      codeLines -= linesPerAnswer * cnt
      solvedSomeProblems(cnt)
    },
  })
  
  civilization = createUnit($.extend({

    paint: function() {

      buttons = []
      lines = 0 
      
      print("Experience: " + large(experience))
      
      commandButton(solveProblem)
      print("Solve " + 
        solveProblem.zoom + 
        " problems (+" +
        solveProblem.zoom*experiencePerProblem() + 
        " experience)"
        )
      
      print("Lines: " + Math.floor(codeLines))
      
      print("Ideas: " + ideas.toFixed(2) + " (+" + large(ideasPerProblem()) + " per problem solved)")
      print("Total ideas: " + Math.floor(totalIdeas))
      print("Algorithms: " + algorithms)
      commandButton(learnAlgorithm)
      print("Learn " + 
        learnAlgorithm.zoom + 
        " new algorithms (costs " + 
        large(learnAlgorithm.currentRequiredExperience()) + 
        " experience, +" +
        learnAlgorithm.zoom +
        " experience per problem solved)")
        
      print("Problem creation skill: " + problemCreation + " level")
      commandButton(learnProblemCreation)
      print("Upgrade " + 
        learnProblemCreation.zoom + 
        " levels (costs " + 
        large(learnProblemCreation.currentRequiredExperience()) + 
        " experience, each level doubles idea per problem rate)")        
      
      print("Contribution: " + contribution.toPrecision(4))
      commandButton(createContest)
      print("Create " + 
        createContest.zoom +
        " contests (costs " + 
        ideasPerContest*createContest.zoom + 
        " ideas; +" + 
        Math.floor(contributionPercentagePerContest()*100) + 
        "% contribution)")
      
      commandButton(postHelp)
      print(large(postHelp.zoom) + 
        " times post \"PLEASE HELP ME SOLVE THIS PROBLEM\" (+" +
        large(postHelp.zoom) +
        " problem solved, -" +
        large(postHelp.zoom*contributionPerHelp) +
        " contribution)")
        
      commandButton(postAnswer)
      print(large(postAnswer.zoom) + 
        " times help somebody who post \"PLEASE HELP ME SOLVE THIS PROBLEM\"")
      print("(costs " +
        large(postAnswer.zoom*linesPerAnswer) +
        " lines of code, +" +
        large(postAnswer.zoom*contributionPerAnswer) +
        " contribution)")        
    },
    tick: function() {
      dt = space.tickTime
      
     
      codeLines += linesPerSecond * dt
    },
    click: function(x, y) {
      buttons.forEach(function(button) {
        if (x > button.l && x < button.r && y > button.t && y < button.b) button.onclick()
      }) 
    }
  }, params))
  return civilization
}