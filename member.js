var createMember = function(params) {
  var ratingRow = instantiate('memberRatingRowSample')
  $('.ratingList').append(ratingRow)    
  if (params.isHuman) {
    ratingRow.addClass("info")
  }
  var member = {
    id: params.id, 
    name: params.name,
    rating: 1500,
    isHuman: params.isHuman,
    rank: function() {
      return params.members.indexOf(this)+1
    },
    save: function() {
      if (!savedata.members) {
        savedata.members = {}
      }
      savedata.members[params.id] = {
        rating: this.rating,
        name: this.name
      }
    },
    winProbability: function(foe, imaginedRating) {
      var rating = imaginedRating || this.rating
      return 1.0 / (1 + Math.pow(10, (foe.rating - rating)/400))
    },
    paint: function() {
      setFormattedText(ratingRow.find('.rank'), this.rank())
      setFormattedText(ratingRow.find('.memberRating'), Math.round(this.rating))
      setFormattedText(ratingRow.find('.name'), this.name)
      setSortableValue(ratingRow.find('.rankValue'), this.rank())
    }
  }
  if (savedata.members && savedata.members[params.id]) {
    member.rating = savedata.members[params.id].rating
    member.name = savedata.members[params.id].name
  }
  return member
}