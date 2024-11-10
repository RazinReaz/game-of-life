
const CELL_LENGTH = 5;

const BOARD_WIDTH = 1000;
const BOARD_HEIGHT = 600;

const GRID_ROWS = BOARD_HEIGHT / CELL_LENGTH;
const GRID_COLUMNS = BOARD_WIDTH / CELL_LENGTH;

//To control how the game behaves
const minNeighbour = 2;
const maxNeighbour = 3;
const reproductionNeighbour = 3;


let MODE = {
  EDIT: 0,
  PLAY: 1,
}
var currentMode = MODE.EDIT;

let grid = [];
let g_machine_idx = -1;



function mousePressed() {
  if (mouseButton === CENTER) {
    if (currentMode === MODE.EDIT)
      currentMode = MODE.PLAY;
    else if (currentMode === MODE.PLAY)
      currentMode = MODE.EDIT;
  }
}

function keyPressed() {
  if ((key == 'r' || key == 'R')) {
    currentMode = MODE.EDIT;
    createNewGrid();
  }
  if (key == ' ') {
    if (currentMode === MODE.EDIT)
      currentMode = MODE.PLAY;
    else if (currentMode === MODE.PLAY)
      currentMode = MODE.EDIT;
  }
  if (key == 'm' || key == 'M') {
    currentMode = MODE.EDIT;
    g_machine_idx = (g_machine_idx + 1) % machines.length;
    console.log("Drawing machine: " + machines[g_machine_idx].name);
    drawMachine(g_machine_idx);
  }
}

//Show current mode on top
function showStateText() {
  let state;
  if (currentMode == MODE.EDIT)
    state = "EDIT MODE (left click to draw, right click to delete)";
  else if (currentMode == MODE.PLAY)
    state = "PLAY MODE";
  push();
    noStroke();
    fill(201);
    textAlign(CENTER, TOP);
    textFont('Product Sans');
    textSize(14);
    text(state, width / 2, 10);
    textSize(12);
    
    text("Press M to switch machines", width / 2, 30);
    text("Press R to reset the grid", width / 2, 50);
    text("Press SPACE to switch modes", width / 2, 70);
  pop();
}

//Draws the lines of the cells. Useful for debug purposes
function drawCells() {
  strokeWeight(1);
  stroke(234);
  for (let x = 0; x <= BOARD_WIDTH; x += CELL_LENGTH)
    line(x, 0, x, BOARD_HEIGHT);
  for (let y = 0; y <= BOARD_HEIGHT; y += CELL_LENGTH)
    line(0, y, BOARD_WIDTH, y);
}



//fill a 2D array with 0
function initialize2DArray(arr, rows, cols) {
  for (let row = 0; row < rows; row++) {
    arr.push(new Array(cols).fill(0));
  }
}

//Creates a fresh grid with all dead cells
function createNewGrid() {
  grid = [];
  initialize2DArray(grid, GRID_ROWS, GRID_COLUMNS);
}

function drawMachine(machine_index) {
  createNewGrid();
  let machine = machines[machine_index];
  let design = machine.design;
  let x = floor((GRID_COLUMNS - machine.width) / 2);
  let y = floor((GRID_ROWS - machine.height) / 2);
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (design[i][j] === 'O') {
        let cell_x = x + j;
        let cell_y = y + i;
        aliven(grid, cell_y, cell_x);
      }
    }
  }   
}

//One line functions

let isAlive = (cell) => cell === 1;
let drawAliveCell = (i, j) => rect(j * CELL_LENGTH, i * CELL_LENGTH, CELL_LENGTH);
let getRow = (mouse_Y) => floor(mouse_Y / CELL_LENGTH);
let getCol = (mouse_X) => floor(mouse_X / CELL_LENGTH);
let aliven = (grid, i, j) => grid[i][j] = 1;
let deaden = (grid, i, j) => grid[i][j] = 0;
let within = (x, xmin, xmax) => x >= xmin && x <= xmax;

//Looks at the grid array and draws on the canvas accordingly
function drawGrid() {
  for (let i = 0; i < GRID_ROWS; i++) {
    for (let j = 0; j < GRID_COLUMNS; j++) {
      if (isAlive(grid[i][j])) {
        drawAliveCell(i, j);
      }
    }
  }
}

function editModeMouseInteractions() {
  if (mouseIsPressed) {
    if (mouseButton === LEFT && within(mouseX, 0, BOARD_WIDTH) && within(mouseY, 0, BOARD_HEIGHT)) {
      aliven(grid, getRow(mouseY), getCol(mouseX));
    }
    if (mouseButton === RIGHT && within(mouseX, 0, BOARD_WIDTH) && within(mouseY, 0, BOARD_HEIGHT)) {
      deaden(grid, getRow(mouseY), getCol(mouseX));
    }
  }
}

function playModeInterations() {
  updateGrid();
}

//Function to update the grid in each frame.
function updateGrid() {
  let next = [];
  initialize2DArray(next, GRID_ROWS, GRID_COLUMNS);

  for (let i = 0; i < GRID_ROWS; i++) {
    for (let j = 0; j < GRID_COLUMNS; j++) {
      //count the number of alive neighbours of current grid
      let neighbourCount = countAliveNeighbours(grid, i, j);
      if (isAlive(grid[i][j]) && (neighbourCount < minNeighbour || neighbourCount > maxNeighbour)) {
        deaden(next, i, j);
      }
      else if (!isAlive(grid, i, j) && neighbourCount == reproductionNeighbour) {
        aliven(next, i, j);
      }
      else {
        next[i][j] = grid[i][j];
      }
    }
  }
  grid = next;
}

//returns the number of alive neighbours of grid[i][j]
function countAliveNeighbours(grid, y, x) {
  let neighbourCount = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      let nx = (x + j + GRID_COLUMNS) % GRID_COLUMNS;
      let ny = (y + i + GRID_ROWS) % GRID_ROWS;
      neighbourCount += grid[ny][nx];
    }
  }
  //subtract the original cell to keep only the neighbour count
  neighbourCount -= grid[y][x];
  return neighbourCount;
}

//TODO
//two 2d arrays
//optimize update grid
//text instructions 
//limit frame rate?

function setup() {
  createCanvas(BOARD_WIDTH, BOARD_HEIGHT);
  createNewGrid();
}

function draw() {
  background(51);
  //drawCells();
  drawGrid();
  
  frameRate(30);
  //currentmode will change in keypressed function (When M is pressed)
  if (currentMode == MODE.EDIT) {
    editModeMouseInteractions();
  }
  if (currentMode == MODE.PLAY) {
    playModeInterations();
  }
  showStateText();
}