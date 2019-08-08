import {Tile} from "./Tile";

// Empty space move directions.
export const UP = "up";
export const DOWN = "down";
export const LEFT = "left";
export const RIGHT = "right";
// All moves.
export const MOVES = [
    UP,
    DOWN,
    LEFT,
    RIGHT
];
// Opposite of each move direction.
export const OPPOSITE_DIRECTIONS = {
    [UP]: DOWN,
    [DOWN]: UP,
    [LEFT]: RIGHT,
    [RIGHT]: LEFT,
    "": ""
};
// Translate a board index from a move.
const TranslateIndex = {
    [UP]: (position, n) => position - n,
    [DOWN]: (position, n) => position + n,
    [LEFT]: (position, n) => position - 1,
    [RIGHT]: (position, n) => position + 1,
};
// Actions when making a board move.
const MoveBlankTile = {
    [UP]: (blankIndex, n) => blankIndex - n,
    [DOWN]: (blankIndex, n) => blankIndex + n,
    [LEFT]: (blankIndex, n) => blankIndex - 1,
    [RIGHT]: (blankIndex, n) => blankIndex + 1,
    "": -1
};


/**
 * The layout of the game board.
 * @author - Michael Galliers
 */
export default class Board {
    /**
     * Create a new board with optional tiles.
     * @param n {number} - The dimensions of the board
     * @param solved_board {Board} - The solved version of the board
     * @param tiles - A pre-made list of tiles
     */
    constructor(n, solved_board = null, tiles = null) {
        this.n = n;
        this.n2 = n ** 2;
        this.last_direction = "";
        this.solved_board = solved_board;
        // Set tiles if provided.
        if (tiles !== null)
            this.tiles = tiles;
        // Else, generate them.
        else
            this.tiles = Tile.generateTiles(n);
        this.blankIndex = this.getBlankIndex();
    }

    /**
     * Check if two tiles are in linear conflict.
     * Indices are 0-indexed and relative to the row/column they are in.
     * @private
     * @param tile_1 {number} - Index of first tile
     * @param tile_2 {number} - Index of second tile
     * @param tile_1_goal {number} - Goal index of first tile
     * @param tile_2_goal {number} - Goal index of second tile
     * @return {boolean} Whether they are in linear conflict
     */
    static _inConflict(tile_1, tile_2, tile_1_goal, tile_2_goal) {
        return (tile_1 < tile_2 && tile_1_goal > tile_2_goal) || (tile_1 > tile_2 && tile_1_goal < tile_2_goal);
    }

    /**
     * Shortcut for indexing the board tiles like a 2-dim list.
     * @param row {number} - Row index
     * @param col {number} - Column index
     * @param board {Board} - The board to index (default: this)
     * @return {Tile} - Tile at index specified
     */
    index(row, col, board = null) {
        if (board === null)
            board = this;
        return board.tiles[row * this.n + col];
    }

    /**
     * Get a board-like representation of the board.
     * @return {string} Formatted, board-like representation of the board
     */
    toString() {
        let result = "";
        for (let row = 0; row < this.n; row++) {
            for (let col = 0; col < this.n - 1; col++)
                result += this.index(row, col) + ", ";
            result += this.index(row, this.n - 1) + "\n";
        }
        return result;
    }

    /**
     * Check whether two boards are the same element-wise.
     * @param other {Board} - The other board
     * @return {boolean} Whether or not the two boards are equal
     */
    equals(other) {
        // Verify number of tiles are the same.
        if (this.tiles.length !== other.tiles.length)
            return false;
        // Check each tile.
        for (let i = 0; i < this.tiles.length; i++) {
            if (!this.tiles[i].equals(other.tiles[i]))
                return false;
        }
        return true;
    }

    /**
     * Create a string hash based on the tiles.
     * @return {string} String containing the tiles of the board
     */
    hash() {
        return this.tiles.map(tile => tile.hash()).join("")
    }

    /**
     * Get the index of the blank tile.
     * @return {number} Index of blank tile
     */
    getBlankIndex() {
        for (let [i, tile] of this.tiles.entries())
            if (tile.isBlank())
                return i;
        return -1;
    }

    /**
     * Shuffle the tiles using valid moves to ensure the puzzle is solvable.
     * @param n {number} - The number of random moves to make
     * @return {null}
     */
    shuffle(n) {
        for (let i = 0; i < n; i++) {
            // Update the blank index
            this.blankIndex = this.getBlankIndex();
            // Get all valid moves.
            let moves = this.getMoves();
            // Get a random move.
            let move = moves[Math.floor(Math.random() * moves.length)];
            // Perform that move.
            this.moveBlankTile(move);
        }
        // Update the blank index
        this.blankIndex = this.getBlankIndex();
    }

