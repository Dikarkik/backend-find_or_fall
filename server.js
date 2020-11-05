var Room = require('./models/room.js');

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
  console.log(`connection: ${socket.id}`);

  /* =========================================
     -------------- Matchmaking --------------
     ========================================= */

  if (!room) { // player 1

    room = new Room();
    room.player1Socket = socket;
    room.player1Id = socket.id;

  } else { // player 2

    // complete the 'Room'
    room.player2Socket = socket;
    room.player2Id = socket.id;
    let roomID = `${room.player1Id}-AND-${room.player2Id}`;
    room.id = roomID;
    room.randomButtons();

    // save room in ROOM_LIST
    ROOM_LIST[roomID] = room;

    // save room in both sockets
    room.player1Socket['room'] = room;
    room.player2Socket['room'] = room;

    // prepares data to send
    let data = room.initialInfo();
    io.to(room.player1Id).emit('start game', data);
    io.to(room.player2Id).emit('start game', data);

    // frees 'room'
    room = null;
  }

/* =========================================
   ---------------- Events -----------------
   ========================================= */

  socket.on('disconnect', function () {
    console.log(`socket disconnected: ${socket.id}`);

    // If this player is on matchmaking
    if (room && socket.id === room.player1Socket.id)
      room = null;

    // If this player is on match. Notify disconnection to opponent and delete <Room>
    else if ('room' in socket) {
      if (socket.room) {
        io.to(socket.room.getOpponentId(socket.id)).emit('opponent disconnected');
        delete ROOM_LIST[socket.room.id];
      }
    }
  });

  socket.on('emit turn', function (data) {

    // Send 'data' to opponent
    let dataObject = { button: "" + data };
    opponentId = socket.room.getOpponentId(socket.id);
    io.to(opponentId).emit('my turn', dataObject);

  });

  socket.on('emit username', function (username) {

    // send username to opponent
    let dataObject = { username: username };
    opponentId = socket.room.getOpponentId(socket.id);
    io.to(opponentId).emit('opponent username', dataObject);

    // save username
    socket.room.saveUsername(socket.id, username);
  });
});
