import Board from "./Board";


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
        let new_boards = [];
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
            new_boards.push(newNode);
        }
        return new_boards;
    }
}
