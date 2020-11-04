# backend-find_or_fall

'Find or Fall' is a online, turn-based video game, where two persons must guess which is the button that makes their opponent fall, they have a the same board with eight buttons so it's possible to make yourself fall, the game ends when someone falls.

### Game server using node.js + socket.io

![diagram](diagram.jpg?raw=true "Diagram")


### Run the server
```
# install modules
$ npm install

# run
$ ./server.js
```

### Test the server connection
```
# install
sudo npm install -g wscat

# use
wscat -c "ws://localhost:3333/socket.io/?EIO=3&transport=websocket"
```

### Events it handles

- socket.on('disconnect')

  If this socket is in the current matchmaking: it cancels it.

  If this socket is in a match: it notifies its opponent that it has disconnected.

- socket.on('emit turn')

  Expects an integer, saves it to an object with the key 'button' and is sent to his opponent to perform the action of pressing that button.

- socket.on('emit username')

  Expects a string that corresponds to the name of the user who sends its.
  Save this username within the instance of class 'Room' corresponding to this user's current game. And send this username to your opponent to display on screen.

### Events it sends

- emit('start game', data)
- emit('opponent disconnected')
- emit('my turn', data_object)
- emit('opponent username', data_object)
