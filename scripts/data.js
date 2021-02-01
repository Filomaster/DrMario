"use strict";

// Player class for easier (at least in theory) multiplayer implementation
class Player {
  gameSpeed = 1000;

  constructor() {
    this.board = new Array(128);
    this.pill = { x: 0, y: 0, rotation: 0 };
    this.isGrounded = true; //! idk if this is the best idea
    // Pseudo private variables
    let _speed = 1000;
    let _score = 0;
    let _interval;

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
  }
}

// All data and structures, shared in other scripts.
let Data = {
  // All possible field status, equivalent of enumerator
  FieldStates: { empty: 0, red: 1, yellow: 2, blue: 3 },
  Mode: { single: 1, multi: 2 },
};
