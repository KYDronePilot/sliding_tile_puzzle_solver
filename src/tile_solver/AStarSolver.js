import PriorityQueue from "js-priority-queue";


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
        this.boardLeaves = new PriorityQueue({
            comparator: (a, b) => {
                return a.cost - b.cost
            }
        });
        this.boardLeaves.queue(board);
        this.previousBoards = {};
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
     * Generate next moves for a leaf.
     * @param boardLeaf {BoardNode} - Tile node to generate moves from
     * @return {null}
     */
    generateNextMoves(boardLeaf) {
        // Get new decision leaves.
        let newLeaves = boardLeaf.getMoveLeaves(this.previousBoards);
        // Add these new leaves to previous boards that have been seen.
        for (let i = 0; i < newLeaves.length; i++) {
            this.previousBoards[newLeaves[i].hash()] = newLeaves[i].hash();
            // Add in the new leaves.
            this.boardLeaves.queue(newLeaves[i]);
        }
    }

    /**
     * Solve the board using A star search.
     * @return {BoardNode} The solved board node
     */
    solve() {
        // Continue until solved.
        while (true) {
            // Get the next best solution path.
            let nextBestLeaf = this.boardLeaves.dequeue();
            // let nextBestLeaf = this.getNextBestLeaf();
            // DEBUG
            console.log(nextBestLeaf.manhattanCost());
            // Return solved leaf if solved.
            if (nextBestLeaf.isSolved())
                return nextBestLeaf;
            this.generateNextMoves(nextBestLeaf);
        }
    }
}
