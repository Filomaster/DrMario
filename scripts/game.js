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
      player.board[i] = Data.FieldStates.empty;
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
    document.addEventListener("keydown", (e) => {
      Engine.Input.GetKey(
        e,
        player,
        Game.Move,
        Game.Move,
        Game.Rotate,
        () => console.log("rotate right"),
        () => console.log("shifting down")
      );
    });

    Game.InitBoard(1); // Filing whole Game.board with 0
    Engine.InitBoard(player.board, BOARD); // Creating game board in the document
  },
  Move: (_player, direction) => {
    if (
      direction == -1 &&
      (_player.pill.l == _player.pill.y * 8 ||
        _player.board[_player.pill.l - 1] != Data.FieldStates.empty)
    )
      return;
    if (
      direction == 1 &&
      (_player.pill.r == _player.pill.y * 8 + 7 ||
        _player.board[_player.pill.r + 1] != Data.FieldStates.empty)
    )
      return;

    // TODO: Comment process below
    let _r = _player.board[_player.pill.r];
    let _l = _player.board[_player.pill.l];

    _player.board[_player.pill.l + direction] = _l;
    _player.board[_player.pill.r + direction] = _r;

    if (direction == 1 || _player.getOrientation() == "vertical")
      _player.board[_player.pill.l] = Data.FieldStates.empty;
    if (direction == -1 || _player.getOrientation() == "vertical")
      _player.board[_player.pill.r] = Data.FieldStates.empty;

    _player.pill.l += direction;
    _player.pill.r += direction;
    Engine.Render(_player.board);
  },
  // TODO: COMMENT THIS
  Rotate: (_player, rotation) => {
    let _ro = _player.pill.rotation;
    if (_player.pill.rotation + rotation >= 360) _player.pill.rotation = 0;
    else if (_player.pill.rotation + rotation <= -90)
      _player.pill.rotation = 270;
    else _player.pill.rotation += rotation;

    let _rn = _player.pill.rotation;
    if (
      (_ro == 0 && _rn == 270) ||
      (_ro == 270 && _rn == 0) ||
      (_ro == 90 && _rn == 180) ||
      (_ro == 180 && _rn == 90)
    ) {
      let _r = _player.board[_player.pill.r];
      _player.board[_player.pill.r] = _player.board[_player.pill.l];
      _player.board[_player.pill.l] = _r;
    }
    switch (_player.pill.rotation) {
      case 0:
      case 180:
        _player.board[_player.pill.l + 1] = _player.board[_player.pill.r];
        _player.board[_player.pill.r] = Data.FieldStates.empty;
        _player.pill.r = _player.pill.l + 1;
        break;
      case 90:
      case 270:
        _player.board[_player.pill.l - 8] = _player.board[_player.pill.r];
        _player.board[_player.pill.r] = Data.FieldStates.empty;
        _player.pill.r = _player.pill.l - 8;
        break;
    }
    Engine.Render(_player.board);
  },

  // This method checks whether or not pill is colliding with something below
  CheckCollision: (board, cell1, cell2, orientation) => {
    if (cell1 > 119) return true; // Check if -
    if (
      board[cell1 + 8] != Data.FieldStates.empty ||
      (board[cell2 + 8] != Data.FieldStates.empty &&
        orientation == "horizontal")
    )
      return true;
    return false;
  },
  Gravity: (_player) => {
    // TODO: (UPDATE THIS) -> First perform gravity for current player pill

    _player.spawnPill();
    Engine.Render(_player.board);

    let _interval = setInterval(() => {
      // Checking if pill collide with something.
      if (
        !Game.CheckCollision(
          _player.board,
          _player.pill.l,
          _player.pill.r,
          _player.getOrientation()
        )
      ) {
        // Shifting cells one row lower
        _player.board[_player.pill.l + 8] = _player.board[_player.pill.l];
        _player.board[_player.pill.r + 8] = _player.board[_player.pill.r];
        // Clearing cells after shifting
        if (_player.getOrientation() == "horizontal")
          _player.board[_player.pill.l] = Data.FieldStates.empty;
        _player.board[_player.pill.r] = Data.FieldStates.empty;

        _player.pill.l += 8; //
        _player.pill.r += 8; //
        _player.pill.y++;
      } else {
        //check for tiles to remove
        _player.isGrounded = true;
      }
      if (_player.isGrounded) _player.spawnPill();
      Engine.Render(_player.board);
      // if (DEBUG) Utility.printBoard(_player.board);
    }, _player.gameSpeed);

    _player.setInterval(_interval);
  },
  Game1P: function () {
    this.Gravity(player);
  },
};

// !!! Setting up and starting actual game:
Game.Setup();
Game.Game1P();
