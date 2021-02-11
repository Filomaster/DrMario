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
    let _speedLvl = Data.SpeedLevel.LOW;
    let _virusLvl = 0;
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
      let _gameoverFlag = false;
      // if (DEBUG && _pillCounter % 10 != 0)
      //   console.log(10 - (_pillCounter % 10) + " pills to next speed lvl");
      if (_pillCounter % 10 == 0 && _pillCounter != 0) {
        if (_speedLvl < _referenceSpeedLvl + 50) {
          _speedLvl++;
          if (DEBUG) console.info(`SPEED UP! \n Current lvl: ${_speedLvl}`);
        }
      }
      if (this.board[3] != Data.Field.empty && this.board[4] != Data.Field.empty)
        _gameoverFlag = true;
      this.pill = { l: 3, r: 4, y: 0, rotation: 0 }; //TODO: Describe pill
      this.state = Data.State.movement;
      this.board[3] = _preGeneratedPills[_pillsIndex].l;
      this.board[4] = _preGeneratedPills[_pillsIndex].r;
      BOARD.childNodes[3].dataset.pair = _pillsIndex;
      BOARD.childNodes[4].dataset.pair = _pillsIndex;
      _pillsIndex = _pillsIndex >= 127 ? 0 : _pillsIndex + 1;
      _pillCounter++;
      this.isGrounded = false;
      if (_gameoverFlag) this.state = Data.State.lose;
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
      let loopCounter = 0;
      generation: do {
        let candidateY = 15 - Utility.getRandomInt(0, Data.MaximumRow[_virusLvl]);
        let candidateX = Utility.getRandomInt(0, 7);
        let remainder = (viruses - 1) % 4;
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
        // let index = candidateY * 8 + candidateX;
        while (this.board[candidateY * 8 + candidateX] != Data.Field.empty) {
          console.log(
            `Cell [${candidateY},${candidateX}] (${candidateY * 8 + candidateX}) is not empty`
          );
          console.log(this.board[candidateY * 8 + candidateX]);
          candidateX++;
          if (candidateX == 8) { candidateX = 0; candidateY++; } //prettier-ignore
          if (candidateY == 16) continue generation;
          // index = candidateY * 8 + candidateX;
        }
        colors: do {
          // Checking 2 cells away from candidate in all 4 directions
          let checkedCells = [
            this.board[candidateY * 8 + candidateX - 2],
            candidateY * 8 + candidateX < 125 ? this.board[candidateY * 8 + candidateX + 2] : null,
            this.board[candidateY * 8 + candidateX - 8],
            candidateY * 8 + candidateX < 119 ? this.board[candidateY * 8 + candidateX + 8] : null,
          ];
          if (!checkedCells.filter(Utility.getUnique).includes(virusColor)) {
            console.log("Color is good, braking from loop");
            break colors;
          }
          if (checkedCells.filter(Utility.getUnique).length == 3) {
            console.log(checkedCells);
            candidateX++;
            if (candidateX == 8) { candidateX = 0; candidateY++; } //prettier-ignore
            if (candidateY == 16) continue generation;
            continue colors;
            // index = candidateY * 8 + candidateX;
          }
          if (virusColor == Data.Field.virus_y) {
            virusColor = Data.Field.virus_b;
            console.log("Changed virus color to blue");
          } else if (virusColor == Data.Field.virus_r) {
            virusColor = Data.Field.virus_y;
            console.log("Changed virus color to yellow");
          } else if (virusColor == Data.Field.virus_b) {
            virusColor = Data.Field.virus_r;
            console.log("Changed virus color to red");
          }
          loopCounter++;
          if (loopCounter > 10) {
            this.setupBoard();
            return;
          }
        } while (true);
        this.board[candidateY * 8 + candidateX] = virusColor;
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
    this.getVirusLevel = () => _virusLvl;
    this.setVirusLevel = (lvl) => (_virusLvl = lvl);
    // > score
    this.getScore = () => _score;
    this.incrementScore = (viruses) => {
      let bonus =
        (viruses < 6 ? viruses : 6) *
        100 *
        (_referenceSpeedLvl == 15 ? 1 : _referenceSpeedLvl == 25 ? 2 : 3);
      _score += bonus;
      if (DEBUG && bonus > 0) console.info(`points: ${bonus}, score: ${_score}`);
    };

    // > interval
    this.getInterval = () => _interval;
    this.setInterval = (interval) => (_interval = interval);
    // > pill index
    this.getPillIndex = () => _pillsIndex;
    // > orientation
    this.getOrientation = function () {
      return this.pill.rotation == 0 || this.pill.rotation == 180 ? "horizontal" : "vertical";
    };
    this.getVirusCount = function () {
      return this.board.filter(Utility.getViruses).length;
    };
    // Functions called in constructor
    this.generatePills(); // Generating pills after initializing array
  }
}
