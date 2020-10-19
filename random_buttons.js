exports.generateBoard = function (room) {
  room.button_1 = Math.floor(Math.random() * 8);
  room.button_2 = Math.floor(Math.random() * 8);
  while (room.button_2 === room.button_1)
    room.button_2 = Math.floor(Math.random() * 8);
};
