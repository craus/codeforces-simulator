function createChange(resource, amount) {
  if (amount == undefined) {
    amount = 1
  }
  return {
    resource: resource, 
    amount: amount,
    backup: function() { resource.backup() }
  }
}