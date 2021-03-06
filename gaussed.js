// http://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
// Standard Normal variate using Box-Muller transform.
function randn_bm() {
    var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function gaussianRandom(m, sigma) {
  return m + sigma * randn_bm()
}

gaussed = function(m, sigma) {
  return {
    m: m, 
    sigma: sigma,
    know: function(bits) {
      var sigma1 = Math.exp(Math.log(sigma)-bits)
      var gamma = Math.sqrt(sqr(sigma)-sqr(sigma1))
      var b = gaussianRandom(m, gamma)
      return gaussed(b, sigma1)
    }
  }
}