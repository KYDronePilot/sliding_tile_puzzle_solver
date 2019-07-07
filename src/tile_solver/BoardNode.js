import Board from "./Board";


/**
 * The current state of a board as a tree node.
 * @author Michael Galliers
 */
export default class BoardNode extends Board {
    static previousBoards = {};

    /**
     * Constructs a new board node.
     * @param n {number} - The number of rows and columns in the board
     * @param solved_board {Board} - The solved version of the board
     * @param depth {number} - The depth of the board node in the path tree
     * @param parent {BoardNode} - The parent board node
     * @param tiles {Array} - The tiles in this board
     */
    constructor(n, solved_board, depth, parent, tiles = null) {
        super(n, solved_board, tiles);
        this.depth = depth;
        this.parent_node = parent;
        this.cost = this.getCost();
    }

    /**
     * Create the root game board node.
     * @param n {number} - Size of board
     * @param shuffleN {number} - Number of times to shuffle the board
     * @return {BoardNode} - New game board
     */
    static createGameBoard(n, shuffleN) {
        // Create solved and unsolved boards
        let solvedBoard = new Board(n);
        let unsolvedBoard = new BoardNode(n, solvedBoard, 0, null);
        // Shuffle tiles
        unsolvedBoard.shuffle(shuffleN);
        return unsolvedBoard;
    }

    /**
     * Copy this object.
     * @return {BoardNode} Copied object
     */
    copy() {
        let newBoardNode = new BoardNode(
            this.n,
            this.solved_board,
            this.depth,
            this.parent_node,
            this.tiles.map(tile => tile.copy())
        );
        newBoardNode.last_direction = this.last_direction;
        newBoardNode.blankIndex = this.blankIndex;
        return newBoardNode;
    }

    /**
     * Reset the previous boards object.
     * @static
     */
    static resetPreviousBoards() {
        BoardNode.previousBoards = {};
    }

    /**
     * Find if board node has already been encountered
     * @return {boolean} - Whether or not this board node has been seen before
     */
    previouslyEncountered() {
        return this.hash() in BoardNode.previousBoards;
    }

    /**
     * Add board node to previously encountered.
     */
    addToPreviouslyEncountered() {
        BoardNode.previousBoards[this.hash()] = null;
    }

    /**
     * Cost/heuristic function for board node.
     * @return {number} - Cost for the board node
     */
    getCost() {
        return this.manhattanCost() + this._linearConflicts() + this.depth;
    }

    /**
     * Get new board leaves from making every possible move.
     * @return {Array} The new board leaves
     */
    getMoveLeaves() {
        let newBoards = [];
        let moves = this.getMoves();
        for (let move of moves) {
            // New board for this move.
            let newBoard = this.copy();
            // Make move.
            newBoard.moveBlankTile(move);
            // If resulting board has been seen before, skip it.
            if (newBoard.previouslyEncountered())
                continue;
            // Setup board
            newBoard.parent_node = this;
            newBoard.depth = this.depth + 1;
            newBoard.cost = newBoard.getCost();
            // Add to resulting boards.
            newBoards.push(newBoard);
            // Add to previously seen boards.
            newBoard.addToPreviouslyEncountered();
        }
        return newBoards;
    }
}
