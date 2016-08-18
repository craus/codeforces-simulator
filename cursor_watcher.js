cursorX = 0
cursorY = 0

function watchCursor(event) {
  cursorX = event.clientX - $('#display')[0].getBoundingClientRect().left
  cursorY = event.clientY - $('#display')[0].getBoundingClientRect().top
}
