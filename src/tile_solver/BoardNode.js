import Board from "./Board";
import Tile from "./Tile"
import assert from "assert";

// var assert = require("assert");
// var Tile = require("./Tile");
// var Tile = require("./Tile");


/**
 * The current state of a board as a tree node.
 * @author Michael Galliers
 */
export default class BoardNode extends Board {

    /**
     * Constructs a new board node.
     * @param n {number} - The dimensions of the board
     * @param solved_board {Board} - The solved version of the board
     * @param depth {number} - The depth of the board node in the path tree
     * @param parent {BoardNode} - The parent board node
     * @param tiles {Array} - The tiles in this board
     */
    constructor(n, solved_board, depth, parent, tiles = null) {
        super(n, solved_board, tiles);
        this.new_boards = [];
        this.depth = depth;
        this.cost = -1;
        this.parent_node = parent;
    }

    /**
     * Copy this object.
     * @return {BoardNode} Copied object
     */
    copy() {
        let tileCopies = [];
        for (let i = 0; i < this.tiles.length; i++)
            tileCopies.push(this.tiles[i].copy());
        let newBoardNode = new BoardNode(this.n, this.solved_board, this.depth + 1, this.parent_node, tileCopies);
        newBoardNode.last_direction = this.last_direction;
        newBoardNode.blank_index = this.blank_index;
        return newBoardNode;
    }

    /**
     * Calculates the cost for this path.
     * @return null
     */
    calculateCost() {
        this.cost = this.manhattanCost() + this.depth;
    }

    /**
     * Get new board leaves from making each possible move.
     * @param previousBoards {Object} - Previous boards that have been seen
     * @return {Array} The new board leaves
     */
    getMoveLeaves(previousBoards) {
        this.new_boards = [];
        let moves = this.getMoves();
        for (let i = 0; i < moves.length; i++) {
            // New node for this move.
            let newNode = this.copy();
            // Make move.
            newNode.moveSpace(moves[i]);
            // If resulting board has been seen before, skip it.
            if (newNode.hash() in previousBoards)
                continue;
            // Set parent reference.
            newNode.parent_node = this;
            // Calculate the cost.
            newNode.calculateCost();
            // Add to resulting boards.
            this.new_boards.push(newNode);
        }
        return this.new_boards;
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
    let unsolvedBoard = new BoardNode(3, solved_board, 0, null, tiles);
    unsolvedBoard.blank_index = 1;
    // Test copy()
    let boardNodeCopy = unsolvedBoard.copy();
    assert.notStrictEqual(unsolvedBoard, boardNodeCopy);
    // Test calculateCost()
    unsolvedBoard.calculateCost();
    assert.strictEqual(unsolvedBoard.cost, 11);
    let boards = unsolvedBoard.getMoveLeaves({});
    for (let i = 0; i < boards.length; i++)
        console.log(boards[i].toString());
    // console.log(unsolvedBoard.getMoveLeaves({}))
}
