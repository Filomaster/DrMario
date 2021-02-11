"use strict";

//TODO: Add automatic pause and open pause menu on focus lost

// Pause menu:
// - resume -
// sound
// controls
// exit

let player; // !temporary player. Modify when creating multiplayer mode
let Game = {
  EmulationMode: Data.EmulationMode.GB,
  // Initializing boards for players. Player number is passed as an argument
  InitBoard: (playerCount) => {
    for (let i = 0; i < player.board.length; i++) {
      player.board[i] = Data.Field.empty;
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
      Engine.Input.GetKey(e, Game.Move, Game.Rotate, player);
    });
    document.addEventListener("keydown", (e) => {
      Engine.Input.GetKeyOnce(e, Game.StartShift, player);
    });
    document.addEventListener("keyup", (e) => {
      Engine.Input.GetKeyOnce(e, Game.StopShift, player);
    });

    player.setupBoard();
    Engine.DrawBackground(Game.EmulationMode, player);
    Engine.InitBoard(player.board, BOARD); // Creating game board in the document
  },
  //
  Move: (_player, direction) => {
    if (_player.state != Data.State.movement) return;
    if (
      (direction == -1 &&
        (_player.pill.l == _player.pill.y * 8 ||
          _player.board[_player.pill.l - 1] != Data.Field.empty)) ||
      (_player.getOrientation() == "vertical" &&
        direction == -1 &&
        _player.board[_player.pill.r - 1] != Data.Field.empty)
    )
      return;
    if (
      (direction == 1 &&
        (_player.pill.r == (_player.pill.y - (_player.getOrientation() == "vertical")) * 8 + 7 ||
          _player.board[_player.pill.r + 1] != Data.Field.empty)) ||
      (_player.getOrientation() == "vertical" &&
        direction == 1 &&
        _player.board[_player.pill.l + 1] != Data.Field.empty)
    )
      return;

    // TODO: Comment process below
    let _r = _player.board[_player.pill.r];
    let _l = _player.board[_player.pill.l];
    _player.board[_player.pill.l + direction] = _l;
    _player.board[_player.pill.r + direction] = _r;
    BOARD.childNodes[_player.pill.l + direction].dataset.pair = _player.getPillIndex();
    BOARD.childNodes[_player.pill.r + direction].dataset.pair = _player.getPillIndex();

    if (direction == 1 || _player.getOrientation() == "vertical") {
      _player.board[_player.pill.l] = Data.Field.empty;
      BOARD.childNodes[_player.pill.l].removeAttribute("data-pair");
    }
    if (direction == -1 || _player.getOrientation() == "vertical") {
      _player.board[_player.pill.r] = Data.Field.empty;
      BOARD.childNodes[_player.pill.r].removeAttribute("data-pair");
    }

    _player.pill.l += direction;
    _player.pill.r += direction;
    Engine.Render(_player.board);
  },
  // This method rotates player pill
  Rotate: (_player, rotation) => {
    if (_player.state != Data.State.movement) return; // Rotating only when player can interact with pill
    let _ro = _player.pill.rotation; // Saving old rotation value, to check if color swap will be needed
    // Modifying values to keep consistent 0*, 90*, 180* and 270* rotation values
    if (_player.pill.rotation + rotation >= 360) _player.pill.rotation = 0;
    else if (_player.pill.rotation + rotation <= -90) _player.pill.rotation = 270;
    else _player.pill.rotation += rotation;

    let _rn = _player.pill.rotation; // Saving new value to check if color swap will be needed
    let _tmp = _player.board[_player.pill.l - 9]; // Saving value of the cell above l for swapping after wall kick
    let _fillGap = false;
    // Checking if color flipping is necessary
    if (
      (_ro == 0 && _rn == 270) ||
      (_ro == 270 && _rn == 0) ||
      (_ro == 90 && _rn == 180) ||
      (_ro == 180 && _rn == 90)
    ) {
      // Swapping cells values
      let _r = _player.board[_player.pill.r];
      _player.board[_player.pill.r] = _player.board[_player.pill.l];
      _player.board[_player.pill.l] = _r;
    }
    // If pill is in the vertical orientation and player try to rotate it, pill will move back 1 position
    if (
      (_player.pill.r == (_player.pill.y - 1) * 8 + 7 ||
        _player.board[_player.pill.l + 1] != Data.Field.empty) &&
      _player.getOrientation() == "horizontal"
    ) {
      if (
        _player.board[_player.pill.l - 1] != Data.Field.empty ||
        (player.board[_player.pill.l + 1] != Data.Field.empty &&
          Game.EmulationMode == Data.EmulationMode.ATARI)
      ) {
        _player.pill.rotation = _ro;
        return;
      }

      Game.Move(_player, -1);
      _fillGap = true;
    }
    switch (_player.pill.rotation) {
      case 0:
      case 180:
        _player.board[_player.pill.l + 1] = _player.board[_player.pill.r];
        BOARD.childNodes[_player.pill.l + 1].dataset.pair = _player.getPillIndex();
        _player.board[_player.pill.r] = Data.Field.empty;
        BOARD.childNodes[_player.pill.r].removeAttribute("data-pair");
        _player.pill.r = _player.pill.l + 1;
        break;
      case 90:
      case 270:
        _player.board[_player.pill.l - 8] = _player.board[_player.pill.r];
        if (_player.pill.l > 7)
          BOARD.childNodes[_player.pill.l - 8].dataset.pair = _player.getPillIndex();
        _player.board[_player.pill.r] = Data.Field.empty;
        BOARD.childNodes[_player.pill.r].removeAttribute("data-pair");
        _player.pill.r = _player.pill.l - 8;
        break;
    }
    if (_fillGap) _player.board[_player.pill.l - 8] = _tmp;
    Engine.Render(_player.board);
  },
  // Dropping pills
  StartShift: (_player) => {
    if (_player.state == Data.State.shifting) return;
    clearInterval(_player.getInterval());
    _player.state = Data.State.shifting;
    // let shiftSpeed = _player.gameSpeed > 100 ? 50 : _player.gameSpeed > 50 ? 25 : 1;
    Game.MainLoop(_player, 20);
  },
  StopShift: (_player, _state = Data.State.movement) => {
    if (Game.EmulationMode == Data.EmulationMode.ATARI && _state == Data.State.movement) return;
    if (_player.state != Data.State.shifting) return;
    // BUG: MainLoop in NES after shifting is canceled
    clearInterval(_player.getInterval());
    _player.state = _state;
    Game.MainLoop(_player);
  },

  // This method check if two cells are the same color (one might be virus tho)
  CheckPills: (a, b) => {
    if (a == b - 10 || a == b || a == b + 10) return true;
    return false;
  },
  // This method checks if player set 4 or more pills/viruses in row or column and removes it
  ClearPills: (board, _player) => {
    // Pushing values to indexesToClear, wrapped in function to not repeat code
    let viruses = 0;
    let PushCells = (cells) => {
      cells.forEach((cell) => {
        if (cell.value > 10) viruses += 1;
        indexesToClear.push(cell.index);
      });
    };
    let indexesToClear = [];
    // First searching for 4+ same color cells in the column
    for (let i = 7; i >= 0; i--) {
      let lastCells = [];
      for (let y = 15; y >= 0; y--) {
        let currentCell = board[y * 8 + i];
        if (lastCells.length == 0 && currentCell == Data.Field.empty) continue;
        if (lastCells.length != 0) {
          if (!Game.CheckPills(currentCell, lastCells[lastCells.length - 1].value)) {
            if (lastCells.length >= 4) PushCells(lastCells);
            lastCells = [];
          }
        }
        if (currentCell != Data.Field.empty)
          lastCells.push({ value: currentCell, index: y * 8 + i });
      }
      if (lastCells.length >= 4) PushCells(lastCells);
    }
    // Searching for 4+ same color cells in the row
    for (let i = 15; i >= 0; i--) {
      let lastCells = [];
      for (let x = 7; x >= 0; x--) {
        let currentCell = board[i * 8 + x];
        if (lastCells.length == 0 && currentCell == Data.Field.empty) continue;
        if (lastCells.length != 0) {
          if (!Game.CheckPills(currentCell, lastCells[lastCells.length - 1].value)) {
            if (lastCells.length >= 4) PushCells(lastCells);
            lastCells = [];
          }
        }
        if (currentCell != Data.Field.empty)
          lastCells.push({ value: currentCell, index: i * 8 + x });
      }
      if (lastCells.length >= 4) PushCells(lastCells);
    }
    if (indexesToClear.length != 0) {
      indexesToClear.filter(Utility.getUnique).forEach((cell) => {
        board[cell] = Data.Field.empty;
        BOARD.childNodes[cell].removeAttribute("data-pair");
        BOARD.childNodes[cell].classList.add("clear");
        Engine.Render(board);
      });
      _player.incrementScore(viruses);
      Engine.WriteScore(_player);
      return true;
    }
    return false;
  },

  // This method checks whether or not pill is colliding with something below
  CheckCollision: (board, cell1, cell2, orientation) => {
    if (cell1 > 119) return true; // Check if -
    if (
      board[cell1 + 8] != Data.Field.empty ||
      (board[cell2 + 8] != Data.Field.empty && orientation == "horizontal")
    )
      return true;
    return false;
  },
  MainLoop: (_player, _speed = _player.getSpeed()) => {
    let _interval = setInterval(() => {
      // Checking current game state
      switch (_player.state) {
        case Data.State.shifting:
        case Data.State.movement:
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
            BOARD.childNodes[_player.pill.l + 8].dataset.pair = BOARD.childNodes[_player.pill.r + 8].dataset.pair = _player.getPillIndex(); //prettier-ignore
            _player.board[_player.pill.l + 8] = _player.board[_player.pill.l];
            _player.board[_player.pill.r + 8] = _player.board[_player.pill.r];
            // Clearing cells after shifting
            if (_player.getOrientation() == "horizontal") {
              BOARD.childNodes[_player.pill.l].removeAttribute("data-pair");
              _player.board[_player.pill.l] = Data.Field.empty;
            }
            BOARD.childNodes[_player.pill.r].removeAttribute("data-pair");
            _player.board[_player.pill.r] = Data.Field.empty;

            _player.pill.l += 8; //
            _player.pill.r += 8; //
            _player.pill.y++;
          } else {
            BOARD.childNodes[_player.pill.l].dataset.pair = BOARD.childNodes[
              _player.pill.r
            ].dataset.pair = _player.getPillIndex();
            _player.isGrounded = true; //Setting grounded value
            if ((_player.state = Data.State.shifting)) Game.StopShift(_player, Data.State.clear);
            _player.state = Data.State.clear; //After placing pill, we need to check if any cells can be cleared
            clearInterval(_player.getInterval());
            Game.MainLoop(_player, 50);
          }
          break;
        case Data.State.clear:
          _player.state = Game.ClearPills(_player.board, _player)
            ? Data.State.gravity
            : Data.State.movement;
          setTimeout(() => {
            BOARD.childNodes.forEach((node) => node.classList.remove("clear"));
            Engine.Render(_player.board);
          }, 100);
          if (_player.getVirusCount() == 0) {
            _player.setVirusLevel(_player.getVirusLevel() + 1);
            _player.setupBoard();
            Engine.WriteScore(_player);
            if (Game.EmulationMode == Data.EmulationMode.ATARI)
              Engine.ChangeBackground(_player.getVirusLevel() % 5);
          }
          if (_player.state == Data.State.movement) {
            clearInterval(_player.getInterval());
            Game.MainLoop(_player);
          }
          break;
        case Data.State.gravity:
          // TODO: COMMENT THIS YOU LITTLE SHIT
          let isMoveableCell = false;
          for (let i = 119; i >= 0; i--) {
            if (
              (_player.board[i] == Data.Field.red ||
                _player.board[i] == Data.Field.yellow ||
                _player.board[i] == Data.Field.blue) &&
              _player.board[i + 8] == Data.Field.empty
            ) {
              if (
                BOARD.childNodes[i].dataset.pair == BOARD.childNodes[i - 1].dataset.pair &&
                _player.board[i + 8] == Data.Field.empty &&
                _player.board[i + 7] == Data.Field.empty
              ) {
                _player.board[i + 8] = _player.board[i];
                _player.board[i + 7] = _player.board[i - 1];
                _player.board[i] = Data.Field.empty;
                _player.board[i - 1] = Data.Field.empty;
                BOARD.childNodes[i + 8].dataset.pair = BOARD.childNodes[i].dataset.pair;
                BOARD.childNodes[i + 7].dataset.pair = BOARD.childNodes[i - 1].dataset.pair;
                BOARD.childNodes[i].removeAttribute("data-pair");
                BOARD.childNodes[i - 1].removeAttribute("data-pair");
                isMoveableCell = true;
                continue;
              }
              if (
                BOARD.childNodes[i].dataset.pair != BOARD.childNodes[i + 1].dataset.pair &&
                BOARD.childNodes[i].dataset.pair != BOARD.childNodes[i - 1].dataset.pair
              ) {
                _player.board[i + 8] = _player.board[i];
                _player.board[i] = Data.Field.empty;
                BOARD.childNodes[i + 8].dataset.pair = BOARD.childNodes[i].dataset.pair;
                BOARD.childNodes[i].removeAttribute("data-pair");
                isMoveableCell = true;
                continue;
              }
            }
          }
          if (!isMoveableCell) {
            _player.state = Data.State.clear;
          }
          break;
        case Data.State.win:
          console.log("level clear");
          break;
        case Data.State.lose:
          console.log("you lost");
          clearInterval(player.getInterval());
          break;
      }
      if (_player.state == Data.State.movement && _player.isGrounded) _player.spawnPill();
      Engine.Render(_player.board);
      // if (DEBUG) Utility.printBoard(_player.board);
    }, _speed);

    _player.setInterval(_interval);
  },
  Game1P: function () {
    player.spawnPill();
    Engine.Render(player.board);
    this.MainLoop(player);
    setInterval(Game.CheckFocus, 300);
  },
  CheckFocus: function () {
    if (!document.hasFocus()) {
      clearInterval(player.getInterval());
      player.setInterval(null);
    } else if (document.hasFocus() && player.getInterval() == null) {
      Game.MainLoop(player);
    }
  },
};

// !!! Setting up and starting actual game:
Game.Setup();
Game.Game1P();
