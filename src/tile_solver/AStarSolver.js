import PriorityQueue from "js-priority-queue";


/**
 * Main management class for solving sliding tile puzzle using the A* search algorithm.
 * @author Michael Galliers
 */
export default class AStarSolver {

    /**
     * Construct the solver.
     * @param board {BoardNode} - The board to be solved
     */
    constructor(board) {
        this.root = board;
        this.boardLeaves = new PriorityQueue({
            comparator: (a, b) => a.cost - b.cost
        });
        this.boardLeaves.queue(board);
    }

    /**
     * Get moves to solve the puzzle.
     * - Traverses up the state-space tree, starting from the solution leaf
     * @param solutionLeaf {BoardNode} - The solution leaf to start traversing
     * @return {Array} Directions that need to be moved
     */
    static getSolutionMoves(solutionLeaf) {
        let solutionBoards = [solutionLeaf];
        // First, get the boards in the solution path
        let walk = solutionLeaf;
        while (walk.parent_node !== null) {
            walk = walk.parent_node;
            solutionBoards.push(walk);
        }
        // Return moves in proper format
        solutionBoards.reverse();
        return solutionBoards.splice(1).map(value =>
            value.last_direction
        );
    }

    /**
     * Generate next moves for a leaf.
     * @param boardLeaf {BoardNode} - Board node to generate moves from
     * @return {null}
     */
    generateNextMoves(boardLeaf) {
        // Get new decision leaves
        let newLeaves = boardLeaf.getMoveLeaves();
        // Add these new leaves to leaves PQ
        for (let leaf of newLeaves) {
            this.boardLeaves.queue(leaf);
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
            // console.log(nextBestLeaf.manhattanCost());
            // Return solved leaf if solved.
            if (nextBestLeaf.isSolved())
                return nextBestLeaf;
            this.generateNextMoves(nextBestLeaf);
        }
    }
}
