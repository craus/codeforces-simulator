function unlinearBuyEvent(params) {
  var rewardEvent = (params.reward.run != undefined) ? params.reward : createEvent({reward: params.reward})
  
  var backup = function(resource) {
    if (resource.reward != undefined) {
      resource.reward.forEach(function(reward) {
        var resource = reward[0]
        backup(resource)
      })
    } else if (resource.value != undefined) {
      resource.backup = resource.value
    } else if (resource.backupSelf != undefined) {
      resource.backupSelf()
    }
  }
  var restore = function(resource) {
    if (resource.reward != undefined) {
      resource.reward.forEach(function(reward) {
        var resource = reward[0]
        restore(resource)
      })
    } else if (resource.value != undefined) {
      resource.value = resource.backup
    } else if (resource.restoreSelf != undefined) {
      resource.restoreSelf()
    }
  }
  getDelta = function(resource) {
    if (resource.reward != undefined) {
      var deltas = resource.reward.map(function(reward) {
        var partial_delta = getDelta(reward[0])
        return partial_delta
      })
      deltas = deltas.reduce(function(total, current) {
        if (total.concat == undefined) {
          console.log("bad total")
          console.log(total)
          stop()
        }
        return total.concat(current)
      }, [])
      return deltas
    } else if (resource.value != undefined) {
      var deltas = [{
        name: resource.name,
        value: resource.value-resource.backup
      }]
      return deltas
    } else {
      return [{
        name: resource.name,
        value: 1
      }]
    }
  }
  
  
  var result = createClickerCommand($.extend({
    show: function() { return true },
    backup: function() {
      params.cost.forEach(function(cost) {
        var resource = cost[0]
        backup(resource)
      })
      backup(rewardEvent)
    },
    restore: function() {
      params.cost.forEach(function(cost) {
        var resource = cost[0]
        restore(resource)
      })
      restore(rewardEvent)    
    },
    check: function(cnt) {

      this.backup()
      
      this.run(cnt)
      
      var insufficientResource = params.cost.find(function(cost) {
        var resource = cost[0]
        return resource.value < 0
      })
      
      this.restore()
      
      return insufficientResource == null
    },
    rewardEvent: rewardEvent,
    run: function(cnt) {
      for (var i = 0; i < cnt; i++) {
        params.cost.forEach(function(cost) {
          var resource = cost[0]
          var amount = cost[1]
          resource.value -= amount.get()
        })    
        rewardEvent.run(1)
      }
    },  
    delta: 0,
    onZoomChanged: function(){ this.delta = this.getDelta() },
    getDelta: function() {
      this.backup()
      this.run(this.zoom) 
      var delta = params.cost.map(function(cost) { 
        var result = getDelta(cost[0])
        return result
      }).reduce(function(total, current) {
        return total.concat(current)
      }, [])
      var rewardDelta = getDelta(rewardEvent)
      delta = delta.concat(rewardDelta)
      this.restore()
      return delta
    }
  }, params))
  result.onZoomChanged()
  return result
}