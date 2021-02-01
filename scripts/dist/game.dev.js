"use strict";

var BOARD = document.getElementById("board");
console.log(BOARD); // Menu pauzy:
// - resume -
// sound
// controls
// exit

var player; // !temporary player. Modify when creating multiplayer mode

var Game = {
  // Initializing boards for players. Player number is passed as an argument
  InitBoard: function InitBoard(playerCount) {
    for (var i = 0; i < player.board.length; i++) {
      player.board[i] = Data.FieldStates.emptyS;
    } // TODO: Change later for multiplayer using Player class
    // if (playerCount == 2) {
    //   for (let i = 0; i < Game.Player.two.board.length; i++) {
    //     Game.Player.two.board[i] = 0;
    //   }
    // }

  },
  // Initializing all things needed for game
  Setup: function Setup() {
    // TODO: Add 2 players mode
    player = new Player(); // Adding listeners for whole document to handle keyboard input
    // This whole callback hell serves purpose of implementing different callback for alternate keybinding in multiplayer

    document.addEventListener("keyup", function (e) {
      Engine.Input.GetKey(e, function () {
        return console.log("left");
      }, function () {
        return console.log("right");
      }, function () {
        return console.log("rotate left");
      }, function () {
        return console.log("rotate right");
      }, function () {
        return console.log("shifting down");
      });
    });
    Game.InitBoard(1); // Filing whole Game.board with 0

    Engine.InitBoard(player.board, BOARD); // Creating game board in the document
  },
  Move: function Move(_player) {},
  Rotate: function Rotate(_player, direction) {},
  CheckCollision: function CheckCollision(_player) {},
  Gravity: function Gravity(_player) {
    var _interval = setInterval(function () {
      // Spawning pills
      if (_player.isGrounded) {
        // console.log("Grounded!");
        _player.board[3] = Engine.Utility.getRandomInt(1, 3);
        _player.board[4] = Engine.Utility.getRandomInt(1, 3);
        _player.isGrounded = false;
      } // Shifting pills down


      for (var i = _player.board.length - 9; i >= 0; i--) {
        if (_player.board[i] != Data.FieldStates.empty && !_player.isGrounded) {
          if (i + 8 > 119 || _player.board[i + 8] != Data.FieldStates.empty) {
            console.log(_player.board[i + 8] != Data.FieldStates.empty);
            _player.isGrounded = true;
          }

          _player.board[i + 8] = _player.board[i];
          _player.board[i] = Data.FieldStates.empty;
          break;
        } // console.log(i);


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
  Game1P: function Game1P() {
    this.Gravity(player);
  }
}; // !!! Setting up and starting actual game:

Game.Setup();
Game.Game1P();