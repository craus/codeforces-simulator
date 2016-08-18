function rgba(c) {
  result = c
  if (c && Object.prototype.toString.call(c) === '[object Array]') {
    result = 'rgba('+c[0]+', '+c[1]+', '+c[2]+', '+c[3].toFixed(2)+')'
  }
  return result
}

colors = {
  red: [255,0,0,1],
  green: [0,255,0,1],
  blue: [0,0,255,1],
  yellow: [255,255,0,1],
  magenta: [255,0,255,1],
  cyan: [0,255,255,1],
  black: [0,0,0,1],
  white: [255,255,255,1],
  brown: [150,50,0,1],
  
  mix: function(c, c2, k) {
    
    result = [
      Math.floor(c[0]*(1-k)+c2[0]*k),
      Math.floor(c[1]*(1-k)+c2[1]*k),
      Math.floor(c[2]*(1-k)+c2[2]*k),
      1.0 * c[3]*(1-k)+1.0 * c2[3]*k  
    ]
    return result
  },
  
  alpha: function(c, alpha) {
    return [
      c[0], c[1], c[2], alpha
    ]
  },
  
  rnd: function() {
    return [
      Math.floor(rnd(0,256)),
      Math.floor(rnd(0,256)),
      Math.floor(rnd(0,256)),
      1
    ]
  }
}

colors.r = colors.red
colors.g = colors.green
colors.b = colors.blue
colors.y = colors.yellow
colors.w = colors.white
colors.c = colors.cyan
colors.m = colors.magenta
colors.a = colors.black
//colors.p = colors.purple
//colors.o = colors.orange
