import React, {Component} from 'react';
import Tile from '../tile_solver/Tile';
import BoardNode from '../tile_solver/BoardNode';
import Board from '../tile_solver/Board';
import AStarSolver from '../tile_solver/AStarSolver';
import '../TileBoard.css'


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Opposite of each move direction.
const OppositeDirections = {
    "up": "down",
    "down": "up",
    "left": "right",
    "right": "left",
    "": ""
};

class TileBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            solution: "Hello World",
            n: 4,
            board: new Board(4)
        };
    }

    /**
     * Set up the game board.
     */
    generateBoard() {
        // Create the tiles.
        let tiles = this.generateTiles();
        // Create a solved board.
        let solved_board = new Board(this.state.n);
        // Create an unsolved board.
        let unsolvedBoard = new BoardNode(this.state.n, solved_board, 0, null, tiles);
        // Shuffle it.
        unsolvedBoard.shuffle(50);
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
        // this.shuffleTiles(tiles);
        return tiles;
    }

    /**
     * Shuffle the tiles.
     * @param tiles {Array} - Tiles to shuffleTiles
     * @return {Array} Shuffled tiles
     */
    shuffleTiles(tiles) {
        for (let i = this.state.n ** 2 - 1; i >= 0; i--) {
            let rand_i = Math.floor(Math.random() * i);
            let tmp = tiles[i];
            tiles[i] = tiles[rand_i];
            tiles[rand_i] = tmp;
        }
    }

    /**
     * Shuffle using valid moves.
     * @return {null}
     */
    shuffleProper() {
        // Grap a copy of the board.
        let board = this.state.board;
        // Shuffle it.
        board.shuffle(10);
        // Update the state.
        this.setState({board: board});
    }

    /**
     * Perform moves on the board asynchronously.
     * @param board {BoardNode} - The board being worked with
     * @param moves {Array} - The moves to make
     * @return {Promise<void>}
     */
    async runSolutionMoves(board, moves) {
        console.log(moves.slice());
        // Continue until no more moves.
        while (moves.length > 0) {
            // Move the tile.
            this.moveTile(board.blank_index, moves[0]);
            // Remove that move.
            moves.splice(0, 1);
            // Wait a sec.
            await sleep(1000);
        }
    }

    /**
     * Solve the puzzle and animate the result.
     * @return {null}
     */
    solve() {
        console.log("Made it here");
        // Get board from state.
        let board = this.state.board;
        // Update the blank tile index.
        board.updateBlankIndex();
        // Create the solver and solve.
        let solver = new AStarSolver(board);
        let solvedLeaf = solver.solve();
        // Get the path of moves to make.
        let moves = AStarSolver.getPathArray(solvedLeaf);
        console.log(moves);
        // Solve the board using those moves.
        this.runSolutionMoves(board, moves)
            .then(() => {
                console.log("success!")
            });
    }

    /**
     * Move tile from initial to final position.
     * @param i {number} - Index of tile
     * @param moveDirection {string} - The direction to move
     */
    moveTile(i, moveDirection) {
        // Get the index of the tile being moved.
        let movedTile = this.state.board.translate(i, moveDirection);
        // Invert the move direction.
        moveDirection = OppositeDirections[moveDirection];
        // Get DOM of object to move.
        let domTile = document.querySelector(`.tile:nth-child(${movedTile + 1})`);
        // Enable move animation.
        domTile.classList.add(`move-${moveDirection}`);
        setTimeout(() => {
            // Remove the move animation.
            domTile.classList.remove(`move-${moveDirection}`);
            // Swap tile position.
            let board = this.state.board;
            let tmp = board.tiles[i];
            board.tiles[i] = board.tiles[movedTile];
            board.tiles[movedTile] = tmp;
            // Update the board's blank index.
            board.updateBlankIndex();
            // Update state.
            console.log(board);
            this.setState(() => ({
                board: board
            }));

        }, 300);
    }

    componentDidMount() {
        this.generateBoard();
    }

    render() {
        return (
            <div>
                <div className="tile-board">
                    {this.state.board.tiles.map((value, index, array) => (
                        <img
                            src={`logo_files/row-${Math.floor((value.symbol - 1) / this.state.n) + 1}-col-${(value.symbol - 1) % this.state.n + 1}.jpg`}
                            height={100} width={100} className="tile"
                        />
                    ))}
                </div>
                <button onClick={this.shuffleProper.bind(this)}>Shuffle</button>
                <button onClick={() => setTimeout(this.solve.bind(this), 1)}>Solve</button>
            </div>
        )
    }
}

export default TileBoard;
