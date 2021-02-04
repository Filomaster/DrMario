"use strict";

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
      shift_down: ["s", "arrowdown"],
      rotate_left: ["w", "arrowup"],
      rotate_right: ["shift", "shift"],
      pause: ["escape", "backspace"],
    },
    // This method handle all one-time inputs in the game
    GetKey: (
      e, // passed event
      cb_move, // callback for left key
      cb_rotate, // callback for rotate left
      cb_shift, // callback for shifting pill down
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
        case Engine.Input.Binding.shift_down[0]:
          cb_shift();
          break;
        case Engine.Input.Binding.shift_down[1]:
          cb_shift();
          break;
        case Engine.Input.Binding.pause[0]:
        case Engine.Input.Binding.pause[1]:
          console.log("pause");
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
        case Data.FieldStates.empty:
          _class = "empty";
          break;
        case Data.FieldStates.blue:
          _class = "blue_pill";
          break;
        case Data.FieldStates.yellow:
          _class = "yellow_pill";
          break;
        case Data.FieldStates.red:
          _class = "red_pill";
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
