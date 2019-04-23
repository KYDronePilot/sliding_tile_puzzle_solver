import Tile from "./Tile";

// Empty space move directions.
const Up = "up";
const Down = "down";
const Left = "left";
const Right = "right";
// All moves.
const Moves = [
    "up",
    "down",
    "left",
    "right"
];
// Opposite of each move direction.
const OppositeDirections = {
    "up": Down,
    "down": Up,
    "left": Right,
    "right": Left,
    "": ""
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
        this.blank_index = n ** 2 - 1;
        this.last_direction = "";
        this.n = n;
        this.solved_board = solved_board;
        // Set tiles if provided.
        if (tiles !== null)
            this.tiles = tiles;
        // Else, generate them.
        else {
            this.tiles = [];
            for (let i = 1; i < n ** 2; i++)
                this.tiles.push(new Tile(i));
            // Add on last blank tile.
            this.tiles.push(new Tile(-1));
        }
    }

    /**
     * Get a board-like representation of the board.
     * @return {string} Formatted, board-like representation of the board
     */
    toString() {
        let result = "";
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n - 1; j++) {
                result += this.tiles[i * this.n + j] + ", ";
            }
            result += this.tiles[(i + 1) * this.n - 1] + "\n";
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
            if (this.tiles[i] !== other.tiles[i])
                return false;
        }
        return true;
    }

    /**
     * Create a string hash based on the tiles.
     * @return {string} String containing the tiles of the board
     */
    hash() {
        let result = "";
        // Add each tile to the hash.
        for (let i = 0; i < this.tiles.length; i++)
            result += this.tiles[i].hash();
        return result;
    }

    /**
     * Shuffle the tiles using valid moves to ensure the puzzle is solvable.
     * @param n {number} - The number of random moves to make
     * @return {null}
     */
    shuffle(n) {
        for (let i = 0; i < n; i++) {
            // Update the blank index.
            this.updateBlankIndex();
            // Get all valid moves.
            let moves = this.getMoves();
            // Get a random move.
            let move = moves[Math.floor(Math.random() * moves.length)];
            // Perform that move.
            this.moveSpace(move);
        }
    }

    /**
     * Get the index to move to, given a position and direction
     * @param position {number} - Position of tile
     * @param direction {string} - Direction to move to
     */
    translate(position, direction) {
        if (direction === Up)
            return position - this.n;
        if (direction === Down)
            return position + this.n;
        if (direction === Left)
            return position - 1;
        if (direction === Right)
            return position + 1;
    }

    /**
     * Update index of the blank tile.
     * @return {null}
     */
    updateBlankIndex() {
        this.blank_index = -1;
        for (let i = 0; i < this.tiles.length; i++)
            if (this.tiles[i].symbol === -1)
                this.blank_index = i;
    }

    /**
     * Get the manhattan cost of the current board compared with the solved board.
     * @return {number} Manhattan cost of board
     */
    manhattanCost() {
        let cost = 0;
        // Check each tile.
        for (let i = 0; i < this.tiles.length; i++) {
            // Do not use blank tile.
            if (i === this.blank_index)
                continue;
            // Get index of tile in solved board.
            let solved_i = (() => {
                for (let j = 0; j < this.solved_board.tiles.length; j++) {
                    if (this.solved_board.tiles[j].equals(this.tiles[i]))
                        return j;
                }
                return -1;
            })();
            // Get distance for x-axis.
            cost += Math.abs((i % this.n) - (solved_i % this.n));
            // Get distance for y-axis.
            cost += Math.abs(Math.floor(i / this.n) - Math.floor(solved_i / this.n));
        }
        return cost;
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
     * @param move_direction {string} - The moving direction
     * @return {boolean} Whether or not the move is valid.
     */
    isValidMove(move_direction) {
        // Check if move would be back-stepping.
        if (OppositeDirections[move_direction] === this.last_direction)
            return false;
        // Check if up move would be out of bounds.
        if (move_direction === Up && this.blank_index - this.n < 0)
            return false;
        // Check if down move would be out of bounds.
        if (move_direction === Down && this.blank_index + this.n >= this.tiles.length)
            return false;
        // Check if left move would be out of bounds.
        if (move_direction === Left && this.blank_index % this.n === 0)
            return false;
        // Check if right move would be out of bounds.
        return !(move_direction === Right && (this.blank_index + 1) % this.n === 0);

    }

    /**
     * Get the available moves that can be made.
     * @return {Array} The available moves that can be made
     */
    getMoves() {
        let moves = [];
        for (let i = 0; i < Moves.length; i++)
            if (this.isValidMove(Moves[i]))
                moves.push(Moves[i]);
        return moves;
    }

    /**
     * Move the empty space in the specified direction.
     * @param moveDirection {string} - The direction in which to move the blank space
     * @return {null}
     */
    moveSpace(moveDirection) {
        // Get the index to swap with.
        let swap_i = -1;
        if (moveDirection === Up)
            swap_i = this.blank_index - this.n;
        if (moveDirection === Down)
            swap_i = this.blank_index + this.n;
        if (moveDirection === Left)
            swap_i = this.blank_index - 1;
        if (moveDirection === Right)
            swap_i = this.blank_index + 1;
        // Swap.
        let tmp = this.tiles[swap_i];
        this.tiles[swap_i] = this.tiles[this.blank_index];
        this.tiles[this.blank_index] = tmp;
        // Update last direction swapped.
        this.last_direction = moveDirection;
        this.blank_index = swap_i;
    }
}
