exports.generateBoard = function () {
  board = [0, 0, 0, 0, 0, 0, 0, 0]
  let position1 = Math.floor(Math.random() * 8);
  board[position1] = 1;
  let position2 = Math.floor(Math.random() * 8);
  while (position2 === position1)
    position2 = Math.floor(Math.random() * 8);
  board[position2] = 2;
  return board;
};
