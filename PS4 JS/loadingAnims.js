


function picSettings (img, i) {

  if ( 'sm' ) {
    img_max_h = sm.height;
    img_max_w = sm.width;
  }

  else if ( 'md' ) {
    img_max_h = md.height;
    img_max_w = md.width;
  }

  else if ( 'lg' ) {
    img_max_h = lg.height;
    img_max_w = lg.width;
  }

  middleNavBox.addChild(img);

  if (i < 5) {
    img.x = x_top;
    x_top += img_max_w + 5;
    expandVertical(img, i);
  }


  function expandVertical (pic) {
    var increment = img_max_h / 10;

    function expandVert () {
      if (img_max_h - pic.height < increment ) {
        pic.height = img_max_h;
      }
      else {
        pic.height += increment;
      }
      if ( i < 6 ) {
        pic.y = lineSlate.y - image.height;
      }
      else {
        pic.y = lineSlate.y + lineSlate.height;
      }

      setTimeout(expandVert, 2);

    }
  }

  setTimeout(expand, 10);

}
