"use strict";

// All data and structures, shared in other scripts; equivalent of enumerators
let Data = {
  // All possible field status, empty, 3x color and 3x viruses
  Field: { empty: 0, red: 1, yellow: 2, blue: 3, virus_r: 11, virus_y: 12, virus_b: 13 },
  State: { movement: 0, clear: 1, gravity: 2, shifting: 3, win: 4, lose: 5, menu: 6, animation: 7 }, // Game state, for performance optimization in the main loop
  PlayerMode: { single: 1, multi: 2 }, // Possible game modes, based on original game
  EmulationMode: { ATARI: 0, NES: 1, GB: 2, GBC: 3 }, // Emulation mode. Some versions may have slightly different mechanics
  Colors: ["rd", "yl", "bl"],
  ScreenSize: { ATARI: { w: 40, h: 24 }, NES: { w: 32, h: 30 }, GB: { w: 20, h: 18 } },
  ColorsNES: { bcg: ["#005200", "#3900A5", "#808080"] },
  ColorsATARI: { bcg: ["#621C73", "#008267", "#ffb68c", "#837e85", "#123eb2"] },
  // Sizes of windows showed in game
  // prettier-ignore
  WindowSize: { ATARI: { win: [18, 5, 12, 10], lose: [14, 5, 14, 11], pause: [14, 5, 14, 11] },
                NES: { win: [8, 16, 12, 4], lose: [8, 16, 12, 4], pause: [8, 16, 12, 4] },
                GB: { win: [8, 5, 2, 1], lose: [8, 5, 2, 1], pause: [8, 15, 2, 1] } }, // width, height, left, bottom
  // Css properties
  // prettier-ignore
  PropertyCSS: [], //! TODO
  // Tables needed for original game mechanics like setting speed or generating viruses
  SpeedLevel: { LOW: 15, MED: 25, HI: 31 },
  PillThrowFrames: [
    {
      l: [-13, -13, 0, -1, -1, -1, -1, -1, 0, -1, -1, 11, 12, 12, 12],
      r: [-13, -13, -13, -1, -1, 12, -1, -1, -13, -1, 12, 11, 12, 12, 12],
    },
    {
      l: [0, -24, -34, -12, -1, -1, -1, -1, 0, -1, -1, 11, 12, 12, 12],
      r: [-12, -12, -34, 0, -1, 12, -1, -1, -13, -1, 12, 11, 12, 12, 12],
    },
  ],
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
