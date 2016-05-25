// some image or box obj will be flipped

var obj1 = {
  h : 1080,
  w: 1920
}

var obj2 = {
  h: 0,
  w: 0
}


var t = 3000;

function collapse_width_anim (obj) {
  var max_width = obj.w;


  function collapse () {
    if (obj.w > 0) {
      obj.w -= max_width/40;
      setTimeout(collapse, 100);
    }
  }

  collapse();





// setInterval doesn't appear to work in PS4

  // function move () {
  //   obj.w -= max_width / 40
  //   if (obj.w <= 0) {
  //     clearInterval(id);
  //   }
  // }

  // var id = setInterval(frame, 100);

}



