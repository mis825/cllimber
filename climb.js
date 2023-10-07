
// number constants
const WALL_HEIGHT = 9;
const WALL_WIDTH = 9;
const REACH_DISTANCE = 3;
const ROCKS_PER_LAYER = 3;
const DISPLAY_HEIGHT = 3;

// string constants
const EMPTY_SLOT_CHAR = "-";
const ROCKY_SLOT_CHAR = "o";
const FAR_ROCKY_SLOT_CHAR = "Ø";
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
    console.log(`${`${map.length - index}`.padStart(2, "  ")}   ${layer}`);
  });

  const array = [];
  for (let i = 1; i <= WALL_WIDTH; i++) {
    array.push(i);
  }
  console.log(`\n     ${array.join(EMPTY_SPACE)}`);
}

/**
 * @param {Array} map 2D ARRAY of MAP
 * @param {object} currPosition dir, row, col
 * @param {object} targetPosition dir, row col
 * @returns boolean
 */
function isValidMove(map, currPosition, targetPosition) {
  // zero moves
  if (!currPosition.length && targetPosition.row == map.length - 1) {
    return true;
  }

  const dx =
    currPosition.dir == L_HAND_ON_CHAR
      ? targetPosition.col - currPosition.col - 1
      : targetPosition.col - currPosition.col + 1;
  const dy = currPosition.row - targetPosition.row;

  if (currPosition.dir == L_HAND_ON_CHAR) {
    // moving right hand
    if (
      targetPosition.dir == R_HAND_ON_CHAR ||
      currPosition.altDir === L_HAND_ON_CHAR
    ) {
      if (dy == 0 && (dx == -2 || dx == -1 || dx == 1)) {
        return true;
      }
      if ((Math.abs(dy) == 1 || Math.abs(dy) == 2) && (dx == -1 || dx == 0)) {
        return true;
      }
    }
  } else if (currPosition.dir == R_HAND_ON_CHAR) {
    // moving left hand
    if (
      targetPosition.dir == L_HAND_ON_CHAR ||
      currPosition.altDir === R_HAND_ON_CHAR
    ) {
      if (dy == 0 && (dx == 2 || dx == -1 || dx == 1)) {
        return true;
      }
      if ((Math.abs(dy) == 1 || Math.abs(dy) == 2) && (dx == 1 || dx == 0)) {
        return true;
      }
    }
  }
  return false;
}

// swap hands
function swapHands(playerPosition) {
  return playerPosition == L_HAND_ON_CHAR ? R_HAND_ON_CHAR : L_HAND_ON_CHAR
}

/**
 * Update the map based on the user input
 * @param {Array} map The 2D array map
 * @param {String} input The move
 * @param {Array} playerPosition Last move
 */
function updateMap(map, input, playerPosition) {
  const noInput = (!input) // true when input is empty

  const options = input.split("");
  const dir = noInput ? swapHands(playerPosition.dir) : options[0];
  const row = noInput ? playerPosition.row : (map.length - parseInt(options[1])); // normalized for array indexing
  const col = noInput ? playerPosition.col : (parseInt(options[2]) - 1); // normalized for array indexing

  // User cannot grab EMPTY SLOTS
  if (map[row][col] != ROCKY_SLOT_CHAR) {
    return { currentRow: map.length - playerPosition.row, lastMove: playerPosition };
  } 

  // check if valid move before
  const targetPosition = { dir, row, col };
  if (!isValidMove(map, playerPosition, targetPosition)) {
    return { currentRow: map.length - playerPosition.row, lastMove: playerPosition };
  }
    
  playerPosition = { dir, row, col }; // store the valid move

  switch (dir) {
    case L_HAND_ON_CHAR: // moving left hand - L
      map[row][col] = dir;
      const isRightHandOn = map[row][col + 1] === ROCKY_SLOT_CHAR;
      map[row][col + 1] = isRightHandOn ? R_HAND_ON_CHAR : R_HAND_OFF_CHAR;
      playerPosition = {
        dir,
        row,
        col,
        altDir: isRightHandOn ? R_HAND_ON_CHAR : null,
      };
      break;
    case R_HAND_ON_CHAR: // moving right hand - R
      map[row][col] = dir;
      const isLeftHandOn = map[row][col - 1] === ROCKY_SLOT_CHAR;
      map[row][col - 1] = isLeftHandOn ? L_HAND_ON_CHAR : L_HAND_OFF_CHAR;
      playerPosition = {
        dir,
        row,
        col,
        altDir: isLeftHandOn ? L_HAND_ON_CHAR : null,
      };
      break;
    default:
      break;
  }

  return { currentRow: map.length - row, lastMove: playerPosition };
}

const map = generateMap();
let playerPosition = {};
let input = "";
displayMap(map, DISPLAY_HEIGHT);

while (input !== "Q") {
  const mapCopy = _.cloneDeep(map);
  input = prompt("Enter (L/R # #): ").toUpperCase();
  if (input === "Q") continue;
  const { currentRow, lastMove } = updateMap(mapCopy, input, playerPosition);
  playerPosition = lastMove;
  displayMap(mapCopy, currentRow ? currentRow + 2 : DISPLAY_HEIGHT);
}
