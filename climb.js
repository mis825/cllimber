/**
 * This is a climbing simulator game where the goal is to reach the top of the cliff.
 * The game consists of rounds where the player must choose a direction to move towards (L,M,R).
 * The player will receive in the terminal string representations of the climbing wall (up to 3 at time)
 * The player tries to move in the safest direction to maximize there chance of progressing.
 * Players will try to minimize the distance of their next grabbable hold (ex: 'o')
 * Ungrabbable holds appear as dashes (-).
 * The game has at least 10 levels before completion
 *
 * Example wall:
 * - - - - o - - - -
 * - - o - - - - - -
 * - o - - - - - - -
 * - - - - - - - - -
 * - o - - - - - - -
 * o - - - - - - - -
 * - - o - - - - - -
 * - o - - - - - - -
 * - o - - - - - - -
 *
 * If a player uses their right hand to grab a hold, then there left hand's default position is one slot to the left
 * A hand that contains a hold is represented in uppercase (ex: L)
 * A hand that does not contain a hold is seen in lowercase (ex: l)
 * Example:
 * Player grabs the hold with their right hand
 *  - o => l R
 *
 * The left hand can only grab holds less than or equal to 'REACH_DISTANCE' number of slots away
 *
 * Example of a valid reach (where REACH_DISTANCE == 4)
 * - o -       - L r
 * - - -  ==>  - - -
 * l R -       - o -
 *
 * The distance between R and L is sqrt(3^2 + 1^2)
 */

// number constants
const WALL_HEIGHT = 9;
const WALL_WIDTH = 9;
const REACH_DISTANCE = 3;
const ROCKS_PER_LAYER = 3;
const DISPLAY_HEIGHT = 3;

// string constants
const EMPTY_SLOT_CHAR = "-";
const ROCKY_SLOT_CHAR = "o";
const EMPTY_SPACE = "   ";
const L_HAND_ON_CHAR = "L";
const L_HAND_OFF_CHAR = "l";
const R_HAND_ON_CHAR = "R";
const R_HAND_OFF_CHAR = "r";

// dependencies
const prompt = require("prompt-sync")();
const _ = require("lodash");

function getEmptyLayer(width) {
  return new Array(width).fill(EMPTY_SLOT_CHAR, 0, width);
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

/**
 *
 * @param {Array} layer
 * @param {Number} rocksToAdd
 */
function fillLayer(layer, rocksToAdd) {
  let rocksInLayer = 0;
  let fullLayer = layer;
  while (rocksInLayer < rocksToAdd) {
    fullLayer[fullLayer.indexOf(EMPTY_SLOT_CHAR)] = ROCKY_SLOT_CHAR;
    rocksInLayer++;
  }
  return shuffle(fullLayer);
}

function clearConsole() {
  console.log(
    "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"
  );
}

function generateMap() {
  let map = [];
  for (let i = 0; i < WALL_HEIGHT; i++) {
    const layer = fillLayer(getEmptyLayer(WALL_WIDTH), ROCKS_PER_LAYER);
    map.push(layer);
  }
  return map;
}

/**
 *
 * @param {Number} displayHeight
 * How many layers to show from the bottom layer
 * @param {Array} map
 * The 2D array map
 */
function displayMap(map, displayHeight) {
  let partialMap = new Array(WALL_HEIGHT).fill("\n"); // Hide the map
  let layerIndex = map.length - 1; // Index of the first layer
  while (layerIndex >= map.length - _.clamp(displayHeight, 0, WALL_HEIGHT)) {
    partialMap[layerIndex] = map[layerIndex].join(EMPTY_SPACE);
    layerIndex--;
  }
  clearConsole();
  partialMap.forEach((layer, index) => {
    console.log(`${`${(map.length - index)}`.padStart(2, '  ')}   ${layer}`);
  });

  const array = [];
  for (let i = 1; i <= WALL_WIDTH; i++) {
    array.push(i);
  }
  console.log(`\n     ${array.join(EMPTY_SPACE)}`);
}

/**
 * TODO: Handle user input and game states
 * How to track user's hands on the wall?
 * Method of input? ex: L -> 1 -> 3
 *          1: - - o - - - - - -
 *          2: - - L - - - - - -
 * Show the next set of layers only when the user reaches the top-most visible layer
 * Should the game end automatically when no valid moves are available?
 *  OR, should we implement quick-time events for out of distance holds
 *          ex: ---*--()---- ❌
 *          ex: ------(*)--- ✅
 *
 * Should we allow players to swap hands for the same hold?
 *          1: - - - L - -
 *          2: - - - R - -
 *
 *
 */

/**
 * Update the map based on the user input
 * @param {Array} map The 2D array map
 * @param {String} input The move
 * @param {Array} playerPosition Last move
 */
function updateMap(map, input, playerPosition) {
  const options = input.split("");
  const dir = options[0];
  const row = map.length - parseInt(options[1]);
  const col = parseInt(options[2]) - 1;

  playerPosition = [dir, row, col];
  if (!playerPosition.length && row != map.length - 1) return; // User can only reach the first row
  if (map[row][col] != ROCKY_SLOT_CHAR) return; // User cannot grab EMPTY SLOTS

  switch (dir) {
    case L_HAND_ON_CHAR:
      map[row][col] = dir;
      map[row][col + 1] =
        map[row][col + 1] === ROCKY_SLOT_CHAR
          ? R_HAND_ON_CHAR
          : R_HAND_OFF_CHAR;
      break;
    case R_HAND_ON_CHAR:
      map[row][col] = dir;
      map[row][col - 1] =
        map[row][col - 1] === ROCKY_SLOT_CHAR
          ? L_HAND_ON_CHAR
          : L_HAND_OFF_CHAR;
      break;
    default:
      break;
  }

  return {currentRow: map.length - row, lastMove: playerPosition}
}

const map = generateMap();
let playerPosition = [];
let input = "";
displayMap(map, DISPLAY_HEIGHT);

while (input !== "Q") {
  const mapCopy = _.cloneDeep(map);
  input = prompt("Enter (L/R # #): ").toUpperCase();
  if (input === "Q") continue;
  const {currentRow, lastMove} = updateMap(mapCopy, input, playerPosition);
  displayMap(mapCopy, currentRow + 2)
}
