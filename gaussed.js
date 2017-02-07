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
      if (this.sigma < 1e-9) {
        return this
      }
      var sigma1 = Math.exp(Math.log(this.sigma)-bits)
      var gamma = Math.sqrt(Math.abs(sqr(this.sigma)-sqr(sigma1)))
      if (this.fixedAnswer == undefined) {
        var b = gaussianRandom(this.m, gamma)
        return gaussed(b, sigma1)
      }
      var d = this.m - this.fixedAnswer
      var b = this.m - gaussianRandom(d * sqr(gamma) / sqr(this.sigma) , sigma1 * gamma / this.sigma)
      return gaussed(b, sigma1).fixAnswer(this.fixedAnswer)
    },
    fixAnswer: function(x) {
      if (x == undefined) {
        this.fixedAnswer = gaussianRandom(this.m, this.sigma)
      } else {
        this.fixedAnswer = x
      }
      return this
    }
  }
}