    /**
     * Get the index to move to, given a position and direction
     * @param position {number} - Position of tile
     * @param direction {string} - Direction to move to
     */
    translate(position, direction) {
        return TranslateIndex[direction](position, this.n);
    }

    /**
     * Get the manhattan cost of the current board compared with the solved board.
     * @return {number} Manhattan cost of board
     */
    manhattanCost() {
        let cost = 0;
        // Check each tile.
        for (let i = 0; i < this.n2; i++) {
            // Do not use blank tile.
            if (i === this.blankIndex)
                continue;
            // Get index of tile in solved board.
            let solved_i = -1;
            for (let j = 0; j < this.n2; j++)
                if (this.solved_board.tiles[j].equals(this.tiles[i])) {
                    solved_i = j;
                    break;
                }
            // Get distance for x-axis.
            cost += Math.abs((i % this.n) - (solved_i % this.n));
            // Get distance for y-axis.
            cost += Math.abs(Math.floor(i / this.n) - Math.floor(solved_i / this.n));
        }
        return cost;
    }

    /**
     * Cost/heuristic function for board.
     * @return {number} - Cost for board
     */
    getCost() {
        return this.manhattanCost() + this._linearConflicts();
    }

    /**
     * Calculate the number of linear conflicts in the board.
     * @protected
     * @return {number} Linear conflicts in board
     */
    _linearConflicts() {
        // Create tile, index maps
        let solvedRowMap = this._createTileRowIndicesMap(this.solved_board);
        let solvedColMap = this._createTileColumnIndicesMap(this.solved_board);
        let unsolvedRowMap = this._createTileRowIndicesMap(this);
        let unsolvedColMap = this._createTileColumnIndicesMap(this);
        // Already conflicting tiles
        let conflictingTiles = {};
        let total = 0;
        // Get row conflicts
        for (let i = 0; i < this.n; i++)
            total += this._findRowConflicts(
                i,
                conflictingTiles,
                solvedRowMap,
                solvedColMap,
                unsolvedRowMap,
                unsolvedColMap
            );
        // Get column conflicts
        for (let i = 0; i < this.n; i++)
            total += this._findColumnConflicts(
                i,
                conflictingTiles,
                solvedRowMap,
                solvedColMap,
                unsolvedRowMap,
                unsolvedColMap
            );
        return total;
    }

    /**
     * Find the number of linear conflicts in a row.
     * @private
     * @param row {number} - Index of the row
     * @param conflictingTiles {Object} - Already conflicting tiles
     * @param solvedRowMap {Object} - Solved board map from tile to relative row index
     * @param solvedColMap {Object} - Solved board map from tile to relative column index
     * @param unsolvedRowMap {Object} - Unsolved board map from tile to relative row index
     * @param unsolvedColMap {Object} - Unsolved board map from tile to relative column index
     * @return {number} Conflicts in row
     */
    _findRowConflicts(row, conflictingTiles, solvedRowMap, solvedColMap, unsolvedRowMap, unsolvedColMap) {
        let total = 0;
        // Go through each pair of tiles in the row
        for (let i = 0; i < this.n - 1; i++) {
            // Skip blank tile
            if (this.index(row, i).isBlank())
                continue;
            for (let j = i + 1; j < this.n; j++) {
                // Ensure present and goal positions are in the same row
                if (solvedColMap[this.index(row, i)] !== unsolvedColMap[this.index(row, i)]
                    || solvedColMap[this.index(row, j)] !== unsolvedColMap[this.index(row, j)])
                    continue;
                // Skip if already conflicting
                if (this.index(row, i) in conflictingTiles || this.index(row, j) in conflictingTiles)
                    continue;
                // Skip blank jth tile
                if (this.index(row, j).isBlank())
                    continue;
                // Check if conflicting
                if (
                    Board._inConflict(
                        unsolvedRowMap[this.index(row, i)],
                        unsolvedRowMap[this.index(row, j)],
                        solvedRowMap[this.index(row, i)],
                        solvedRowMap[this.index(row, j)]
                    )) {
                    total += 2;
                    conflictingTiles[this.index(row, i)] = null;
                    conflictingTiles[this.index(row, j)] = null;
                }
            }
        }
        return total;
    }

