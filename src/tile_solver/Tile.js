/**
 * Symbol for blank tile.
 */
export const BLANK_TILE = -1;

/**
 * Simple representation of a tile in the board.
 */
export class Tile {
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
        // Blank if tile is blank.
        if (this.isBlank())
            return "      ";
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

    /**
     * Check if tile is blank.
     * @return {boolean} - Whether or not the tile is blank
     */
    isBlank() {
        return this.symbol === BLANK_TILE;
    }

    /**
     * Generate tiles for a solved game board.
     * @param n {number} - Number of tiles to generate
     * @return {Array} generated tiles
     */
    static generateTiles(n) {
        let tiles = [];
        // Generate the first boardSize - 1 tiles
        for (let i = 1; i < n ** 2; i++) {
            tiles.push(new Tile(i));
        }
        // Add on the blank tile
        tiles.push(new Tile(-1));
        return tiles;
    }
}
