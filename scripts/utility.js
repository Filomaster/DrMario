"use strict";

// Debug variable, to hide all console logs etc
var DEBUG = true;

// Useful methods
let Utility = {
  // Method for generating random int. I've already used it in previous projects.
  getRandomInt: (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  // Method for getting only unique values from array
  getUnique: (value, index, self) => {
    return self.indexOf(value) === index && value !== null;
  },
  getViruses: (value) => value > 10,

  printBoard: (board) => {
    let _out = "";
    for (let i = 0; i < board.length; i++)
      _out += `${i != 0 && i % 8 == 0 ? "\n" : ""} ${i != 0 && board[i] < 10 ? " " : ""} ${
        board[i] == 0 ? "·" : board[i]
      } `;
    console.log(_out);
  },
};
