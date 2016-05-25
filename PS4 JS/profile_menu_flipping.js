function collapse_vertically (obj) {

  var max_height = obj.height;
  var increment = max_height / 40;

  function collapse () {
    if (obj.height > increment) {
      obj.height -= increment;
      obj.y = lineSlate.y - obj.height;
      setTimeout(collapse, 10);
    }
    else if (obj.height <= increment) {
      background.removeChild(obj);
      // call function with max_height and positions, eventually should check half & size
      expand_new(obj.x,max_height, obj.width)
    }
  }

  collapse();

}

// call fn



function expand_new (x, max_y, width) {
  // needs to load a new picture and add it
  var increment = max_y / 40;
  function expand(obj) {
    if (obj.height < max_y) {
      obj.height += increment;
      obj.y = lineSlate.y - obj.height;
      setTimeout(expand, 10);
    }
  }


  engine.loadImage(assetDir + "pictures/" + friends[3], function(img) {
    img.x = x;
    img.y = lineSlate.y;
    img.height = 0;
    img.z = -0.9;

    expand(img);

  },
  function(err) {
    console.log(err);
  })

}
