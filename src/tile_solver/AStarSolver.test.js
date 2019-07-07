import Board, {LEFT, UP} from "./Board";
import BoardNode from "./BoardNode";
import Tile, {BLANK_TILE} from "./Tile";
import AStarSolver from "./AStarSolver";


let solvedBoard, boardNode, aStarSolver;

beforeEach(() => {
    solvedBoard = new Board(3);
    solvedBoard.solved_board = solvedBoard;
    let tiles = [
        new Tile(8), new Tile(4), new Tile(6),
        new Tile(3), new Tile(7), new Tile(1),
        new Tile(5), new Tile(2), new Tile(BLANK_TILE)
    ];
    boardNode = new BoardNode(3, solvedBoard, 0, null, tiles);
    aStarSolver = new AStarSolver(boardNode);
});

afterEach(() => {
    // delete aStarSolver.boardLeaves;
    BoardNode.resetPreviousBoards();
});

test("AStarSolver construction", () => {
    expect(aStarSolver.root).toBe(boardNode);
    expect(aStarSolver.boardLeaves.dequeue()).toBe(boardNode);
});

test("AStarSolver get solution moves", () => {
    let solvedLeaf = aStarSolver.solve();
    let solutionMoves = AStarSolver.getSolutionMoves(solvedLeaf);
    expect(solutionMoves).toEqual([
        "left", "left", "up", "right", "right", "down", "left", "left", "up", "up",
        "right", "down", "left", "up", "right", "right", "down", "left", "down",
        "right", "up", "left", "up", "right", "down", "left", "down", "right"]);
});

test("AStarSolver generate next moves", () => {
    aStarSolver.generateNextMoves(boardNode);
    let boards = [];
    for (let i = 0; i < 3; i++)
        boards.push(aStarSolver.boardLeaves.dequeue());
    expect(boards.length).toBe(3);

    for (let board of boards) {
        if (board.last_direction === UP) {
            expect(board.tiles).toEqual([
                new Tile(8), new Tile(4), new Tile(6),
                new Tile(3), new Tile(7), new Tile(BLANK_TILE),
                new Tile(5), new Tile(2), new Tile(1)
            ]);
        }
        if (board.last_direction === LEFT) {
            expect(board.tiles).toEqual([
                new Tile(8), new Tile(4), new Tile(6),
                new Tile(3), new Tile(7), new Tile(1),
                new Tile(5), new Tile(BLANK_TILE), new Tile(2)
            ]);
        }
        if (board.last_direction === null) {
            expect(board.tiles).toEqual([
                new Tile(8), new Tile(4), new Tile(6),
                new Tile(3), new Tile(7), new Tile(1),
                new Tile(5), new Tile(2), new Tile(BLANK_TILE)
            ]);
        }
    }
});

test("AStarSolver solve", () => {
    let solvedLeaf = aStarSolver.solve();
    expect(solvedLeaf.tiles).toEqual([
        new Tile(1), new Tile(2), new Tile(3),
        new Tile(4), new Tile(5), new Tile(6),
        new Tile(7), new Tile(8), new Tile(BLANK_TILE)
    ]);
});
