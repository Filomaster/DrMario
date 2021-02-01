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
  printBoard: (board) => {
    let _out = "";
    for (let i = 0; i < board.length; i++)
      _out += `${i != 0 && i % 8 == 0 ? "\n" : ""}${
        board[i] == 0 ? "·" : "#"
      } `;
    console.log(_out);
  },
};
