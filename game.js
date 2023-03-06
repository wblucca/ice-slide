var G = (function () {
    // Constants
    const CELLTYPE = {
        EMPTY: 0,
        ICE: 1,
        WALL: 2,
        BLOCK: 3,
        GOAL: 4,
        PLAYER: 5,
    };

    // Private variables
    let board;
    let canvas;
    let ctx;
    let cellwidthpx;
    let cellheightpx;

    // Private functions/
    /**
     * Shuffle an array.
     * @param {array} array - The array to shuffle.
     * @see https://stackoverflow.com/a/12646864
     */
    const shuffle = function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    /**
     * Add cells to the board.
     * @param {array} counts - List of objects containing the type and count of cells to add.
     * @param {number} counts[].type - The type of cell to add (e.g. CELLTYPE.WALL).
     * @param {number} counts[].count - The number of cells to add.
     */
    const addToBoard = function (counts) {
        // Get a randomly ordered list of cells
        const cells = [];
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                cells.push({ x: x, y: y });
            }
        }
        shuffle(cells);

        // Set the cells' types based on the counts
        let i = 0;
        for (let c = 0; c < counts.length; c++) {
            // Get the type and count
            const type = counts[c].type;
            const count = counts[c].count;

            // Add the cells
            for (let j = 0; j < count; j++) {
                board[cells[i].y][cells[i].x] = type;
                i++;
            }
        }
    };

    /**
     * Draw a cell.
     * @param {number} x - The x coordinate of the cell.
     * @param {number} y - The y coordinate of the cell.
     * @param {string} color - The color of the cell.
     */
    const drawCell = function (x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(
            x * cellwidthpx,
            y * cellheightpx,
            cellwidthpx,
            cellheightpx
        );
    };

    /**
     * Render the game.
     * @param {number} timestamp - The current timestamp.
     */
    const render = function (timestamp) {
        // Render the board
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                // Get the cell
                const cell = board[y][x];

                // Get the cell's color
                let color;
                switch (cell) {
                    case CELLTYPE.EMPTY:
                        color = "white";
                        break;
                    case CELLTYPE.ICE:
                        color = "lightblue";
                        break;
                    case CELLTYPE.WALL:
                        color = "black";
                        break;
                    case CELLTYPE.BLOCK:
                        color = "red";
                        break;
                    case CELLTYPE.GOAL:
                        color = "green";
                        break;
                    case CELLTYPE.PLAYER:
                        color = "blue";
                        break;
                }

                // Draw the cell
                drawCell(x, y, color);
            }
        }

        // Request the next frame
        requestAnimationFrame(render);
    };

    const exports = {
        /**
         * Initialize the game with a new puzzle and start the render loop.
         */
        init: function () {
            // Get the canvas context
            canvas = document.getElementById("board");
            ctx = canvas.getContext("2d");

            // Setup a new puzzle with a 10x10 board, 10 walls, 5 blocks, and 6 empty cells
            G.createPuzzle(10, 10, 10, 5, 6);

            // Start the render loop
            requestAnimationFrame(render);
        },

        /**
         * Create a new puzzle.
         * @param {number} width - The width of the board in cells.
         * @param {number} height - The height of the board in cells.
         * @param {number} numWalls - The number of walls to add to the board.
         * @param {number} numBlocks - The number of blocks to add to the board.
         * @param {number} numEmpties - The number of empty cells to add to the board.
         */
        createPuzzle: function (
            width,
            height,
            numWalls,
            numBlocks,
            numEmpties
        ) {
            // Create a new board
            board = new Array(height);
            for (let y = 0; y < height; y++) {
                board[y] = new Array(width);
                for (let x = 0; x < width; x++) {
                    board[y][x] = CELLTYPE.ICE;
                }
            }

            // Get the cell width and height in pixels
            cellwidthpx = canvas.width / board[0].length;
            cellheightpx = canvas.height / board.length;

            // Add all cells to the board
            addToBoard([
                { type: CELLTYPE.WALL, count: numWalls },
                { type: CELLTYPE.BLOCK, count: numBlocks },
                { type: CELLTYPE.EMPTY, count: numEmpties },
                { type: CELLTYPE.PLAYER, count: 1 },
                { type: CELLTYPE.GOAL, count: 1 },
            ]);
        },
    };

    return exports;
})();

// Start the game once the page has loaded
window.addEventListener("load", G.init);
