import Tile, { BLANK_TILE } from "./Tile";


let tile;

beforeEach(() => {
    tile = new Tile(1);
});


test("Tile construction", () => {
    expect(tile.symbol).toBe(1);
});


test("Tile to string", () => {
    expect(tile.toString()).toBe("Tile 1");
    let tile_2 = new Tile(BLANK_TILE);
    expect(tile_2.toString()).toBe("      ");
});

test("Tile equivalence", () => {
    let tile_2 = new Tile(2);
    expect(tile.equals(tile_2)).toBe(false);
    let tile_3 = new Tile(1);
    expect(tile.equals(tile_3)).toBe(true);
});

test("Tile hash", () => {
    expect(tile.hash()).toBe("1");
});

test("Tile copy", () => {
    expect(tile).not.toBe(tile.copy());
    expect(tile).toEqual(tile.copy());
});

test("Tile is blank", () => {
    expect(tile.isBlank()).toBe(false);
    let tile_2 = new Tile(BLANK_TILE);
    expect(tile_2.isBlank()).toBe(true);
});
