"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Player = function Player(x) {
  _classCallCheck(this, Player);

  this.x = x;
}; // All data and structures, shared in other scripts.


var Data = {
  // All possible field status, equivalent of enumerator
  FieldStates: {
    empty: 0,
    red: 1,
    yellow: 2,
    blue: 3
  }
};