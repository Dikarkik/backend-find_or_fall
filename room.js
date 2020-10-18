exports.Room = function (player1_socket) {
  var self = {
    id: null,
    player1_socket: player1_socket,
    player2_socket: null,
    board: null,
  }
  return self;
};
