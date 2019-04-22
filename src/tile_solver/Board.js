// import Tile from "./Tile";
// var assert = require("assert");
// var Tile = require("./Tile");

import Tile from "./Tile";
import assert from "assert";

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
    // Empty space move directions.
    static get Up() { return Up };
    static get Down() { return Down };
    static get Left() { return Left };
    static get Right() { return Right };
    // All moves.
    // static get Moves() { return Moves };
    // Opposite of each move direction.
    static get OppositeDirections() { return OppositeDirections };

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
        if (Board.OppositeDirections[move_direction] === this.last_direction)
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

if (!module.parent) {
    let tiles = [
        new Tile(1),
        new Tile(-1),
        new Tile(7),
        new Tile(5),
        new Tile(4),
        new Tile(6),
        new Tile(8),
        new Tile(2),
        new Tile(3),
    ];
    let solved_board = new Board(3);
    // console.log(solved_board);
    let board = new Board(3, solved_board, tiles);
    board.blank_index = 1;
    // console.log(board);
    // Test toString()
    assert.strictEqual(
        board.toString(),
        "Tile 1, Tile -1, Tile 7\n" +
        "Tile 5, Tile 4, Tile 6\n" +
        "Tile 8, Tile 2, Tile 3\n"
    );
    // Test equals() method.
    let board2 = new Board(3, solved_board, tiles);
    assert.strictEqual(board.equals(board2), true);
    assert.strictEqual(board.equals(new Board(3, solved_board)), false);
    // Test hash() method.
    assert.strictEqual(board.hash(), "1-17546823");
    // Test manhattanCost() method.
    assert.strictEqual(board.manhattanCost(), 11);
    // Test isSolved()
    assert.strictEqual(board.isSolved(), false);
    assert.strictEqual(new Board(3, solved_board).isSolved(), true);
    // Test isValidMove()
    assert.strictEqual(board.isValidMove(Board.Right), true);
    assert.strictEqual(board.isValidMove(Board.Left), true);
    assert.strictEqual(board.isValidMove(Board.Up), false);
    assert.strictEqual(board.isValidMove(Board.Down), true);
    // Test getMoves()
    let moves = board.getMoves();
    assert.strictEqual(moves[0], Down);
    assert.strictEqual(moves[1], Left);
    assert.strictEqual(moves[2], Right);
    // Test moveSpace()
    board.moveSpace(Down);
    assert.strictEqual(
        board.toString(),
        "Tile 1, Tile 4, Tile 7\n" +
        "Tile 5, Tile -1, Tile 6\n" +
        "Tile 8, Tile 2, Tile 3\n"
    )
}
