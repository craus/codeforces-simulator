function createBounds(w, h) {
  return {
    left: 0,
    top: 0,
    right: w,
    bottom: h,
    k: 30000,
    tick: nop,
    paint: nop
  }
}