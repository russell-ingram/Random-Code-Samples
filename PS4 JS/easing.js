// This works

var t = 0; // whatever iteration we're on
var d = 200; // total iterations
var b = 0; // beginning point
var c = 1000; // ending value;

var p = t / d; // how far we've made it


function run () {
  if (t < d) {
    t++;
    p = t/d;
    var pos = easeOutBounce(p, b, c, t);
    console.log(pos);
    run();
  }
}




run();



function easeOutBounce (p, b, c, t) {
  if (p < 1/2.75) {
    return c*( 7.5625 * p * p) + b;
  } else if (p < (2/2.75)) {
    return c*(7.5625*(p-=(1.5/2.75))*p + 0.75) + b;
  } else if (p < (2.5/2.75)) {
    return c*(7.5625*(p-=(2.25/2.75))*p + 0.9375) + b;
  } else {
    return c*(7.5625*(p-=(2.625/2.75))*p + 0.984375) + b;
  }t
}


function easeOutBounce (p, b, c, t) {
  var s = 1.70158;
  var x = 0;
  var a = c;

  if (p == 1) return b + c;
  if (!x) x = d * 0.3;
  if (a < Math.abs (c)) {
    a = c;
    var s = x/4;
  }
  return a* Math.pow(2, -10 * t) * Math.sin( (t*d - s) * (2* Math.PI)/p) + c + b;

}


easeOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  }




  // easeOutBounce: function (x, t, b, c, d) {
  //   if ((t/=d) < (1/2.75)) {
  //     return c*(7.5625*t*t) + b;
  //   } else if (t < (2/2.75)) {
  //     return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
  //   } else if (t < (2.5/2.75)) {
  //     return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
  //   } else {
  //     return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
  //   }
  // },

