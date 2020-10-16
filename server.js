var io = require('socket.io')(3333);

console.log('Server listening on port 3333...');

let ROOM_LIST = {}; // key: <id1>-AND-<id2>, value: <Room object>
let room = null; // will be <Room object>

var Room = function (player1_socket) {
  var self = {
    id: null,
    player1_socket: player1_socket,
    player2_socket: null,
    board: null,
  }
  return self;
};

io.sockets.on('connection', function (socket) {
  console.log('socket connected: ' + socket.id);

  if (!room) { // player 1
    console.log('JOIN. player 1 ---> ' + socket.id);
    // Prepares the new 'Room'
    room = Room(socket);
  } else { // player 2
    console.log('JOIN. player 2 ---> ' + socket.id);

    // complete the 'Room'
    let roomID = `${room.player1_socket.id}-AND-${socket.id}`;
    room.id = roomID;
    room.player2_socket = socket;

    // useful data
    room.player1_socket['room'] = room;
    room.player2_socket['room'] = room;

    // save room in ROOM_LIST
    ROOM_LIST[roomID] = room;

    // frees 'room'
    room = null;

    // prepare data to send
    let data = { ...ROOM_LIST[roomID] };
    delete data.player1_socket;
    delete data.player2_socket;
    data['player1_id'] = ROOM_LIST[roomID].player1_socket.id;
    data['player2_id'] = ROOM_LIST[roomID].player2_socket.id;
    io.to(ROOM_LIST[roomID].player1_socket.id).emit('start game', data);
    io.to(ROOM_LIST[roomID].player2_socket.id).emit('start game', data);
  }

  socket.on('disconnecting', (reason) => {
    // If this player is on matchmaking
    if (room && socket.id === room.player1_socket.id)
      room = null;
    // If this player is on match. Notify disconnection to opponent
    if ('room' in socket) {
      if (socket.id === socket.room.player1_socket.id)
        socket_opponent = socket.room.player2_socket;
      else
        socket_opponent = socket.room.player1_socket;
      // ROOM_LIST before deletion
      console.log("BEFORE:");
      console.log(Object.keys(ROOM_LIST));
      delete ROOM_LIST[socket.room.id]
      // ROOM_LIST after deletion
      console.log("AFTER:");
      console.log(Object.keys(ROOM_LIST));
      io.to(socket_opponent.id).emit('opponent disconnected');
      io.to(socket_opponent.id).emit('close');
    }
  });

  socket.on('disconnect', function () {
    console.log('socket disconnected');
  });
});
