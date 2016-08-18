var getDerivative = function(reward, target) {
  if (reward == target) return 1
  if (reward.value != undefined) return 0
  
  if (reward.run != undefined) {
    return getDerivative(reward.reward, target)
  }
  
  var result = reward.reduce(function(total, reward) {
    var resource = reward[0]
    var amount = reward[1].get()
    return total + getDerivative(resource, target) * amount
  }, 0)
  
  return result
}

function createUnlinearEvent(params) {
  return $.extend({
    linearRun: function(cnt) {
      params.reward.forEach(function(reward) {
        var resource = reward[0]
        var amount = reward[1]
        if (resource.run != undefined) {
          resource.run(amount.get() * cnt)
        } else {
          resource.value += amount.get() * cnt
        }
      })      
    },
    run: function(cnt) {
      while (cnt > 0) {
        var nextIntDependenceValue = 1 + Math.floor(params.dependence.get())
        var partOfDependenceValue = nextIntDependenceValue - params.dependence.get()
        var derivative = getDerivative(params.reward, params.dependence)
        var rewardRunsToNextIntDependenceValue = partOfDependenceValue / derivative
        if (cnt >= rewardRunsToNextIntDependenceValue) {
          cnt -= rewardRunsToNextIntDependenceValue
          this.linearRun(rewardRunsToNextIntDependenceValue)
        }
        else {
          this.linearRun(cnt)
          cnt = 0
        }
      }
    }, 
  }, params)
}