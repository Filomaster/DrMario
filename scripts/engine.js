"use strict";

let BOARD = document.getElementById("board");
let BACKGROUND = document.getElementById("background");

// This object handle all 'technical side' of the game
// (basically anything that is not related to game data)
let Engine = {
  // All objects and methods related to player input
  Input: {
    //  All key bindings used in game. It can be configured for better experience
    //  name[0] == main controls
    //  name[1] == secondary controls
    Binding: {
      left: ["a", "arrowleft"],
      right: ["d", "arrowright"],
      rotate_left: ["w", "arrowup"],
      rotate_right: ["shift", "shift"],
      shift_down: ["s", "arrowdown"],
      pause: ["escape", "backspace"],
    },
    // This method handle all one-time inputs in the game
    GetKey: (
      e, // passed event
      cb_move, // callback for left key
      cb_rotate, // callback for rotate left
      player_one,
      player_two = player_one // alternative callback for
    ) => {
      switch (e.key.toLowerCase()) {
        case Engine.Input.Binding.left[0]:
          cb_move(player_one, -1);
          break;
        case Engine.Input.Binding.left[1]:
          cb_move(player_two, -1);
          break;
        case Engine.Input.Binding.right[0]:
          cb_move(player_one, 1);
          break;
        case Engine.Input.Binding.right[1]:
          cb_move(player_two, 1);
          break;
        case Engine.Input.Binding.rotate_left[0]:
          cb_rotate(player_one, -90);
          break;
        case Engine.Input.Binding.rotate_left[1]:
          cb_rotate(player_two, -90);
          break;
        case Engine.Input.Binding.rotate_right[0]:
          cb_rotate(player_one, 90);
          break;
        case Engine.Input.Binding.rotate_right[1]:
          cb_rotate(player_two, 90);
          break;
        case Engine.Input.Binding.pause[0]:
        case Engine.Input.Binding.pause[1]:
          console.log("pause");
          break;
      }
    },
    GetKeyOnce: (e, cb_shift, player_one, player_two = player_one) => {
      switch (e.key.toLowerCase()) {
        case Engine.Input.Binding.shift_down[0]:
          cb_shift(player_one);
          break;
        case Engine.Input.Binding.shift_down[1]:
          cb_shift(player_two);
          break;
      }
    },
  },
  // TODO
  Graphic: {
    StartMenu: null,
    GameMenu: null,
    OnePlayerSettings: null,
    TwoPlayerSettings: null,
    OnePlayerScreen: null,
    TwoPlayersScreen: null,
  },
  // Filling up div on the page with empty divs
  InitBoard: (board, parent) => {
    board.forEach((element, i) => {
      let field = document.createElement("div");
      // if (DEBUG) field.style.border = "1px solid white";
      field.dataset.id = i;
      parent.append(field);
    });
  },
  Render: (board) => {
    let _class;
    for (let i = 0; i < board.length; i++) {
      switch (board[i]) {
        case Data.Field.empty:
          _class = "empty";
          break;
        case Data.Field.blue:
          _class = "blue_pill";
          break;
        case Data.Field.yellow:
          _class = "yellow_pill";
          break;
        case Data.Field.red:
          _class = "red_pill";
          break;
        case Data.Field.virus_b:
          _class = "blue_virus";
          break;
        case Data.Field.virus_y:
          _class = "yellow_virus";
          break;
        case Data.Field.virus_r:
          _class = "red_virus";
          break;
      }
      BOARD.childNodes[i].classList = _class;
    }
  },
};

// // TODO: for now it's just quick prototype of window class, which will be used in the menu system
// class Window{
//   constructor();
// }
// // TODO: for now it's just prototype of screen class, which will be used while creating screens in the game'
// class Screen{
//   constructor();
// }
