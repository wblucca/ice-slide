/**
 * Initialize the game.
 * This function is called when the page is loaded.
 */
function initGame() {
    // Create the game board
    const board = initBoard(10, 10);

    // Add event listeners for user input
    initEventListeners(board);

    // Start render loop
    requestAnimationFrame(render(board));
}

/**
 * Initialize the game board.
 * Create a 2D array of cells, add walls, blocks, a goal, and the player.
 * @param {number} width - The width of the board in cells.
 * @param {number} height - The height of the board in cells.
 * @param {number} numWalls - The number of walls to add to the board.
 * @param {number} numBlocks - The number of blocks to add to the board.
 */
function initBoard(width, height, numWalls, numBlocks) {
    // Create a 2D array of cells
    const board = new Array(height);
    for (let y = 0; y < height; y++) {
        board[y] = new Array(width);
        for (let x = 0; x < width; x++) {
            board[y][x] = new Cell(x, y);
        }
    }

    // Add numWalls walls to the board
    addWalls(board, numWalls);

    // Add blocks
    addBlocks(board);

    // Add the goal
    addGoal(board);

    // Add the player
    addPlayer(board);

    return board;
}
