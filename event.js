function createEvent(params) {
  return $.extend({
    run: function(cnt) {
      params.reward.forEach(function(reward) {
        var resource = reward[0]
        var amount = reward[1]
        if (resource.run != undefined) {
          resource.run(amount.get() * cnt)
        } else {
          resource.value += amount.get() * cnt
        }
      })
    }
  }, params)
}