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
  game = createSpellcaster()
  
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

// npp = 0
// nmm = 0
// nmixed = 0
// for (var j = 0; j < 1000; j++) {
//   var x = gaussed(3000, 1000).fixAnswer()

//   if (j % 100 == 0) {
//     console.log(j)
//   }
//   //console.log(x)
//   s = ''

//   for (var i = 0; i < 10000; i++) {
//     var y = x.know(0.001)
//     if (y.m > x.m) {
//       s += '+'
//     } else {
//       s += '-'
//     }
//     if (s[i] == '+' && s[i-1] == '+') {
//       npp++
//     } else if (s[i] == '-' && s[i-1] == '-') {
//       nmm++
//     } else {
//       nmixed++
//     }
//   }
// }

// console.log("npp = ", npp)
// console.log("nmm = ", nmm)
// console.log("nmixed = ", nmixed)

// var nmore = 0
// var nless = 0
// for (var j = 0; j < 1e6; j++) {
  // if (j % 10000 == 0) {
    // console.log(j)
  // }
  // var x = gaussed(3000, 1000).fixAnswer()
  // var y = x.know(0.001)
  // if (y.m > x.m) {
    // continue
  // }
  // if (y.m > x.fixedAnswer) {
    // nmore++
  // } else {
    // nless++
  // }
// }
// console.log("nmore = ", nmore)
// console.log("nless = ", nless)
