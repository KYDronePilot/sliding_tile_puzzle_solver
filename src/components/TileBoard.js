import React, { Component } from 'react';
import Tile from '../tile_solver/Tile';
import BoardNode from '../tile_solver/BoardNode';
import Board, { OPPOSITE_DIRECTIONS } from '../tile_solver/Board';
import AStarSolver from '../tile_solver/AStarSolver';
import '../TileBoard.css'
import {Tile as TileComponent} from './Tile';
const wasmSolver = import("../../build/react_rust_wasm");


// Board size
let BOARD_N = 4;
// Initial number of times to shuffle
let INITIAL_SHUFFLE_N = 50;
// Number of times to shuffle with each button click
let SHUFFLE_N = 10;
// Visual move timeout (ms)
let MOVE_TIMEOUT = 1000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class TileBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            n: BOARD_N,
            board: BoardNode.createGameBoard(BOARD_N, INITIAL_SHUFFLE_N)
        };
    }

    /**
     * Shuffle the board.
     * @return {null}
     */
    async shuffle() {
        await this.setState(state => {
           state.board.shuffle(SHUFFLE_N);
           console.log(state.board.toString());
           // console.log(board.tiles.map(item => item.symbol));
           return {board: state.board};
        });
        console.log(this.state.board.toString());
    }

    /**
     * Animate board solution moves (solve the board visually).
     * @param board {BoardNode} - Board to solve
     * @param moves {Array<string>} - Moves to make
     * @return {Promise<void>}
     */
    async solveVisualBoard(board, moves) {
        for (let move of moves) {
            this.slideTile(board.blankIndex, move, board);
            // Pause before next move
            await sleep(MOVE_TIMEOUT);
        }
    }

    /**
     * Solve the board systematically and then visually.
     * @return {null}
     */
    async solve() {
        wasmSolver.then(solver => {
            let unsolvedBoard = this.state.board.copy();
            let tilesCSV = "4," + unsolvedBoard.tiles.map(tile => tile.symbol).join(",");
            let solution = solver.solve_board(tilesCSV);
            const solutionConstMoves = solution.split("").map(moveChar => {
                if (moveChar === "U")
                    return "up";
                if (moveChar === "D")
                    return "down";
                if (moveChar === "L")
                    return "left";
                return "right";
            });
            // Solve visual board
            this.solveVisualBoard(unsolvedBoard, solutionConstMoves)
                .then(() => {
                    this.setState({board: BoardNode.createGameBoard(BOARD_N, 0)});
                    BoardNode.resetPreviousBoards();
                });
            // alert(solution);
        })
        // // Solve board object
        // let unsolvedBoard = this.state.board.copy();
        // let solver = new AStarSolver(unsolvedBoard);
        // let solvedLeaf = solver.solve();
        // // Get solution moves
        // let solutionMoves = AStarSolver.getSolutionMoves(solvedLeaf);
        // Solve visual board
        // this.solveVisualBoard(unsolvedBoard, solutionMoves)
        //     .then(() => {
        //         this.setState({board: BoardNode.createGameBoard(BOARD_N, 0)});
        //         BoardNode.resetPreviousBoards();
        //     });
    }

    /**
     * Slide tile on the visual board.
     * @param blankTileI {number} - Index of blank tile
     * @param blankTileMoveDirection {string} - Move direction of blank tile
     * @param board {BoardNode} - Board to make move on
     */
    slideTile(blankTileI, blankTileMoveDirection, board) {
        // Get index of tile to move
        let tileI = board.translate(blankTileI, blankTileMoveDirection);
        // Get actual move direction of tile
        let moveDirection = OPPOSITE_DIRECTIONS[blankTileMoveDirection];
        // Get DOM of object to move
        let domTile = document.querySelector(`.tile:nth-child(${tileI + 1})`);
        // Start move animation.
        domTile.classList.add(`move-${moveDirection}`);
        setTimeout(() => {
            // Remove move animation
            domTile.classList.remove(`move-${moveDirection}`);
            // Swap tile positions
            [board.tiles[blankTileI], board.tiles[tileI]] = [board.tiles[tileI], board.tiles[blankTileI]];
            // Update blank tile index
            board.blankIndex = board.getBlankIndex();
            // Update state.
            this.setState({board: board});

        }, 300);
    }

    componentDidMount() {
        setInterval(() => {
            console.log(this.state.board.toString());
        }, 2000);
    }

    render() {
        return (
            <div>
                <div className="tile-board">
                    {this.state.board.tiles.map(tile => (<TileComponent tile={tile} n={this.state.n}/>))}
                </div>
                <button onClick={this.shuffle.bind(this)}>Shuffle</button>
                <button onClick={() => setTimeout(this.solve.bind(this), 1)}>Solve</button>
            </div>
        )
    }
}

export default TileBoard;
