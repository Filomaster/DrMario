"use strict";

// Player class for easier (at least in theory) multiplayer implementation
class Player {
  gameSpeed = 250;
  constructor() {
    this.board = new Array(128);
    this.pill = { l: 0, r: 0, y: 0, rotation: 0 }; //TODO: It might be not the best option
    this.isGrounded = true; //! idk if this is the best idea
    // Pseudo private variables
    let _speed = 1000;
    let _score = 0;
    let _interval;
    // In the original Dr.Mario game (NES version), pills were pre-generated at the start of game.
    // https://tetris.wiki/Dr._Mario
    // I'll go with the same approach, storing all pills in the 128 elements array.
    let _preGeneratedPills = new Array(128);
    let _pillsIndex = 0;

    // methods
    this.spawnPill = function () {
      this.pill = { l: 3, r: 4, y: 0, rotation: 0 }; //TODO: Describe pill
      this.state = Data.State.movement;
      this.board[3] = _preGeneratedPills[_pillsIndex].l;
      this.board[4] = _preGeneratedPills[_pillsIndex].r;
      _pillsIndex = _pillsIndex >= 127 ? 0 : _pillsIndex + 1;
      this.isGrounded = false;
    };
    this.generatePills = () => {
      for (let i = 0; i < _preGeneratedPills.length; i++) {
        _preGeneratedPills[i] = {
          l: Utility.getRandomInt(1, 3),
          r: Utility.getRandomInt(1, 3),
        };
      }
    };

    // getters and setters
    // > speed
    this.getSpeed = () => _speed;
    this.setSpeed = (speed) => (_speed = speed);
    // > score
    this.getScore = () => _score;
    this.setScore = (score) => (_score = score);
    // > interval
    this.getInterval = () => _interval;
    this.setInterval = (interval) => (_interval = interval);
    // > pill index
    this.getPillIndex = () => _pillsIndex;
    // > orientation
    this.getOrientation = function () {
      return this.pill.rotation == 0 || this.pill.rotation == 180
        ? "horizontal"
        : "vertical";
    };

    this.logThis = function () {
      console.log(this);
    };

    // Functions called in constructor
    this.generatePills(); // Generating pills after initializing array
  }
}

// All data and structures, shared in other scripts.
let Data = {
  // All possible field status, equivalent of enumerator
  Field: {
    empty: 0,
    red: 1,
    yellow: 2,
    blue: 3,
    virus_r: 11,
    virus_y: 12,
    virus_b: 13,
  },
  State: { movement: 0, clear: 1, gravity: 2 },
  Mode: { single: 1, multi: 2 },
};
