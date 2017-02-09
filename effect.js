var createEffect = (id, tick, duration) => {
  
  return {
    expired: () => duration < 0,
    tick: (t) => {
      t = Math.min(t, duration)
      tick(t)
      duration -= t
    },
    paint: () => {

    }
  }
}