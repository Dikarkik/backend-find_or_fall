const randomButtons = require('./random_buttons').randomButtons;
const getOpponentId = require('./get_opponent_id').getOpponentId;
const Room = require('./room').Room;

// server instance
var io = require('socket.io')(3333);
console.log('Server listening on port 3333...');

// 'room' in the beginning acts as a waiting room, then stores all the information.
// - is <Room>: when the first player arrives.
// - is null: when nobody has arrived,
// when the first player cancels the matchmaking,
// when the second player arrives (to start a new matchmaking).
let room = null;

// To store the <Room> objects.
// key: '<id1>-AND-<id2>', value: <Room object>
let ROOM_LIST = {};

// Handle all events received from clients.
// 'socket' object extends the Node.js EventEmitter class.
io.on('connection', function (socket) {

  // All the code outside the event handlers (socket.on) run once for every socket.

  /* =========================================
     -------------- Matchmaking --------------
     ========================================= */

  if (!room) { // player 1

    console.log('JOIN. player 1 ---> ' + socket.id);
    room = Room(socket);

  } else { // player 2

    console.log('JOIN. player 2 ---> ' + socket.id);

    // complete the 'Room'
    let roomID = `${room.player1_socket.id}-AND-${socket.id}`;
    room.id = roomID;
    room.player2_socket = socket;
    randomButtons(room);

    // save room in ROOM_LIST
    ROOM_LIST[roomID] = room;

    // save room id in both sockets
    room.player1_socket['room'] = room;
    room.player2_socket['room'] = room;

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

/* =========================================
   ---------------- Events -----------------
   ========================================= */

  socket.on('disconnect', function () {

    console.log('socket disconnected: ' + socket.id);

    // If this player is on matchmaking
    if (room && socket.id === room.player1_socket.id)
      room = null;

    // If this player is on match. Notify disconnection to opponent
    else if ('room' in socket) {
      delete ROOM_LIST[socket.room.id];
      opponent_id = getOpponentId(socket);
      io.to(opponent_id).emit('opponent disconnected');
    }
  });

  socket.on('emit turn', function (data) {

    // Send 'data' to opponent
    let data_object = { button: "" + data };
    opponent_id = getOpponentId(socket);
    io.to(opponent_id).emit('my turn', data_object);

  });

  socket.on('emit username', function (username) {

    // send username to opponent
    let data_object = { username: username };
    opponent_id = getOpponentId(socket);
    io.to(opponent_id).emit('opponent username', data_object);

    // save username
    if (socket.id === ROOM_LIST[socket.room.id].player1_socket.id)
      ROOM_LIST[socket.room.id].player1_username = username;
    else
      ROOM_LIST[socket.room.id].player2_username = username;
  });
});
