toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

function normAng(ang)
{
  while (ang >= Math.PI) ang -= 2 * Math.PI;
  while (ang < -Math.PI) ang += 2 * Math.PI;
  return ang;
}

function sqr(x) {
  return x*x
}

function dist(x1, y1, x2, y2) {
  x2 = x2 || 0
  y2 = y2 || 0
  return Math.sqrt(sqr(x1-x2)+sqr(y1-y2))
}

function rnd(min, max) {
  return min + Math.random()*(max-min)
}

identityMatrix = [1,0,0,1,0,0]
function transform(old, x,y,z,ang) {
  var a = z * Math.cos(ang)
  var b = z * Math.sin(ang)
  var c = - z * Math.sin(ang)
  var d = z * Math.cos(ang)
  var e = x
  var f = y
  return [
    old[0]*a+old[2]*b,
    old[1]*a+old[3]*b,
    old[0]*c+old[2]*d,
    old[1]*c+old[3]*d,
    old[0]*e+old[2]*f+old[4],
    old[1]*e+old[3]*f+old[5]
  ]
}

function mirrorTransform(old, mirror) {
  if (mirror == false) return old
  return transformByMatrix(old, [
    -1, 0, 0, 1, 0, 0
  ])
}

function transformByMatrix(old, mx) {
  return [
    old[0]*mx[0]+old[2]*mx[1],
    old[1]*mx[0]+old[3]*mx[1],
    old[0]*mx[2]+old[2]*mx[3],
    old[1]*mx[2]+old[3]*mx[3],
    old[0]*mx[4]+old[2]*mx[5]+old[4],
    old[1]*mx[4]+old[3]*mx[5]+old[5]
  ]
}

function inverseMatrix(old) {
  var a = old[0]*1.0
  var b = old[1]*1.0
  var c = old[2]*1.0
  var d = old[3]*1.0
  var e = old[4]*1.0
  var f = old[5]*1.0
  var D = a*d-b*c
  return [
    d/D,
    -b/D,
    -c/D,
    a/D,
    (c*f-d*e)/D,
    (b*e-a*f)/D
  ]
}

function matrixPow(old, k) {
  return [
    old[0] * k + identityMatrix[0] * (1-k),
    old[1] * k + identityMatrix[1] * (1-k),
    old[2] * k + identityMatrix[2] * (1-k),
    old[3] * k + identityMatrix[3] * (1-k),
    old[4] * k + identityMatrix[4] * (1-k),
    old[5] * k + identityMatrix[5] * (1-k),
  ]
}

function closeMatrices(a,b) {
    for(var i = a.length; i--;) {
      if (Math.abs(a[i]-b[i]) > 1e-10)
        return false;
    }
    return true;
  }

singleCommandTransform = {
  u: 'r', 
  r: 'd',
  d: 'l',
  l: 'u'
}

mirrorCommandTransform = {
  u: 'u', 
  r: 'l',
  d: 'd',
  l: 'r'
}

function transformMap(old, delta) {
  result = {}
  Object.keys(old).forEach(function(key) {
    result[key] = old[delta[key]]
  })
  return result
}

function next(a, x, d) {
  return a[(a.indexOf(x)+(d || 1)+a.length) % a.length]
}

function enable(el, on) {
  el.prop('disabled', !on)
  if (!on) {
    el.tooltip('hide')
  }
}

signPrefix = function(x) { 
  if (x > 0) return "+";
  return "";
}
large = function(x) {
  if (x == 0) return 0
  if (Math.abs(x) > 1e4*(1+eps) || Math.abs(x) < 1-eps) return x.toPrecision(4).replace('+','')
  if (Math.abs(x - Math.floor(x+eps)) < eps) return Math.floor(x+eps)
  return x.toPrecision(4).replace('+','') 
}
round = function(x) {
  return large(Math.round(x))
}
setTitle = function(el, title) {
  el.attr('data-original-title', title)
}
formatText = function(el, text, text1) {
  var format = el.attr('data-text')
  if (format == undefined) {
    format = "#{0}"
  }
  return format.replace('#{0}', text).replace('#{1}', text1)
}
setFormattedText = function(el, text, text1) {
  var t = formatText(el, text, text1)
  if (el.text() != t) {
    el.text(t)
  }
}

