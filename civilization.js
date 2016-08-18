function createCivilization(params) {
  var population = 1
  var cities = 1
  var food = 0.0
  var minerals = 0.0
  var territory = 50
  var army = 0
  var money = 10
  var farms = 0
  var mines = 0
  var roads = 0
  var workers = 0
  var time = 30
  var enemiesStrength = 1
  
  
  var happyPopulation
  var unhappyPopulation
  var workingPopulation
  var averageCityPopulation
  var growthPenalties
  var growthCost
  var dt
  var foodIncome
  var mineralIncome
  var moneyIncome
  var farms
  var mineralSources
  var moneySources
  var happiness
  var danger
  var lostCities
  var lostArmy
  var lostPopulation
  var lostTerritory
  
  var buttons = []
  
  var buildCity = function() {
    population -= 2
    minerals -= 30
    cities += 1
  }
  
  var buildSoldier = function() {
    minerals -= 10
    army += 1
  }
  
  civilization = createUnit($.extend({

    paint: function() {
      var x0 = ui.width()/4
      var y0 = 10
      var sz = 40
            
      var lines = 0
      var print = function(text) {
        ui.text(text, x0, y0+sz*lines, colors.white, 40, "start", "top")
        lines += 1
      }
      var button = function(onclick) {
        var d = sz * 0.1
        ui.rect(x0-sz+d,y0+sz*lines+d,sz-2*d,sz-2*d,colors.green)
        buttons.push({l: x0-sz+d, t: y0+sz*lines+d, r: x0-d, b: y0+sz+sz*lines-d, onclick: onclick})
      }
      var income = function(x) { 
        var sign 
        if (x < 0) sign = ""
        else sign = "+"
        return sign + x.toFixed(2)
      }
      buttons = []
      
      print("Population: " + population + " (" + income(populationIncome) + " per second)")
      print("Territory: " + Math.floor(territory))
      if (population >= 2 && minerals >= 30 && cities < maxCities) button(buildCity)
      print("Cities: " + cities + " (max. " + maxCities + ")")
      if (minerals >= 10) button(buildSoldier)
      print("Army: " + army)  
      print("Minerals: " + Math.floor(minerals) + " (" + income(mineralIncome) + " per second)")
      print("Money: " + Math.floor(money) + " (" + income(moneyIncome) + " per second)")
      print("Working population: " + workingPopulation)
      
      x0 = ui.width() * 0.75
      lines = 0
      print("Next battle in: " + Math.ceil(time))
      print("Enemy strength: " + enemiesStrength.toFixed(2))
      if (danger != undefined) {
        print("Result of last battle: " + (1-danger).toFixed(2))
        print("Army lost: " + lostArmy)
        print("Cities lost: " + lostCities)
        print("Population lost: " + lostPopulation)
        print("Territory lost: " + Math.floor(lostTerritory))
      }
    },
    tick: function() {
      
      dt = space.tickTime
      happiness = 1.0 + Math.min(2 * cities, army) / 2
      averageCityPopulation = population / cities
      growthPenalties = Math.floor(averageCityPopulation / 3)
      growthCost = 20 + 10 * growthPenalties
      happyPopulation = Math.min(happiness, population)
      unhappyPopulation = population - happyPopulation
      workingPopulation = happyPopulation + unhappyPopulation * 0
      maxCities = Math.floor(territory / 25)
      
      foodIncome = cities * 2 + workingPopulation * 2 - population * 2
      food += foodIncome * dt
      populationIncome = foodIncome / growthCost
      if (food < 0) {
        food += 1
        population -= 1
      }
      if (food >= growthCost) {
        food -= growthCost
        population += 1
      }
      
      mineralIncome = cities * 1 + workingPopulation * 0.25
      minerals += mineralIncome * dt
      
      moneyIncome = cities * 2 + workingPopulation * 0.5 - army
      money += moneyIncome * dt
      if (money < 0) {
        money = 0
        army -= 1
      }
      
      territory += army * dt
      
      time -= dt
      if (time < 0) {
        time = 30
        danger = 1.0 * enemiesStrength / (enemiesStrength+army)
        lostArmy = Math.round(army * danger)
        lostCities = Math.round(cities * danger)
        lostPopulation = Math.round(population * danger)
        lostTerritory = territory * danger
        army -= lostArmy
        cities -= lostCities
        population -= lostPopulation
        territory -= lostTerritory
        enemiesStrength *= 1.1
      }
    },
    click: function(x, y) {
      buttons.forEach(function(button) {
        if (x > button.l && x < button.r && y > button.t && y < button.b) button.onclick()
      }) 
    }
  }, params))
  return civilization
}