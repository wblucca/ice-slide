var G = (function () {
    // Constants

    // The cell types and their properties
    const CELLTYPE = {
        EMPTY: {
            SOLID: false,
            SLIPPERY: false,
            COLOR: "white",
        },
        ICE: {
            SOLID: false,
            SLIPPERY: true,
            COLOR: "lightblue",
        },
        WALL: {
            SOLID: true,
            COLOR: "black",
        },
        GOAL: {
            SOLID: false,
            SLIPPERY: false,
            COLOR: "green",
        },
    };

    const OBJECTTYPE = {
        BLOCK: {
            COLOR: "red",
        },
        PLAYER: {
            COLOR: "blue",
        }
    };

    // Private variables

    // The board is a 2D array of cell types
    let board;

    // The game objects are stored in a dictionary of arrays
    let gameObjects = {
        BLOCK: [],
        PLAYER: [],
    };

    // Drawing variables
    let canvas;
    let ctx;
    let cellwidthpx;
    let cellheightpx;

    // Private functions/
    /**
     * Get a random list of cells in the given board.
     * @param {array} board - The board to get the cells from.
     * @returns {array} A list of objects containing the x and y coordinates of the cells.
     */
    const randomCells = function (board) {
        // Get an ordered list of cells
        const cells = [];
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                cells.push({ x: x, y: y });
            }
        }

        // Shuffle the cells
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[j]] = [cells[j], cells[i]];
        }

        return cells;
    };

    /**
     * Set the types of the cells in the board.
     * @param {array} cells - List of objects containing the type and count of each to add.
     * @param {number} cells[].type - The properties of the type to add (e.g. CELLTYPE.WALL).
     * @param {number} cells[].count - The number of cells to add.
     */
    const setCellsInBoard = function (counts) {
        // Get a randomly ordered list of cells
        const cells = randomCells(board);

        // Set the cells' types based on the counts
        let i = 0;
        for (let c = 0; c < counts.length; c++) {
            // Get the type and count
            const type = counts[c].type;
            const count = counts[c].count;

            // Set the board's cells to the type
            for (let j = 0; j < count; j++) {
                board[cells[i].y][cells[i].x] = type;
                i++;
            }
        }
    };

    /**
     * Check if the given (x, y) coordinate is on the board or not.
     * @param {number} x - The x coordinate of the cell.
     * @param {number} y - The y coordinate of the cell.
     * @returns true if the coordinates are located in the bounds of the board, false otherwise.
     * 
     */
    const isOnBoard = function(x, y) {
        return x >= 0 && x < board[0].length && y >= 0 && y < board.length;
    };

    /**
     * Add objects to the game.
     * @param {array} objects - List of objects containing the type and count of each to add.
     * @param {number} objects[].type - The type of the object to add (e.g. "BLOCK").
     * @param {number} objects[].count - The number of objects to add.
     */
    const addObjects = function (counts) {
        // Get a randomly ordered list of cells
        const cells = randomCells(board);

        // Create the objects based on the counts
        let i = 0;
        for (let c = 0; c < counts.length; c++) {
            // Get the type and count
            const type = counts[c].type;
            const count = counts[c].count;

            // Create objects
            for (let j = 0; j < count; j++) {
                // Create the object
                const object = {
                    type: type,
                    x: cells[i].x,
                    y: cells[i].y,
                };
                gameObjects[type].push(object);
                i++;
            }
        }
    };

    /**
     * Update the position of an object.
     * @param {object} object - The object to update.
     * @param {number} x - The new x position.
     * @param {number} y - The new y position.
     * @returns {boolean} True if the object moved, false otherwise.
     */
    const updateObjectPosition = function (object, x, y) {
        // Check if the object moved
        if (object.x === x && object.y === y) {
            return false;
        }

        // Update the object's position
        object.x = x;
        object.y = y;

        // Return true to indicate the object moved
        return true;
    };

    /**
     * Gets the object at the specified location, if any.
     * @param {number} x - The x position of the cell.
     * @param {number} y - The y position of the cell.
     * @returns {object} The object at (x, y), or false if there is no object.
     */
    const getObject = function (x, y) {
        // Check each object in the game state to see if it is at the specified location
        for (const type in gameObjects) {
            for (const object of gameObjects[type]) {
                if (object.x === x && object.y === y) {
                    return object;
                }
            }
        }

        // No object was found
        return false;
    };

    /**
     * Slide an object in a direction. The object will slide until it hits a solid cell
     * non-slippery cell, solid object, or the edge of the board.
     * @param {object} object - The object to slide.
     * @param {number} dx - The x direction to slide the object.
     * @param {number} dy - The y direction to slide the object.
     * @returns {boolean} True if the object moved, false otherwise.
     */
    const slideObject = function (object, dx, dy) {
        // Get the object's current position
        const x = object.x;
        const y = object.y;

        // Get the object's new position
        let newX = x + dx;
        let newY = y + dy;

        // If trying to move off the board, return false
        if (!isOnBoard(newX, newY)) {
            return false;
        }

        // If the object is trying to move into another object, slide that object first
        const pushable = getObject(newX, newY);
        if (pushable) {
            slideObject(pushable, dx, dy);
        }

        // Slide the object until it hits a solid thing, crosses through a non-slippery
        // cell, or reaches the edge of the board
        while (isOnBoard(newX, newY)) {
            // Get the type of the cell the object is entering
            const newType = board[newY][newX];

            // Get the object at the new position, if any
            const collision = getObject(newX, newY);

            // Check if there is an object or solid cell at the new position
            if (collision || newType.SOLID || !isOnBoard(newX, newY)) {
                // Stop sliding
                break;
            }
            // Cell is neither slippery nor solid
            else if (newType.SLIPPERY) {
                // Slide to the next position and continue
                newX += dx;
                newY += dy;
            }
            // Cell is neither slippery nor solid
            else  {
                // Slide to the next position but do not continue
                newX += dx;
                newY += dy;
                break;
            }
        }

        // Step back lookahead movement, complete move, and return if the object moved at all
        return updateObjectPosition(object, newX - dx, newY - dy);
    };

    /**
     * Draw a square.
     * @param {number} x - The x position of the square.
     * @param {number} y - The y position of the square.
     * @param {string} color - The color of the square.
     */
    const drawSquare = function (x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(
            x * cellwidthpx,
            y * cellheightpx,
            cellwidthpx,
            cellheightpx
        );
    };

    /**
     * Draw an object.
     * @param {object} object - The object to draw.
     */
    const drawObject = function (object) {
        drawSquare(object.x, object.y, OBJECTTYPE[object.type].COLOR);
    };

    /**
     * Draw a cell.
     * @param {number} x - The x position of the cell.
     * @param {number} y - The y position of the cell.
     */
    const drawCell = function (x, y) {
        drawSquare(x, y, board[y][x].COLOR);
    };

    /**
     * Render the game.
     * @param {number} timestamp - The current timestamp.
     */
    const render = function (timestamp) {
        // Draw the board
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                // Draw the cell
                drawCell(x, y);
            }
        }

        // Draw all of the objects
        for (const type in gameObjects) {
            for (const object of gameObjects[type]) {
                drawObject(object);
            }
        }
    };

    /**
     * The main game loop.
     * @param {number} timestamp - The current timestamp.
     * @param {number} lastTimestamp - The timestamp of the last frame.
     */
    const update = function (timestamp, lastTimestamp) {
        // Calculate the time since the last frame
        const dt = lastTimestamp ? timestamp - lastTimestamp : 0;

        // Render the game
        render(timestamp);

        // Request the next frame and pass the current timestamp
        requestAnimationFrame((newTimestamp) => update(newTimestamp, timestamp));
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
            requestAnimationFrame(update);
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
            setCellsInBoard([
                { type: CELLTYPE.WALL, count: numWalls },
                { type: CELLTYPE.EMPTY, count: numEmpties },
                { type: CELLTYPE.GOAL, count: 1 },
            ]);
            
            // Add the player and goal
            addObjects([
                { type: "PLAYER", count: 1 },
                { type: "BLOCK", count: numBlocks },
            ]);
        },

        /**
         * Move the player.
         * @param {number} dx - The x direction to move the player.
         * @param {number} dy - The y direction to move the player.
         */
        movePlayer: function (dx, dy) {
            // Move the player(s) in the direction until they hit a wall
            gameObjects.PLAYER.forEach((player) => (slideObject(player, dx, dy)));
        }
    };

    return exports;
})();

// Start the game once the page has loaded
window.addEventListener("load", G.init);

// Add event listeners for player movement
window.addEventListener("keydown", function (e) {
    switch (e.key) {
        case "ArrowUp":
            G.movePlayer(0, -1);
            break;
        case "ArrowDown":
            G.movePlayer(0, 1);
            break;
        case "ArrowLeft":
            G.movePlayer(-1, 0);
            break;
        case "ArrowRight":
            G.movePlayer(1, 0);
            break;
    }
});
