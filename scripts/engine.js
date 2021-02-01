"use strict";

// This object handle all 'technical side' of the game
// (basically anything that is not related to game data)
let Engine = {
  // Useful
  Utility: {
    getRandomInt: (min, max) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
  },
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
      cb_l, // callback for left key
      cb_r, // callback for right key
      cb_rl, // callback for rotate left
      cb_rr, // callback for rotate right
      cb_shift, // callback for shifting pill down
      // Alternative callback used in multiplayer. They are equals to normal callbacks for default
      cb_al = cb_l, // alternative callback for left key
      cb_ar = cb_r, // alternative callback for right key
      cb_arl = cb_rl, // alternative callback for rotate left
      cb_arr = cb_rr, // alternative callback for rotate right
      cb_ashift = cb_shift // alternative callback for shifting pill down
    ) => {
      switch (e.key.toLowerCase()) {
        case Engine.Input.Binding.left[0]:
          cb_l();
          break;
        case Engine.Input.Binding.left[1]:
          cb_al();
          break;
        case Engine.Input.Binding.right[0]:
          cb_r();
          break;
        case Engine.Input.Binding.right[1]:
          cb_ar();
          break;
        case Engine.Input.Binding.rotate_left[0]:
          cb_rl();
          break;
        case Engine.Input.Binding.rotate_left[1]:
          cb_arl();
          break;
        case Engine.Input.Binding.rotate_right[0]:
          cb_rr();
          break;
        case Engine.Input.Binding.rotate_right[1]:
          cb_arr();
          break;
        case Engine.Input.Binding.shift_down[0]:
          cb_shift();
          break;
        case Engine.Input.Binding.shift_down[1]:
          cb_ashift();
          break;
        case Engine.Input.Binding.pause[0]:
        case Engine.Input.Binding.pause[1]:
          console.log("pause");
          break;
      }
    },
  },
  // Filling up div on the page with empty divs
  InitBoard: (board, parent) => {
    board.forEach((element, i) => {
      let field = document.createElement("div");
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
