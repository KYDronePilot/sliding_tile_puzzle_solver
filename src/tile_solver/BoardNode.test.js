import Board, {LEFT, UP} from './Board';
import BoardNode from "./BoardNode";
import Tile, {BLANK_TILE} from "./Tile";


let solvedBoard, boardNode;

beforeEach(() => {
    solvedBoard = new Board(3);
    solvedBoard.solved_board = solvedBoard;
    let tiles = [
        new Tile(8), new Tile(4), new Tile(6),
        new Tile(3), new Tile(7), new Tile(1),
        new Tile(5), new Tile(2), new Tile(BLANK_TILE)
    ];
    boardNode = new BoardNode(3, solvedBoard, 0, null, tiles);
});

test("BoardNode construction", () => {
    expect(boardNode.depth).toBe(0);
    expect(boardNode.cost).toBe(-1);
    expect(boardNode.parent_node).toBe(null);
});

test("BoardNode copy", () => {
    let newBoardNode = boardNode.copy();
    expect(boardNode.n).toBe(newBoardNode.n);
    expect(boardNode.solved_board).toBe(newBoardNode.solved_board);
    expect(boardNode.depth).toBe(newBoardNode.depth);
    expect(boardNode.parent).toBe(newBoardNode.parent);
    expect(boardNode.tiles).not.toBe(newBoardNode.tiles);
    expect(boardNode.tiles).toEqual(newBoardNode.tiles);
    expect(boardNode.last_direction).toBe(newBoardNode.last_direction);
    expect(boardNode.blankIndex).toBe(newBoardNode.blankIndex);
});

test("BoardNode previously encountered", () => {
    expect(boardNode.previouslyEncountered()).toBe(false);
    BoardNode.previousBoards[boardNode.hash()] = null;
    expect(boardNode.previouslyEncountered()).toBe(true);
});

test("BoardNode add to previously encountered", () => {
    BoardNode.previousBoards = {};
    expect(boardNode.previouslyEncountered()).toBe(false);
    boardNode.addToPreviouslyEncountered();
    expect(boardNode.previouslyEncountered()).toBe(true);
});

test("BoardNode get cost", () => {
    boardNode.depth = 5;
    expect(boardNode.getCost()).toBe(23);
});

test("BoardNode get move leaves", () => {
    let moveLeaves = boardNode.getMoveLeaves();
    expect(moveLeaves.length).toBe(2);
    for (let board of moveLeaves) {
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
        expect(board.parent_node.equals(boardNode)).toBe(true);
        expect(board.depth).toBe(boardNode.depth + 1);
        expect(board.previouslyEncountered()).toBe(true);
    }
});
