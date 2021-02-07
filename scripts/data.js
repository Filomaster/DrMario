"use strict";

// Player class for easier (at least in theory) multiplayer implementation
class Player {
  gameSpeed = 250;
  constructor() {
    this.board = new Array(128);
    this.pill = { l: 0, r: 0, y: 0, rotation: 0 }; //TODO: It might be not the best option
    this.isGrounded = true; //! idk if this is the best idea
    // Pseudo private variables
    let _referenceSpeedLvl = Data.SpeedLevel.LOW;
    let _speedLvl = Data.SpeedLevel.MED;
    let _virusLvl = 10;
    let _pillCounter = 0;
    let _score = 0;
    let _interval;
    // In the original Dr.Mario game (NES version), pills were pre-generated at the start of game.
    // https://tetris.wiki/Dr._Mario
    // I'll go with the same approach, storing all pills in the 128 elements array.
    let _preGeneratedPills = new Array(128);
    let _pillsIndex = 0;

    // methods
    this.spawnPill = function () {
      if (_pillCounter % 10 == 0 && _pillCounter != 0) {
        if (_speedLvl < _referenceSpeedLvl + 50) {
          _speedLvl++;
          console.log(`SPEED UP! \n Current lvl: ${_speedLvl}}`);
        }
      }
      this.pill = { l: 3, r: 4, y: 0, rotation: 0 }; //TODO: Describe pill
      this.state = Data.State.movement;
      this.board[3] = _preGeneratedPills[_pillsIndex].l;
      this.board[4] = _preGeneratedPills[_pillsIndex].r;
      _pillsIndex = _pillsIndex >= 127 ? 0 : _pillsIndex + 1;
      _pillCounter++;
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
    // This method generates new board for each level with viruses placed.
    // I've tried to remake original algorithm as close as possible.
    // It may not be prettiest or most efficient one, but I wanted it to be faithful to the source.
    this.setupBoard = () => {
      this.board.fill(Data.Field.empty);
      let viruses = (_virusLvl + 1) * 4;
      generation: do {
        let candidateY = 15 - Utility.getRandomInt(0, Data.MaximumRow[_virusLvl]);
        let candidateX = Utility.getRandomInt(0, 7);
        let remainder = (viruses - 1) / 4;
        // Calculate viruses colors
        let virusColor =
          remainder == 0
            ? Data.Field.virus_y // If reminder is 0 virus color is yellow
            : remainder == 1
            ? Data.Field.virus_r // If reminder is 1 virus color is red
            : remainder == 2
            ? Data.Field.virus_b // If reminder is 2 virus color is blue
            : Data.VirusColor[Utility.getRandomInt(0, 15)]; // In any other case virus color is generated randomly from table
        // Checking if candidate coordinates are free to place virus
        let index = candidateY * 8 + candidateX;
        while (this.board[index] != Data.Field.empty) {
          candidateX++;
          if (candidateX == 8) { candidateX = 0; candidateY++; } //prettier-ignore
          if (candidateY == 16) continue generation;
        }
        do {
          // Checking 2 cells away from candidate in all 4 directions
          let checkedCells = [
            this.board[index - 2],
            index < 125 ? this.board[index + 2] : null,
            this.board[index - 8],
            index < 119 ? this.board[index + 8] : null,
          ];
          if (checkedCells.filter(Utility.getUnique).length == 3) {
            candidateX++;
            if (candidateX == 8) { candidateX = 0; candidateY++; } //prettier-ignore
            if (candidateY == 16) continue generation;
          }
          if (!checkedCells.filter(Utility.getUnique).includes(virusColor)) break;
          virusColor = virusColor > 13 ? 11 : virusColor + 1;
        } while (true);
        this.board[index] = virusColor;
        viruses--;
      } while (viruses > 0);
    };
    // getters and setters
    // Get speed
    this.getSpeed = () => {
      return Data.FramesPerRow[_speedLvl] * Data.FRAME_MULTIPLIER;
    };
    this.setSpeedLevel = (speedLvl) => (_speedLvl = _referenceSpeedLvl = speedLvl);
    this.getSpeedLevel = () => {
      return {
        name:
          _referenceSpeedLvl == Data.SpeedLevel.LOW
            ? "LOW"
            : _referenceSpeedLvl == Data.SpeedLevel.MED
            ? "MED"
            : "HI",
        level: _speedLvl,
      };
    };
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
      return this.pill.rotation == 0 || this.pill.rotation == 180 ? "horizontal" : "vertical";
    };

    this.logThis = function () {
      console.log(this);
    };

    // Functions called in constructor
    this.generatePills(); // Generating pills after initializing array
  }
}

// All data and structures, shared in other scripts; equivalent of enumerators
let Data = {
  // All possible field status, empty, 3x color and 3x viruses
  Field: { empty: 0, red: 1, yellow: 2, blue: 3, virus_r: 11, virus_y: 12, virus_b: 13 },
  State: { movement: 0, clear: 1, gravity: 2, shifting: 3 }, // Game state, for performance optimization in the main loop
  PlayerMode: { single: 1, multi: 2 }, // Possible game modes, based on original game
  EmulationMode: { ATARI: 0, NES: 1, GB: 2, GBC: 3 }, // Emulation mode. Some versions may have slightly different mechanics
  SpeedLevel: { LOW: 15, MED: 25, HI: 31 },
  // Tables needed for original game mechanics like setting speed or generating viruses
  MaximumRow: [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 11, 11, 12],
  VirusColor: [12, 11, 13, 13, 11, 12, 12, 11, 13, 13, 11, 12, 12, 11, 13, 11],
  FRAME_MULTIPLIER: 16.6667,
  // prettier-ignore
  FramesPerRow: [
    70, 68, 66, 64, 62, 60, 58, 56, 54, 52, 50, 48, 46, 44, 42, 40, 38, 
    36, 34, 32, 30, 28, 26, 24, 22, 20,	19, 18, 17, 16, 15, 14, 13, 12, 
    11, 10, 10, 9, 9, 8, 8, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5,
    5, 5, 5, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 ],
};
