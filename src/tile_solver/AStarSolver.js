// var assert = require("assert");
// var Tile = require("./Tile");
// var Tile = require("./Tile");
// var BoardNode = require("./BoardNode");

// import assert from "assert";
import Board from "./Board";
import Tile from "./Tile";
import BoardNode from "./BoardNode"


/**
 * Main management class for solving the tile problem using the A* algorithm.
 * @author Michael Galliers
 */
export default class AStarSolver {

    /**
     * Constructs the solver.
     * @param board {BoardNode} - The board to be solved
     */
    constructor(board) {
        this.root = board;
        this.boardLeaves = [board];
        this.previousBoards = {};
    }

    /**
     * Get the next best solution path.
     * @return {BoardNode} Leaf on that solution path
     */
    getNextBestLeaf() {
        let min_obj = this.boardLeaves[0];
        // Find the minimum cost.
        for (let i = 1; i < this.boardLeaves.length; i++)
            if (this.boardLeaves[i].cost < min_obj.cost)
                min_obj = this.boardLeaves[i];
        return min_obj;
    }

    /**
     * Generate next moves for a leaf.
     * @param boardLeaf {BoardNode} - Tile node to generate moves from
     * @return {null}
     */
    generateNextMoves(boardLeaf) {
        // Get new decision leaves.
        let newLeaves = boardLeaf.getMoveLeaves(this.previousBoards);
        // Add these new leaves to previous boards that have been seen.
        for (let i = 0; i < newLeaves.length; i++)
            this.previousBoards[newLeaves[i].hash()] = newLeaves[i].hash();
        // Get index of board leaf.
        let board_i = (() => {
            for (let i = 0; i < this.boardLeaves.length; i++)
                if (this.boardLeaves[i].equals(boardLeaf))
                    return i;
            return -1;
        });
        // Remove the board leaf.
        this.boardLeaves.splice(board_i(), 1);
        // Add in the new leaves.
        this.boardLeaves.push(...newLeaves);
    }

    /**
     * Traverse up the tree to find the solution moves.
     * @param leaf {BoardNode} - The leaf node to traverse up
     * @return {Array} Directions that need to be moved
     */
    static getPathArray(leaf) {
        let solutionBoards = [leaf];
        // First, get the boards in the solution path.
        let walk = leaf;
        while (walk.parent_node !== null) {
            walk = walk.parent_node;
            solutionBoards.push(walk);
        }
        // Return moves in proper format.
        solutionBoards.reverse();
        return solutionBoards.splice(1).map(value =>
            value.last_direction
        );
    }

    /**
     * Format the path array to be readable.
     * @param path {Array} - The path to format
     * @return {string} The formatted path
     */
    static getPath(path) {
        return path.join(", ");
    }

    /**
     * Solve the board using A star search.
     * @return {BoardNode} The solved board node
     */
    solve() {
        // Continue until solved.
        while (true) {
            // Get the next best solution path.
            let nextBestLeaf = this.getNextBestLeaf();
            // DEBUG
            console.log(nextBestLeaf.manhattanCost());
            // Return solved leaf if solved.
            if (nextBestLeaf.isSolved())
                return nextBestLeaf;
            this.generateNextMoves(nextBestLeaf);
        }
    }
}
//
// if (!module.parent) {
//     var count = 0;
//     let tiles = [
//         new Tile(1),
//         new Tile(-1),
//         new Tile(7),
//         new Tile(5),
//         new Tile(4),
//         new Tile(6),
//         new Tile(8),
//         new Tile(2),
//         new Tile(3),
//     ];
//     let solved_board = new Board(3);
//     // console.log(solved_board);
//     let unsolvedBoard = new BoardNode(3, solved_board, 0, null, tiles);
//     unsolvedBoard.blank_index = 1;
//     let solver = new AStarSolver(unsolvedBoard);
//
//
//     // throw "";
//     let solvedLeaf = solver.solve();
//     console.log(AStarSolver.getPath(solvedLeaf));
//     console.log("Success!");
//     console.log(count);
// }