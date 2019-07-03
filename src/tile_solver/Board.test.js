import Board, {UP, DOWN, LEFT, RIGHT} from './Board';
import Tile, {BLANK_TILE} from "./Tile";


let solved_board, board;

beforeEach(() => {
    solved_board = new Board(3);
    solved_board.solved_board = solved_board;
    let tiles = [
        new Tile(8), new Tile(4), new Tile(6),
        new Tile(3), new Tile(7), new Tile(1),
        new Tile(5), new Tile(2), new Tile(BLANK_TILE)
    ];
    board = new Board(3, solved_board, tiles);
});

test("Board constructor", () => {
    expect(board.n).toBe(3);
    expect(board.n2).toBe(9);
    expect(board.last_direction).toBe("");
    expect(board.blankIndex).toBe(8);
    expect(board.solved_board).toBe(solved_board);
    expect(board.tiles).toEqual([
        new Tile(8), new Tile(4), new Tile(6),
        new Tile(3), new Tile(7), new Tile(1),
        new Tile(5), new Tile(2), new Tile(BLANK_TILE)
    ]);
    expect(solved_board.tiles).toEqual([
        new Tile(1), new Tile(2), new Tile(3),
        new Tile(4), new Tile(5), new Tile(6),
        new Tile(7), new Tile(8), new Tile(BLANK_TILE)
    ]);
});

test("Board in conflict", () => {
    expect(Board._inConflict(0, 1, 1, 0)).toBe(true);
    expect(Board._inConflict(0, 1, 2, 1)).toBe(true);
    expect(Board._inConflict(0, 1, 0, 1)).toBe(false);
    expect(Board._inConflict(0, 2, 1, 2)).toBe(false);
});

test("Board to string", () => {
    expect(board.toString()).toBe(
        "Tile 8, Tile 4, Tile 6\nTile 3, Tile 7, Tile 1\nTile 5, Tile 2,       \n"
    );
});

test("Board equals", () => {
    let board_2 = new Board(3);
    expect(solved_board.equals(board_2)).toBe(true);
    expect(solved_board.equals(board)).toBe(false);
    let board_3 = new Board(4);
    expect(solved_board.equals(board_3)).toBe(false);
});

test("Board hash", () => {
    expect(board.hash()).toBe("84637152-1");
    expect(solved_board.hash()).toBe("12345678-1");
});

test("Board get blank index", () => {
    expect(solved_board.getBlankIndex()).toBe(8);
    let board_2 = new Board(3, solved_board, [
        new Tile(8), new Tile(4), new Tile(6),
        new Tile(3), new Tile(BLANK_TILE), new Tile(1),
        new Tile(5), new Tile(2), new Tile(7)
    ]);
    expect(board_2.getBlankIndex()).toBe(4);
});

test("Board translate", () => {
    expect(board.translate(0, DOWN)).toBe(3);
    expect(board.translate(0, RIGHT)).toBe(1);
    expect(board.translate(8, UP)).toBe(5);
    expect(board.translate(8, LEFT)).toBe(7);
});

test("Board manhattan cost", () => {
    expect(board.manhattanCost()).toBe(18);
});

test("Board linear conflicts", () => {
    expect(board._linearConflicts()).toBe(0);
    let tiles = [
        new Tile(8), new Tile(4), new Tile(6),
        new Tile(1), new Tile(7), new Tile(3),
        new Tile(5), new Tile(2), new Tile(BLANK_TILE)
    ];
    let board_2 = new Board(3, solved_board, tiles);
    expect(board_2._linearConflicts()).toBe(2);
});

test("Board get cost", () => {
    expect(board.getCost()).toBe(18);
});

test("Board is solved", () => {
    expect(board.isSolved()).toBe(false);
    expect(solved_board.isSolved()).toBe(true);
});

