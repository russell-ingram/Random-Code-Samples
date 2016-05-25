// Highlighting/dehighlighting logic for home page UI navigation

var row_arr = [['home','friends','groups','messages','profile'], ['addFriends','watchImg']]
var row = 0;
var column = 0;
var current_element = [row, column];
var next_element = [0, 0];



var highlight_element = function(elem_arr) {
  console.log(row_arr[elem_arr[0]][elem_arr[1]]);
}

var dehighlight_element = function (elem_arr) {
  console.log(row_arr[elem_arr[0]][elem_arr[1]]);
}


var navBarMove = function(dir) {
  dehighlight_element(current_element);

  switch (dir) {
    case 'right':
      // console.log('right');
      if (column < row_arr[row].length - 1) {
        column++;
      }
      break;
    case 'left':
      // console.log('left');
      if (column >0) {
        column--;
      }
      break;
    case 'down';
      // console.log('down');
      if (row < row_arr.length - 1) {
        row++;
        column = 0;
      }
      break;
    case 'up':
      // console.log('up');
      if (row > 0) {
        row--;
        column = 0;
      }
      break;
  }
  next_element = [row, column];

  highlight_element(next_element);

  current_element = [row, column];
}
