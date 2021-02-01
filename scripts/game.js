"use strict";

let BOARD = document.getElementById("board");
console.log(BOARD);

// Menu pauzy:
// - resume -
// sound
// controls
// exit

let player; // !temporary player. Modify when creating multiplayer mode
let Game = {
  // Initializing boards for players. Player number is passed as an argument
  InitBoard: (playerCount) => {
    for (let i = 0; i < player.board.length; i++) {
      player.board[i] = Data.FieldStates.emptyS;
    }
    // TODO: Change later for multiplayer using Player class
    // if (playerCount == 2) {
    //   for (let i = 0; i < Game.Player.two.board.length; i++) {
    //     Game.Player.two.board[i] = 0;
    //   }
    // }
  },
  // Initializing all things needed for game
  Setup: () => {
    // TODO: Add 2 players mode
    player = new Player();

    // Adding listeners for whole document to handle keyboard input
    // This whole callback hell serves purpose of implementing different callback for alternate keybinding in multiplayer
    document.addEventListener("keyup", (e) => {
      Engine.Input.GetKey(
        e,
        () => console.log("left"),
        () => console.log("right"),
        () => console.log("rotate left"),
        () => console.log("rotate right"),
        () => console.log("shifting down")
      );
    });

    Game.InitBoard(1); // Filing whole Game.board with 0
    Engine.InitBoard(player.board, BOARD); // Creating game board in the document
  },
  Move: (_player) => {},
  Rotate: (_player, direction) => {},
  CheckCollision: (_player) => {},
  Gravity: (_player) => {
    let _interval = setInterval(() => {
      // Spawning pills
      if (_player.isGrounded) {
        // console.log("Grounded!");
        _player.board[3] = Engine.Utility.getRandomInt(1, 3);
        _player.board[4] = Engine.Utility.getRandomInt(1, 3);
        _player.isGrounded = false;
      }
      // Shifting pills down
      for (let i = _player.board.length - 9; i >= 0; i--) {
        if (_player.board[i] != Data.FieldStates.empty && !_player.isGrounded) {
          if (i + 8 > 119 || _player.board[i + 8] != Data.FieldStates.empty) {
            console.log(_player.board[i + 8] != Data.FieldStates.empty);
            _player.isGrounded = true;
          }
          _player.board[i + 8] = _player.board[i];
          _player.board[i] = Data.FieldStates.empty;
          break;
        }
        // console.log(i);
        if (i > 119 || player.board[i + 8] != Data.FieldStates.empty) {
          // console.log(
          //   "Reason: " + i > 119
          //     ? `i = ${i}`
          //     : `board[${i + 8} = ${player.board[i + 8]}`
          // );
          player.isGrounded = true;
        }
      }
      Engine.Render(_player.board);
    }, _player.getSpeed());
    _player.setInterval(_interval);
  },
  Game1P: function () {
    this.Gravity(player);
  },
};

// !!! Setting up and starting actual game:
Game.Setup();
Game.Game1P();