test("Board is valid move", () => {
    expect(board.isValidMove(UP)).toBe(true);
    expect(board.isValidMove(DOWN)).toBe(false);
    expect(board.isValidMove(LEFT)).toBe(true);
    expect(board.isValidMove(RIGHT)).toBe(false);
    let tiles_2 = [
        new Tile(8), new Tile(4), new Tile(6),
        new Tile(3), new Tile(BLANK_TILE), new Tile(1),
        new Tile(5), new Tile(2), new Tile(7)
    ];
    let board_2 = new Board(3, solved_board, tiles_2);
    expect(board_2.isValidMove(UP)).toBe(true);
    expect(board_2.isValidMove(DOWN)).toBe(true);
    expect(board_2.isValidMove(LEFT)).toBe(true);
    expect(board_2.isValidMove(RIGHT)).toBe(true);
    let tiles_3 = [
        new Tile(BLANK_TILE), new Tile(4), new Tile(6),
        new Tile(3), new Tile(8), new Tile(1),
        new Tile(5), new Tile(2), new Tile(7)
    ];
    let board_3 = new Board(3, solved_board, tiles_3);
    expect(board_3.isValidMove(UP)).toBe(false);
    expect(board_3.isValidMove(DOWN)).toBe(true);
    expect(board_3.isValidMove(LEFT)).toBe(false);
    expect(board_3.isValidMove(RIGHT)).toBe(true);
});

test("Board get moves", () => {
    expect(board.getMoves()).toEqual([UP, LEFT]);
    let tiles_2 = [
        new Tile(8), new Tile(4), new Tile(6),
        new Tile(3), new Tile(BLANK_TILE), new Tile(1),
        new Tile(5), new Tile(2), new Tile(7)
    ];
    let board_2 = new Board(3, solved_board, tiles_2);
    expect(board_2.getMoves()).toEqual([UP, DOWN, LEFT, RIGHT]);
    let tiles_3 = [
        new Tile(BLANK_TILE), new Tile(4), new Tile(6),
        new Tile(3), new Tile(8), new Tile(1),
        new Tile(5), new Tile(2), new Tile(7)
    ];
    let board_3 = new Board(3, solved_board, tiles_3);
    expect(board_3.getMoves()).toEqual([DOWN, RIGHT]);
});

test("Board move blank tile - UP", () => {
    board.moveBlankTile(UP);
    expect(board.tiles).toEqual([
        new Tile(8), new Tile(4), new Tile(6),
        new Tile(3), new Tile(7), new Tile(BLANK_TILE),
        new Tile(5), new Tile(2), new Tile(1)
    ]);
});

test("Board move blank tile - LEFT", () => {
    board.moveBlankTile(LEFT);
    expect(board.tiles).toEqual([
        new Tile(8), new Tile(4), new Tile(6),
        new Tile(3), new Tile(7), new Tile(1),
        new Tile(5), new Tile(BLANK_TILE), new Tile(2)
    ]);
});

test("Board move blank tile - DOWN", () => {
    let tiles_2 = [
        new Tile(BLANK_TILE), new Tile(4), new Tile(6),
        new Tile(3), new Tile(8), new Tile(1),
        new Tile(5), new Tile(2), new Tile(7)
    ];
    let board_2 = new Board(3, solved_board, tiles_2);
    board_2.moveBlankTile(DOWN);
    expect(board_2.tiles).toEqual([
        new Tile(3), new Tile(4), new Tile(6),
        new Tile(BLANK_TILE), new Tile(8), new Tile(1),
        new Tile(5), new Tile(2), new Tile(7)
    ]);
});

test("Board move blank tile - RIGHT", () => {
    let tiles_2 = [
        new Tile(BLANK_TILE), new Tile(4), new Tile(6),
        new Tile(3), new Tile(8), new Tile(1),
        new Tile(5), new Tile(2), new Tile(7)
    ];
    let board_2 = new Board(3, solved_board, tiles_2);
    board_2.moveBlankTile(RIGHT);
    expect(board_2.tiles).toEqual([
        new Tile(4), new Tile(BLANK_TILE), new Tile(6),
        new Tile(3), new Tile(8), new Tile(1),
        new Tile(5), new Tile(2), new Tile(7)
    ]);
});
