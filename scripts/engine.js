"use strict";

let BOARD = document.getElementById("board");
let BACKGROUND = document.getElementById("background-fill");
let ROOT = document.documentElement;

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
  ChengeBackground: (color_a, color_b = "transparent") => {
    console.log(color_a);
    ROOT.style.setProperty("--background-tile-a", Data.ColorsATARI.bcg[color_a]);
  },
  LoadSprites: (mode_string) => {
    let _path = `url("/images/${mode_string}/`;
    // Loading background images
    let _bcgPath = _path + "bcg/";
    ROOT.style.setProperty("--jar-img", _bcgPath + 'jar.png")');
    ROOT.style.setProperty("--jar-mask", _bcgPath + 'jar-mask.png")');
    ROOT.style.setProperty("--scoreboard-img", _bcgPath + 'scoreboard.png")');
    ROOT.style.setProperty("--info-img", _bcgPath + 'infoboard.png")');
    ROOT.style.setProperty("--glass-img", _bcgPath + 'glass.png")');
    ROOT.style.setProperty("--dr-bcg-img", _bcgPath + 'mario-bcg.png")');

    // Loading sprites

    let sprites = ["virus", "x", "left", "right", "up", "down", "dot", "o"];
    let colors = ["yl", "rd", "bl"];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < sprites.length; j++) {
        let _src = j < 2 ? "viruses/" : "pills/";
        let _property = "--" + colors[i] + "-" + sprites[j];
        let _name = colors[i] + "_" + sprites[j];
        ROOT.style.setProperty(_property, _path + "sprites/" + _src + _name + '.png")');
      }
    }
  },
  DrawBackground: (mode, _player) => {
    let screen,
      color_a,
      color_b,
      offset_x,
      offset_y,
      jar_width,
      jar_height,
      glass_size,
      left_decoration_width,
      board_offset_x;

    let spritesMultiplier = 1;
    color_b = "000";
    switch (mode) {
      case Data.EmulationMode.ATARI:
        Engine.LoadSprites("ATARI");
        screen = Data.ScreenSize.ATARI;
        color_a = Data.ColorsATARI.bcg[_player.getVirusLevel() % 5];
        offset_x = 15;
        offset_y = 1;
        jar_width = 12;
        jar_height = 21;
        board_offset_x = 2;
        glass_size = 13;
        left_decoration_width = 13;
        break;
      case Data.EmulationMode.NES:
        Engine.LoadSprites("NES");
        screen = Data.ScreenSize.NES;
        console.log(player.getSpeedLevel());
        color_a =
          _player.getSpeedLevel().name == "LOW"
            ? Data.ColorsNES.bcg[0]
            : _player.getSpeedLevel().name == "MED"
            ? Data.ColorsNES.bcg[1]
            : Data.ColorsNES.bcg[2];

        jar_width = 10;
        jar_height = 22;
        board_offset_x = 1;
        offset_y = 3;
        offset_x = 11;
        glass_size = 11;
        left_decoration_width = 10;
        break;
      case Data.EmulationMode.GB:
        Engine.LoadSprites("GB");
        spritesMultiplier = 2;
        screen = Data.ScreenSize.GB;
        spritesMultiplier = 2;
        board_offset_x = 1;
        jar_width = 10;
        jar_height = 18;
        offset_x = 1;
        glass_size = 3;
        left_decoration_width = 7;
        color_a = "#606060";
        color_b = "#A8A8A8";
        break;
    }
    let tileSize = 100 / screen.h;
    ROOT.style.setProperty("--tile-size", tileSize + "vh");
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
