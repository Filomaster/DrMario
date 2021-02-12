"use strict";

let BOARD = document.getElementById("board");
let BACKGROUND = document.getElementById("background-fill");
// All CSS variables are stored in root
let ROOT = document.documentElement;
// Elements related to displaying player data
const SCORE = document.getElementById("score");
const T_SCORE = document.getElementById("top-score");
const LVL = document.getElementById("lvl");
const SPEED = document.getElementById("speed");
const VIRUS = document.getElementById("virus");
const STATUS = document.getElementById("status");
const STATUS_MASK = document.getElementById("status-mask");
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
    // Setting keys corresponding to certain actions
    SetBinding: function (binding, variant, key) {
      this.Binding[binding][variant] = key;
      for (const [_key, _value] of Object.entries(this.Binding)) {
        for (let i = 0; i < 2; i++)
          if (_key != binding && _value[i] == key) this.Binding[_key][i] = "";
      }
      this.SaveBinding();
      return this.Binding;
    },
    // Returns current binding
    GetBinding: function () {
      return this.Binding;
    },
    // Saving key binding to the local storage
    SaveBinding: function () {
      for (const [_key, _value] of Object.entries(this.Binding)) {
        for (let i = 0; i < 2; i++) localStorage.setItem(_key + "_" + i, _value[i]);
      }
    },
    // Loading key binding from local storage
    LoadBinding: function () {
      for (const [_key, _value] of Object.entries(localStorage)) {
        if (this.Binding.hasOwnProperty(_key.slice(0, _key.length - 2)))
          this.Binding[_key.slice(0, _key.length - 2)][parseInt(_key[_key.length - 1])] = _value;
      }
    },
    // Resetting keybinding to default values
    ResetBinding: function () {
      this.Binding.left = ["a", "arrowleft"];
      this.Binding.right = ["d", "arrowright"];
      this.Binding.rotate_left = ["w", "arrowup"];
      this.Binding.rotate_right = ["shift", "shift"];
      this.Binding.shift_down = ["s", "arrowdown"];
      this.Binding.pause = ["escape", "backspace"];
      this.SaveBinding;
      return this.Binding;
    },
    // This method handle all inputs in the game
    GetKey: function (
      e, // passed event
      cb_move, // callback for moving (left and right keys)
      cb_rotate, // callback for rotating (left or right)
      player_one, // default player for all bindings
      player_two = player_one // if game is in multiplayer mode, alternative keybinding will be interpreted as second player
    ) {
      switch (e.key.toLowerCase()) {
        case this.Binding.left[0]:
          cb_move(player_one, -1);
          break;
        case this.Binding.left[1]:
          cb_move(player_two, -1);
          break;
        case this.Binding.right[0]:
          cb_move(player_one, 1);
          break;
        case this.Binding.right[1]:
          cb_move(player_two, 1);
          break;
        case this.Binding.rotate_left[0]:
          cb_rotate(player_one, -90);
          break;
        case this.Binding.rotate_left[1]:
          cb_rotate(player_two, -90);
          break;
        case this.Binding.rotate_right[0]:
          cb_rotate(player_one, 90);
          break;
        case this.Binding.rotate_right[1]:
          cb_rotate(player_two, 90);
          break;
        case this.Binding.pause[0]:
        case this.Binding.pause[1]:
          console.log("pause");
          break;
      }
    },
    // This function handle actions that must be executed once
    GetKeyOnce: function (e, cb_shift, player_one, player_two = player_one) {
      switch (e.key.toLowerCase()) {
        case this.Binding.shift_down[0]:
          cb_shift(player_one);
          break;
        case this.Binding.shift_down[1]:
          cb_shift(player_two);
          break;
      }
    },
  },

  Resources: {
    digits: new Array(10), // All digits numbers
    speedIndicators: new Array(3), // All speed values displayed in game
    // Two variables to store level clear and game over messages
    message: { win: "", lose: "", pause: "", winMask: "", loseMask: "", pauseMask: "" },
    // Loading all resources like sprites and
    Load: function (mode_string) {
      // Loading graphic
      // Loading all graphics path to CSS variables
      let _path = `url("/images/${mode_string}/`;
      // > Setting background images path in the CSS variables
      ROOT.style.setProperty("--bcg-img", _path + 'bcg/bcg.png")');
      ROOT.style.setProperty("--jar-img", _path + 'bcg/jar.png")');
      ROOT.style.setProperty("--jar-mask", _path + 'bcg/jar-mask.png")');
      // > Pills and virus sprites
      let _sprites = ["virus", "x", "left", "right", "up", "down", "dot", "o"];
      let _colors = ["yl", "rd", "bl"];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < _sprites.length; j++) {
          let _src = j < 2 ? "viruses/" : "pills/";
          let _property = "--" + _colors[i] + "-" + _sprites[j];
          let _name = _colors[i] + "_" + _sprites[j];
          // Setting pill/virus sprite path as
          ROOT.style.setProperty(_property, _path + "sprites/" + _src + _name + '.png")');
        }
      }
      // Loading sprites url to arrays and variables
      // > Digit sprites
      for (let i = 0; i < 10; i++) this.digits[i] = _path + "digits/" + i + '.png")';
      // > Speed level sprites
      for (let i = 0; i < 3; i++) this.speedIndicators[i] = +_path + "info/sp_" + i + '.png")';
      // > Clear and game over messages
      this.message.win = _path + 'windows/win.png");';
      this.message.lose = _path + 'windows/lose.png");';
      this.message.pause = _path + 'windows/pause.png");';
      if (mode_string == "ATARI") {
        this.message.loseMask = _path + 'windows/lose_mask.png");';
        this.message.pauseMask = _path + 'windows/lose_mask.png");';
        this.message.winMask = _path + 'windows/win_mask.png");';
      }
      // Loading sounds
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
  GraphicManager: {
    tileSize: 0,
    emulationMode: "", // TODO: Reorganize code
  },
  // This method change colors of chessboard tiles in the background.
  ChangeBackground: (color_a, color_b = "transparent") => {
    console.log(color_a);
    ROOT.style.setProperty("--background-tile-a", Data.ColorsATARI.bcg[color_a]);
  },
  RenderNumber: function (parent, number) {}, //TODO
  // As name suggest this method is responsible for writing score and top score into the scoreboard
  WriteInfo: (_player) => {
    // TODO: You repeat the nearly identical for loop 4 times. Just make it one method, won't ya?
    // Those two lines bit hacky and are by no mean optimal, but this way of separating digits is super easy;
    let _score_str = _player.getScore().toString(); // First I convert number to string
    for (let i = _score_str.length; i < 7; i++) _score_str = "0" + _score_str; // Then iterate through all characters (digits in this case)
    for (let i = 0; i < _score_str.length; i++) {
      if (SCORE.childNodes.length < 7) {
        let digit = document.createElement("div");
        digit.style = `height: var(--tile-size); width: var(--tile-size); background-image: ${
          Engine.Resources.digits[parseInt(_score_str[i])]
        }; background-size: 100%;`;
        SCORE.append(digit);
      } else {
        SCORE.childNodes[i].style.backgroundImage =
          Engine.Resources.digits[parseInt(_score_str[i])];
      }
    }
    // Those two lines bit hacky and are by no mean optimal, but this way of separating digits is super easy;
    let _t_score_str = Game.TopScore; // First I convert number to string
    for (let i = _t_score_str.length; i < 7; i++) _t_score_str = "0" + _t_score_str; // Then iterate through all characters (digits in this case)
    for (let i = 0; i < _t_score_str.length; i++) {
      if (T_SCORE.childNodes.length < 7) {
        let digit = document.createElement("div");
        digit.style = `height: var(--tile-size); width: var(--tile-size); background-image: ${
          Engine.Resources.digits[parseInt(_t_score_str[i])]
        }; background-size: 100%;`;
        T_SCORE.append(digit);
      } else {
        T_SCORE.childNodes[i].style.backgroundImage =
          Engine.Resources.digits[parseInt(_t_score_str[i])];
      }
    }

    let _viruses = (player.getVirusCount() < 10 ? "0" : "") + player.getVirusCount();
    for (let i = 0; i < _viruses.length; i++) {
      if (VIRUS.childNodes.length < 2) {
        let digit = document.createElement("div");
        digit.style = `height: var(--tile-size); width: var(--tile-size); background-image: ${
          Engine.Resources.digits[parseInt(_viruses[i])]
        }; background-size: 100%;`;
        VIRUS.append(digit);
      } else {
        VIRUS.childNodes[i].style.backgroundImage = Engine.Resources.digits[parseInt(_viruses[i])];
      }
    }

    let _level = (player.getVirusLevel() < 10 ? "0" : "") + player.getVirusLevel();
    for (let i = 0; i < _level.length; i++) {
      if (LVL.childNodes.length < 2) {
        let digit = document.createElement("div");
        digit.style = `height: var(--tile-size); width: var(--tile-size); background-image: ${
          Engine.Resources.digits[parseInt(_level[i])]
        }; background-size: 100%;`;
        LVL.append(digit);
      } else {
        LVL.childNodes[i].style.backgroundImage = Engine.Resources.digits[parseInt(_level[i])];
      }
    }
  },
  ShowStatus: function (status, mode) {
    let _sizes;
    let _message = this.Resources.message[status];
    if (mode == Data.EmulationMode.ATARI) _sizes = Data.WindowSize.ATARI;
    else if (mode == Data.EmulationMode.NES) _sizes = Data.WindowSize.NES;
    else if (mode == Data.EmulationMode.GB) _sizes = Data.WindowSize.GB;

    if (status == "win") _sizes = _sizes.win;
    else if (status == "lose") _sizes = _sizes.lose;
    else if (status == "pause") _sizes = _sizes.pause;

    //prettier-ignore
    STATUS.style =
      `display: block; background-image: ${_message} width: ${_sizes[0]*this.GraphicManager.tileSize}vh;
       height: ${_sizes[1]*this.GraphicManager.tileSize}vh; 
       left: ${_sizes[2]*this.GraphicManager.tileSize}vh; 
       bottom: ${_sizes[3]*this.GraphicManager.tileSize}vh;
       background-size: ${_sizes[0]*this.GraphicManager.tileSize}vh ${_sizes[1]*this.GraphicManager.tileSize}vh;`;
    if (mode == Data.EmulationMode.ATARI) {
      STATUS_MASK.style = `display: block; background-color: var(--background-tile-a);
         mask: ${this.Resources.message[status + "Mask"]}
         width: ${_sizes[0] * this.GraphicManager.tileSize}vh;
         height: ${_sizes[1] * this.GraphicManager.tileSize}vh; 
         left: ${_sizes[2] * this.GraphicManager.tileSize}vh; 
         bottom: ${_sizes[3] * this.GraphicManager.tileSize}vh;
         mask-size: ${_sizes[0] * this.GraphicManager.tileSize}vh ${
        _sizes[1] * this.GraphicManager.tileSize
      }vh;`;
    }
  },
  ClearStatus: function () {
    STATUS.style.display = "none";
    STATUS_MASK.style.display = "none";
  },
  DrawBackground: function (mode, _player) {
    T_SCORE.style.display = "grid";
    let screen,
      color_a,
      color_b,
      offset_x,
      offset_y,
      jar_width,
      jar_height,
      glass_size,
      left_decoration_width,
      board_offset_x,
      scores_x,
      score_y,
      info_right,
      lvl_bot,
      vir_bot,
      t_score_y;

    let spritesMultiplier = 1;
    color_b = "000";
    switch (mode) {
      case Data.EmulationMode.ATARI:
        Engine.Resources.Load("ATARI");
        screen = Data.ScreenSize.ATARI;
        color_a = Data.ColorsATARI.bcg[_player.getVirusLevel() % 5];
        offset_x = 15;
        offset_y = 1;
        scores_x = 5;
        score_y = 8;
        t_score_y = 5;
        jar_width = 12;
        jar_height = 21;
        board_offset_x = 2;
        info_right = 3;
        glass_size = 13;
        vir_bot = 2;
        lvl_bot = 8;
        left_decoration_width = 13;
        break;
      case Data.EmulationMode.NES:
        Engine.Resources.Load("NES");
        screen = Data.ScreenSize.NES;
        color_a =
          _player.getSpeedLevel().name == "LOW"
            ? Data.ColorsNES.bcg[0]
            : _player.getSpeedLevel().name == "MED"
            ? Data.ColorsNES.bcg[1]
            : Data.ColorsNES.bcg[2];

        jar_width = 10;
        jar_height = 22;
        info_right = 3;
        vir_bot = 4;
        lvl_bot = 10;
        board_offset_x = 1;
        offset_y = 3;
        offset_x = 11;
        scores_x = 2;
        t_score_y = 8;
        score_y = 11;
        glass_size = 11;
        left_decoration_width = 10;
        break;
      case Data.EmulationMode.GB:
        Engine.Resources.Load("GB");
        T_SCORE.style.display = "none";
        spritesMultiplier = 2;
        screen = Data.ScreenSize.GB;
        spritesMultiplier = 2;
        board_offset_x = 1;
        info_right = 1;
        vir_bot = 4;
        lvl_bot = 6;
        jar_width = 10;
        jar_height = 18;
        offset_x = 1;
        glass_size = 3;
        scores_x = 12;
        score_y = 2;
        left_decoration_width = 7;
        color_a = "#606060";
        color_b = "#A8A8A8";
        break;
      default:
        console.log("Yo mate, what's wrong?");
        break;
    }
    let tileSize = 100 / screen.h;
    this.GraphicManager.tileSize = tileSize;
    ROOT.style.setProperty("--tile-size", tileSize + "vh");
    ROOT.style.setProperty("--virus-bottom", vir_bot * tileSize + "vh");
    ROOT.style.setProperty("--lvl-bottom", lvl_bot * tileSize + "vh");
    ROOT.style.setProperty("--info-right", info_right * tileSize + "vh");
    ROOT.style.setProperty("--score-y", score_y * tileSize + "vh");
    ROOT.style.setProperty("--t-score-y", t_score_y * tileSize + "vh");
    ROOT.style.setProperty("--scores-x", scores_x * tileSize + "vh");
    ROOT.style.setProperty("--bcg-tile-size", tileSize / spritesMultiplier + "vh");
    ROOT.style.setProperty("--offset-x", offset_x * tileSize + "vh");
    ROOT.style.setProperty("--offset-y", offset_y * tileSize + "vh");
    ROOT.style.setProperty("--jar-width", jar_width * tileSize + "vh");
    ROOT.style.setProperty("--jar-height", jar_height * tileSize + "vh");
    ROOT.style.setProperty("--left-decoration-width", left_decoration_width * tileSize + "vh");
    ROOT.style.setProperty("--glass-height", glass_size * tileSize + "vh");
    ROOT.style.setProperty("--scoreboard-height", 10 * tileSize + "vh");
    ROOT.style.setProperty("--info-width", 11 * tileSize + "vh");
    ROOT.style.setProperty("--board-offset-x", board_offset_x * tileSize + "vh");
    ROOT.style.setProperty("--board-offset-y", tileSize + "vh");
    ROOT.style.setProperty("--dr-bcg-offset", 2 * tileSize + "vh");
    ROOT.style.setProperty("--dr-bcg-size", 9 * tileSize + "vh");
    ROOT.style.setProperty("--tiles-width", screen.w * spritesMultiplier);
    ROOT.style.setProperty("--tiles-height", screen.h);
    ROOT.style.setProperty("--width", (100 / screen.h) * screen.w + "vh");
    ROOT.style.setProperty("--background-tile-a", color_a);
    ROOT.style.setProperty("--background-tile-b", color_b);
    for (let i = 0; i < screen.h * spritesMultiplier; i++) {
      for (let j = 0; j < screen.w * spritesMultiplier; j++) {
        let tile = document.createElement("div");
        tile.style = "width: var(--bcg-tile-size); height: var(--bcg-tile-size);";
        if (!(i % 2 == j % 2) == 0 ? 0 : 1) tile.style.backgroundColor = "var(--background-tile-a)";
        else tile.style.backgroundColor = "var(--background-tile-b)";
        BACKGROUND.appendChild(tile);
      }
    }
    Engine.WriteInfo(_player);
  },
  Render: (board) => {
    let _class;
    for (let i = 0; i < board.length; i++) {
      _class = "pixel-perfect ";
      switch (board[i]) {
        case Data.Field.empty:
          _class = "empty";
          break;
        case Data.Field.blue:
          _class += "pill blue";
          break;
        case Data.Field.yellow:
          _class += "pill yellow";
          break;
        case Data.Field.red:
          _class += "pill red";
          break;
        case Data.Field.virus_b:
          _class += "virus blue";
          break;
        case Data.Field.virus_y:
          _class += "virus yellow";
          break;
        case Data.Field.virus_r:
          _class += "virus red";
          break;
        default:
          _class = "error";
          break;
      }
      if (BOARD.childNodes[i].classList.contains("clear")) {
        _class = BOARD.childNodes[i].classList;
      } else {
        if (i > 7 && BOARD.childNodes[i - 8].dataset.pair == BOARD.childNodes[i].dataset.pair)
          _class += " down";
        else if (
          i < 119 &&
          BOARD.childNodes[i + 8].dataset.pair == BOARD.childNodes[i].dataset.pair
        )
          _class += " up";
        else if (i > 0 && BOARD.childNodes[i - 1].dataset.pair == BOARD.childNodes[i].dataset.pair)
          _class += " right";
        else if (
          i < 127 &&
          BOARD.childNodes[i + 1].dataset.pair == BOARD.childNodes[i].dataset.pair
        )
          _class += " left";
        else _class += " single";
      }
      BOARD.childNodes[i].classList = _class;
    }
  },
  // Tests all pills and viruses sprites. Convenient for development
  TestSprites: () => {
    let arr = new Array(128).fill(0);
    for (let i = 5; i < 12; i += 3) {
      BOARD.childNodes[i * 8].dataset.pair = i;
      BOARD.childNodes[(i - 1) * 8].dataset.pair = i;
      BOARD.childNodes[i * 8 + 1].dataset.pair = i + 1;
      BOARD.childNodes[(i + 1) * 8 + 1].dataset.pair = i + 1;
      BOARD.childNodes[i * 8 + 2].dataset.pair = i + 2;
      BOARD.childNodes[i * 8 + 3].dataset.pair = i + 2;
      BOARD.childNodes[i * 8 + 4].dataset.pair = i + 3;

      for (let j = 0; j < 8; j++) {
        arr[i * 8 + j] = (i == 5 ? 1 : i == 8 ? 2 : 3) + (j < 6 ? 0 : 10);
      }
    }
    Engine.Render(arr);
    BOARD.childNodes[5 * 8 + 5].classList.add("clear");
    BOARD.childNodes[5 * 8 + 6].classList.add("clear");
    BOARD.childNodes[8 * 8 + 5].classList.add("clear");
    BOARD.childNodes[8 * 8 + 6].classList.add("clear");
    BOARD.childNodes[11 * 8 + 5].classList.add("clear");
    BOARD.childNodes[11 * 8 + 6].classList.add("clear");
    Engine.Render(arr);
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
