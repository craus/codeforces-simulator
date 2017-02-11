var createMember = function(params) {
  var ratingRow = instantiate('memberRatingRowSample')
  $('.ratingList').append(ratingRow)
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
    paint: function() {
      setFormattedText(ratingRow.find('.rank'), this.rank())
      setFormattedText(ratingRow.find('.memberRating'), this.rating)
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