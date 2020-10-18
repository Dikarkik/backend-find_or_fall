var io = require('socket.io')(3333);
const generateBoard = require('./generate_board').generateBoard;
const getOpponentId = require('./get_opponent_id').getOpponentId;
const Room = require('./room').Room;

console.log('Server listening on port 3333...');

let ROOM_LIST = {}; // key: <id1>-AND-<id2>, value: <Room object>
let room = null; // will be 'Room' object

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
    room.board = generateBoard();

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

  socket.on('disconnect', function () {
    console.log('socket disconnected');
    console.log('SOCKETS NOW:');
    console.log(Object.keys(io.sockets.sockets));
    // If this player is on matchmaking
    if (room && socket.id === room.player1_socket.id)
      room = null;
    // If this player is on match. Notify disconnection to opponent
    if ('room' in socket) {
      delete ROOM_LIST[socket.room.id];
      opponent_id = getOpponentId(socket);
      io.to(opponent_id).emit('opponent disconnected');
    }
  });

  socket.on('emit turn', function (data) {
    console.log('turn:' + data);
    let data_object = { button: data };
    opponent_id = getOpponentId(socket);
    io.to(opponent_id).emit('my turn', data_object);
  });

  socket.on('emit username', function (username) {
    let data_object = { username: username };
    opponent_id = getOpponentId(socket);
    io.to(opponent_id).emit('opponent username', data_object);

    if (socket.id === ROOM_LIST[socket.room.id].player1_socket.id)
      ROOM_LIST[socket.room.id].player1_username = username;
    else
      ROOM_LIST[socket.room.id].player2_username = username;
  });
});
