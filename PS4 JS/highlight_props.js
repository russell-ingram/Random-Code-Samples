// highlight/normal properties

// var highlights = {
//   home: {
//     type: 'text',
//     size: 28,
//     color: [238/255, 175/255, 0/255, 1],
//     x: (screen.width / 10) + (3.5 * screen.width / 100),
//     y: (screen.height / 21) - (
//   }
// }


var navProps = {
  'home': {
    highlight: function() {

      menu.removeChildAt(0);
      var home = engine.createTextBlock("HOME", {
        size: 28,
        color: [238/255, 175/255, 0/255, 1]
      });

      home.x = (screen.width / 10) + (3.5 * screen.width / 100);
      home.y = (screen.height / 21) - (home.naturalHeight / 2);
      home.z = -1;

      menu.addChildAt(home, 0);
    }

    dehighlight: function() {

      menu.removeChildAt(0);
      var home = engine.createTextBlock("HOME", {
        size: 28,
        color: [135/255, 135/255, 135/255, 1]
      });

      home.x = (screen.width / 10) + (3.5 * screen.width / 100);
      home.y = (screen.height / 21) - (home.naturalHeight / 2);
      home.z = -1;

      menu.addChildAt(home, 0);
    }
  }



}
