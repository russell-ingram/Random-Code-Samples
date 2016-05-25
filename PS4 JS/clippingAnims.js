// trying clipping for sliding animations that disappear

var pic; // load the image

var clip = pic.clipRect; // gets annoying to type this over and over

var img; // already loaded new img
// as we move the image out of the frame, we want to try clipping out the image that should still be visible



// start by moving the frame out

if (pic.pos == 'top') {
  sliding_stop = pic.y + pic.height;
  var increment = pic.height / 20;
  function slide_out () {
    if (pic.y < sliding_stop - increment) {
      pic.y += increment;
      clip.height = sliding_stop - pic.y;
      clip.width = pic.width;
      setTimeout(slide_out, 2);
    }
    else {
      middleNavBox.removeChild(pic);
      slide_in(pic, increment);
    }
  }

  slide_out();
}

function slide_in (pic, increment) {
  // img has already been loaded
  img.pos = pic.pos;
  img.y = pic.y;
  middleNavBox.addChild(img);
  if (img.pos == 'top') {
    var max_h = lineSlate.y - img.height;
    function slide_up () {
      if (img.y > max_h) {
        img.y -= increment;
        img.clipRect.height = lineSlate.y - img.y;
        img.clipRect.width = img.width;
        setTimeout(slide_up, 2);
      }
    }

  }


}





