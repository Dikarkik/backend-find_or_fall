// Class to save all the information about a match
module.exports = class Room {
  constructor() {
    this.id = null;
    this.player1Socket = null;
    this.player2Socket = null;
    this.player1Id = null;
    this.player2Id = null;
    this.player1Name = null;
    this.player2Name = null;
    this.button1 = null;
    this.button2 = null;
  }

  // Prepares data to send when the game starts
  initialInfo() {
    let data = { ...this };
    delete data.player1Socket;
    delete data.player2Socket;
    data['player1_id'] = this.player1Id;
    data['player2_id'] = this.player2Id;
    return data;
  }

  // Defines the secret buttons for the game mechanic
  randomButtons() {
    this.button1 = "" + Math.floor(Math.random() * 8);
    this.button2 = "" + Math.floor(Math.random() * 8);
    while (this.button2 === this.button1)
      this.button2 = "" + Math.floor(Math.random() * 8);
  };

  // Returns the opponent ID
  getOpponentId(id) {
    if (id === this.player1Id)
      return this.player2Id;
    else
      return this.player1Id;
  }

  // Save the username of a player
  saveUsername(id, name) {
    if (id === this.player1Id)
      this.player1Name = name;
    else
      this.player2Name = name;
  }
};
