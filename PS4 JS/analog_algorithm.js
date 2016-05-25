// Algorithms for navigating the UI using the analog


// pseudo code
// if (right_movement) {
//   if (column < row_arr[row].length) {
//     column ++
//   }
// }

// if (left_movement) {
//   if (column > 0) {
//     column--;
//   }
// }

// if (down_movement) {
//   if (row < row_arr.length) {
//     row ++;
//     column = 0;
//   }
// }

// if (up_movement) {
//   if (row > 0) {
//     row --;
//     column = 0;
//   }
// }

// set up something to add rows/columns
// contains an array of arrays

var row_arr = []
var row = 0;
var column = 0;
var current_element = [row, column];


// determine movement of analog
var prev_x = 0;
var prev_y = 0;

var allowChange = true;


var resetChangeTimer = function () {

  allowChange = false;

  setTimeout(function() {
    allowChange = true;
  }, 300);

}




engine.onAnalogMove = function (id, x, y) {

  var analogStickDeltaX = Math.abs(x) - Math.abs(prev_x);
  prev_x = x;

  var analogStickDeltaY = Math.abs(y) - Math.abs(prev_y);
  prev_y = y;

  // the function will run several times in one stick movement so this in conjunction with the setTimeout function prevents the changes from happening too fast
  // also makes sure the fn only triggers when the analog is moving away from the center, not returning to resting position


  // function() {
    if (allowChange && analogStickDeltaX > 0) {

      // right movement
      // ups the sensitivity for movement
      if (x > 0.5) {
        navBarMove('right');
        resetChangeTimer();
      } // end right movement


      // left movement
      if (x < -0.5) {
        navBarMove('left');
        resetChangeTimer();

      } // end left movement)






    } // end if (x directions)

    if (allowChange && analogStickDeltaY > 0) {

      // up movement
      if (y < -0.5) {
        navBarMove('up');
        resetChangeTimer();
      }

      if (y > 0.5) {
        navBarMove('down');
        resetChangeTimer();
      }

    }
  // }
}




var next_element = [row, column]
// once movement is determined, change elements

dehighlight_element(current_element);
highlight_element(next_element);

// dehighlight_element & highlight_element checks the highlight & normal settings of each element
