import React, { Component } from 'react';
import Tile from '../tile_solver/Tile';
import BoardNode from '../tile_solver/BoardNode';
import Board from '../tile_solver/Board';
import AStarSolver from '../tile_solver/AStarSolver';
// import Tile from './Tile';
import '../TileBoard.css'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class TileBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            solution: "Hello World",
            n: 3,
            board: new Board(3)
        };
    }

    /**
     * Set up the game board.
     */
    generateBoard() {
        // Create/shuffle the tiles.
        let tiles = this.generateTiles();
        // Create a solved board.
        let solved_board = new Board(this.state.n);
        // Create an unsolved board.
        let unsolvedBoard = new BoardNode(this.state.n, solved_board, 0, null, tiles);
        // Set the blank index.
        let symbol = -1;
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i].symbol === -1) {
                symbol = i;
                break
            }
        }
        unsolvedBoard.blank_index = symbol;
        // Update state.
        this.setState(() => ({
            board: unsolvedBoard
        }));
    }

    /**
     * Generate tiles for the game board.
     */
    generateTiles() {
        let tiles = [];
        // Generate the first n - 1 tiles.
        for (let i = 1; i < this.state.n ** 2; i++) {
            tiles.push(new Tile(i));
        }
        // Add on the blank tile.
        tiles.push(new Tile(-1));
        // Shuffle the tiles.
        this.shuffle(tiles);
        return tiles;
    }

    /**
     * Shuffle the tiles.
     * @param tiles {Array} - Tiles to shuffle
     * @return {Array} Shuffled tiles
     */
    shuffle(tiles) {
        for (let i = this.state.n ** 2 - 1; i >= 0; i--) {
            let rand_i = Math.floor(Math.random() * i);
            let tmp = tiles[i];
            tiles[i] = tiles[rand_i];
            tiles[rand_i] = tmp;
        }
    }

    /**
     * Swap two tiles.
     * @param tile1 {number} - The first tile.
     * @param tile2 {number} - The second tile.
     */
    swapTiles(tile1, tile2) {

    }

    /**
     * Move tile from initial to final position.
     * @param initial {number} - The initial position
     * @param final {number} - The final position
     */
    moveTile(initial, final) {

    }

    /**
     * Check if a tile can move and
     * @param tile_i
     */
    canTileMove(tile_i) {

    }

    componentDidMount() {
        TileBoard.setup()
            .then(result => this.setState(state => ({
                solution: result
            })));
        this.generateBoard();
    }

    static async setup() {
        let tiles = [
            new Tile(1),
            new Tile(-1),
            new Tile(7),
            new Tile(5),
            new Tile(4),
            new Tile(6),
            new Tile(8),
            new Tile(2),
            new Tile(3),
        ];
        let solved_board = new Board(3);
        let unsolvedBoard = new BoardNode(3, solved_board, 0, null, tiles);
        unsolvedBoard.blank_index = 1;
        let solver = new AStarSolver(unsolvedBoard);
        let solvedLeaf = solver.solve();
        console.log("Success!");
        return AStarSolver.getPath(solvedLeaf);
    }

    // moveTile(direction, )

    render() {
        return (
            <div className="tile-board">
                {this.state.board.tiles.map(value => (
                    <div className="tile">{value.toString()}</div>
                ))}
            </div>
        )
    }
}

export default TileBoard;
