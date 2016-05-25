// all of your friends are loaded into an array
var friends = ["profile_1.jpg","profile_2.jpg","profile_3.jpg","profile_4.jpg","profile_5.jpg","profile_6.jpg"]

// each friend has a profile picture & a name
// i.e. friends[0].name && friends[0].profile_picture


var start_x_top = 200;
var x_top = start_x_top;

var start_x_bot = 250;
var x_bot = start_x_bot;

// start with getting all the pictures on the screen
// we'll do 6 - 3 on top, 3 on bot, 2 of each size
// sm, md, lg

var sm = {
  height: 200,
  width: 200
}

var md = {
  height: 300,
  width: 300
}

var lg = {
  height: 400,
  width: 400
}

// start with putting them on in order
// all same sizes




var setting = 'sm';

function picSettings (img, i, half) {

  switch(i) {
    case 1 || 6:
      img.height = sm.height;
      img.width = sm.width;
      break;
    case 2 || 5:
      img.height = lg.height;
      img.width = lg.width;
      break;
    case 3 || 4:
      img.height = md.height;
      img.width = md.width;
      break;
  }

  if (half == 'top') {
    img.x = x_top;
    x_top += img.width;
    img.y = lineSlate.y - img.height;
  }
  else if (half == 'bot') {
    img.x = x_bot;
    x_bot += img.width;
    img.y = lineSlate.y + lineSlate.height;

  }
}

for (i = 0; i < 6; i++) {
  engine.loadImage(assetDir + "pictures/" + friends[i], function(img) {

    var half = 'top';
    if (i >= 3) {
      half = 'bot';
    }
    picSettings(img, i, half);
    background.addChild(img);
  }, function (err) {
    console.log(err);
  })

}

// standard image loading syntax
// engine.loadImage(assetDir + "/pictures/" + friends[i], function (img){
//   img.height = md.height;
//   img.width = md.width;
//   img.z = -0.9;
//   img.x = start_x_top += img.width;
//   img.y = lineSlate.y - img.height;

//   background.addChild(img);

// }, function(err) {
//   console.log(err);
// });



