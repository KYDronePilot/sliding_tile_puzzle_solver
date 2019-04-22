import assert from "assert";
// var assert = require("assert");

/**
 * Simple representation of a tile in the board.
 */
export default class Tile {
    /**
     * Construct a simple tile.
     * @param symbol {number} - Symbol to represent the tile
     */
    constructor(symbol) {
        this.symbol = symbol;
    }

    /**
     * Format the tile symbol.
     * @return {string} The formatted tile symbol
     */
    toString() {
        // Blank if the blank tile.
        if (this.symbol === -1)
            return "";
        return `Tile ${this.symbol}`;
    }

    /**
     * Compare tiles by symbols.
     * @param other {Tile} - The other tile
     * @return {boolean} Whether they are equal
     */
    equals(other) {
        return this.symbol === other.symbol;
    }

    /**
     * Create a string hash based on the symbol.
     * @return {string} Symbol as string
     */
    hash() {
        return this.symbol.toString();
    }

    /**
     * Create simple copy of object.
     * @return {Tile} Copy of tile
     */
    copy() {
        return new Tile(this.symbol);
    }
}


// if (!module.parent) {
//     // console.log(tiles);
//     let tile = new Tile(5);
//     // toString() test.
//     assert.strictEqual("Tile 5", tile.toString());
//     // hash() test.
//     assert.strictEqual("5", tile.hash());
//     // copy() test.
//     let tile2 = tile.copy();
//     assert.notStrictEqual(tile, tile2);
// }