    /**
     * Find the number of linear conflicts in a column.
     * @private
     * @param col {number} - Index of the column
     * @param conflictingTiles {Object} - Already conflicting tiles
     * @param solvedRowMap {Object} - Solved board map from tile to relative row index
     * @param solvedColMap {Object} - Solved board map from tile to relative column index
     * @param unsolvedRowMap {Object} - Unsolved board map from tile to relative row index
     * @param unsolvedColMap {Object} - Unsolved board map from tile to relative column index
     * @return {number} Conflicts in column
     */
    _findColumnConflicts(col, conflictingTiles, solvedRowMap, solvedColMap, unsolvedRowMap, unsolvedColMap) {
        let total = 0;
        // Go through each pair of tiles in the column
        for (let i = 0; i < this.n - 1; i++) {
            // Skip blank tile
            if (this.index(i, col).isBlank())
                continue;
            for (let j = i + 1; j < this.n; j++) {
                // Ensure present and goal positions are in the same column
                if (solvedRowMap[this.index(i, col)] !== unsolvedRowMap[this.index(i, col)]
                    || solvedRowMap[this.index(j, col)] !== unsolvedRowMap[this.index(j, col)])
                    continue;
                // Skip if already conflicting
                if (this.index(i, col) in conflictingTiles || this.index(j, col) in conflictingTiles)
                    continue;
                // Skip blank jth tile
                if (this.index(j, col).isBlank())
                    continue;
                // Check if conflicting
                if (
                    Board._inConflict(
                        unsolvedColMap[this.index(i, col)],
                        unsolvedColMap[this.index(j, col)],
                        solvedColMap[this.index(i, col)],
                        solvedColMap[this.index(j, col)]
                    )) {
                    total += 2;
                    conflictingTiles[this.index(i, col)] = null;
                    conflictingTiles[this.index(j, col)] = null;
                }
            }
        }
        return total;
    }

    /**
     * Create a map of tiles to their relative row indices.
     * @private
     * @param board {Board} - The board to use
     * @return {Object} Map from tile to relative row index
     */
    _createTileRowIndicesMap(board) {
        let rowMap = {};
        for (let row = 0; row < this.n; row++)
            for (let col = 0; col < this.n; col++)
                rowMap[this.index(row, col, board)] = col;
        return rowMap;
    }

    /**
     * Create a map of tiles to their relative column indices.
     * @private
     * @param board {Board} - The board to use
     * @return {Object} Map from tile to relative column index
     */
    _createTileColumnIndicesMap(board) {
        let colMap = {};
        for (let col = 0; col < this.n; col++)
            for (let row = 0; row < this.n; row++)
                colMap[this.index(row, col, board)] = row;
        return colMap;
    }

    /**
     * Check if the board is solved.
     * @return {boolean} Whether the board is solved
     */
    isSolved() {
        return this.manhattanCost() === 0;
    }

    /**
     * Check if a move is valid.
     * @param move_direction {string} - The move direction
     * @return {boolean} Whether or not the move is valid.
     */
    isValidMove(move_direction) {
        // Check if move would be back-stepping.
        if (OPPOSITE_DIRECTIONS[move_direction] === this.last_direction)
            return false;
        // Check if up move would be out of bounds.
        if (move_direction === UP && this.blankIndex - this.n < 0)
            return false;
        // Check if down move would be out of bounds.
        if (move_direction === DOWN && this.blankIndex + this.n >= this.tiles.length)
            return false;
        // Check if left move would be out of bounds.
        if (move_direction === LEFT && this.blankIndex % this.n === 0)
            return false;
        // Check if right move would be out of bounds.
        return !(move_direction === RIGHT && (this.blankIndex + 1) % this.n === 0);

    }

    /**
     * Get the available moves that can be made.
     * @return {Array} The available moves that can be made
     */
    getMoves() {
        return MOVES.filter(move => {
            return this.isValidMove(move);
        });
    }

    /**
     * Move the empty space in the specified direction.
     * @param moveDirection {string} - The direction in which to move the blank space
     * @return {null}
     */
    moveBlankTile(moveDirection) {
        // Get the index to swap with.
        let swap_i = MoveBlankTile[moveDirection](this.blankIndex, this.n);
        // Swap.
        [this.tiles[swap_i], this.tiles[this.blankIndex]] = [this.tiles[this.blankIndex], this.tiles[swap_i]];
        // Update last direction swapped and blank index.
        this.last_direction = moveDirection;
        this.blankIndex = swap_i;
    }
}
