var init = function() {
  var time = new Date().getTime()
  console.log("time = " + time)
 
  // if(typeof(Storage) !== "undefined") {
  //   console.log("have storage")
  //   var data = JSON.parse(localStorage.tempSavedData)
  //   console.log("data loaded: ")
  //   console.log(data)
  //   localStorage.tempSavedData = JSON.stringify({
  //     x: 42, 
  //     emptyObject: {},
  //     array: [3,2,9,2,7,2],
  //     time: time
  //   })
  //     // Code for localStorage/sessionStorage.
  // } else {
  //   console.log("have no storage")
  //     // Sorry! No Web Storage support..
  // } 
 
  eps = 1e-8
  game = createContestant()
  
  realTime = 0
  var secondTime = 0
  
  setInterval(function() {
    realTime += 0.1
    secondTime += 1
    
    $('#realTime').text("real time: " + realTime)
    
    if (secondTime == 10) {
      secondTime = 0
    }
    
    $('#debugInfo').text(JSON.stringify(debugInfo))
    if (!debug.paused) {
      game.tick()
      game.paint()
      if (needResort) {
        needResort = false
        $.bootstrapSortable({ applyLast: true })
      }
    }
  }, 100)
  
  window.onkeydown = function(e) {
    console.log(e)
  }
  
  game.paint()
  
  $('[data-toggle="tooltip"]').tooltip(); 
  
  $("button").mouseup(function(){
    $(this).blur();
  })
  
  $('#confirm-delete').on('show.bs.modal', function(e) {
    $(this).find('.btn-ok').attr('href', $(e.relatedTarget).data('href'));
    
    $('.debug-url').html('Delete URL: <strong>' + $(this).find('.btn-ok').attr('href') + '</strong>');
  });
  
  console.log("window.onload end")
}

$(document).ready(init);


