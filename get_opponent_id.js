exports.getOpponentId = function (socket) {
  if (socket.id === socket.room.player1_socket.id)
    return socket.room.player2_socket.id;
  else
    return socket.room.player1_socket.id;
};
