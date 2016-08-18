dev = {
  on: true,
  selectedCell: null,
  selectedSide: null,
  selectedLink: function() {
    if (this.selectedCell == null) return null
    var side = this.selectedSide
    return this.selectedCell.links.find(function(link) { return link.command[0] == side })
  },
  mirrorSelection: function() {
    var link = this.selectedLink()
    var back = link.findBackLink(this.selectedCell)
    var mirroring = function() {
      link.mirror = !link.mirror
      link.mirrorTransform()
      back.mirror = !back.mirror
      back.mirrorTransform()
    }
    mirroring()
    operations.push(operationSeparator)
    operations.push(mirroring)
    maze.moved()
  },
  undo: function() {
    while (operations.last() != operationSeparator) {
      operations.pop()()
    }
    operations.pop()
    if (operations.length == 0) {
      operations.push(operationSeparator)
    }
    maze.moved()
  },
  cancel: function() {
    dev.selectedCell = dev.selectedSide = null
  }
}