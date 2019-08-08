import React, {Component} from 'react';
import {Tile} from '../tile_solver/Tile';
import BoardNode from '../tile_solver/BoardNode';
import Board, {MOVES, OPPOSITE_DIRECTIONS} from '../tile_solver/Board';
import AStarSolver from '../tile_solver/AStarSolver';
import '../TileBoard.css'
import {Tile as TileComponent} from './Tile';

const wasmSolver = import("../../build/react_rust_wasm");

const RUST_ALGORITHM = 'rust-algorithm';
const JS_ALGORITHM = 'js-algorithm';

// Board size
let BOARD_N = 4;
// Initial number of times to shuffle
let INITIAL_SHUFFLE_N = 10;
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
            board: BoardNode.createGameBoard(BOARD_N, INITIAL_SHUFFLE_N),
            solverAlgorithm: JS_ALGORITHM,
            shuffleCount: INITIAL_SHUFFLE_N
        };
    }

    /**
     * Shuffle the board.
     * @return {null}
     */
    async shuffle() {
        await this.setState(state => {
            state.board.shuffle(SHUFFLE_N);
            // console.log(state.board.toString());
            // console.log(board.tiles.map(item => item.symbol));
            return {board: state.board, shuffleCount: state.shuffleCount + SHUFFLE_N};
        });
        // console.log(this.state.board.toString());
    }

    /**
     * Animate board solution moves (solve the board visually).
     * @param board {BoardNode} - Board to solve
     * @param moves {Array<string>} - Moves to make
     * @return {Promise<void>}
     */
    async solveVisualBoard(moves) {
        for (let move of moves) {
            this.slideTile(move);
            // Pause before next move
            await sleep(MOVE_TIMEOUT);
        }
    }

    /**
     * Solve the board algorithmically and then visually.
     * @return {null}
     */
    async solve() {
        // Solve the board
        if (this.state.solverAlgorithm === JS_ALGORITHM) {
            this.solveJS();
        } else {
            this.solveRust();
        }
        // Reset shuffle count
        this.setState({shuffleCount: 0});
    }

    /**
     * Solve board using JS algorithm.
     */
    solveJS() {
        // Solve board object
        let unsolvedBoard = this.state.board.copy();
        let solver = new AStarSolver(unsolvedBoard);
        let solvedLeaf = solver.solve();
        // Get solution moves
        let solutionMoves = AStarSolver.getSolutionMoves(solvedLeaf);
        // Solve visual board
        this.solveVisualBoard(solutionMoves)
            .then(() => {
                this.setState({board: BoardNode.createGameBoard(BOARD_N, 0)});
                BoardNode.resetPreviousBoards();
            });
    }

    /**
     * Solve board using Rust WASM algorithm.
     */
    solveRust() {
        // Compile the WASM
        wasmSolver.then(solver => {
            // Prepare to solve board
            let unsolvedBoard = this.state.board.copy();
            let tilesCSV = this.state.n + ',' + unsolvedBoard.tiles.map(tile => tile.symbol).join(',');
            // Solve and get solution moves
            let solutionMoves = solver.solve_board(tilesCSV);
            const expandedSolutionMoves = solutionMoves.split('').map(moveChar => {
                if (moveChar === 'U')
                    return 'up';
                if (moveChar === 'D')
                    return 'down';
                if (moveChar === 'L')
                    return 'left';
                return 'right';
            });
            // Solve visual board
            this.solveVisualBoard(expandedSolutionMoves)
                .then(() => {
                    this.setState({board: BoardNode.createGameBoard(BOARD_N, 0)});
                });
        })
    }

    /**
     * Slide tile on the visual board.
     * @param moveDirection {string} - Move direction of blank tile
     */
    slideTile(blankTileMoveDirection) {
        // Get index of tile to move
        let tileI = this.state.board.translate(this.state.board.blankIndex, blankTileMoveDirection);
        const tile = document.getElementById(`tile-${this.state.board.tiles[tileI].symbol}`);
        tile.click();
        // // Get actual move direction of tile
        // let moveDirection = OPPOSITE_DIRECTIONS[blankTileMoveDirection];
        // // Get DOM of object to move
        // let domTile = document.querySelector(`.tile:nth-child(${tileI + 1})`);
        // // Start move animation.
        // domTile.classList.add(`move-${moveDirection}`);
        // setTimeout(() => {
        //     // Swap tile positions
        //     [board.tiles[board.blankIndex], board.tiles[tileI]] = [board.tiles[tileI], board.tiles[board.blankIndex]];
        //     // Update blank tile index
        //     board.blankIndex = tileI;
        //     // Remove move animation
        //     domTile.classList.remove(`move-${moveDirection}`);
        //     // Update state.
        //     this.setState({board: board});
        // }, 300);
    }

    /**
     * Swap tiles on the board.
     * @param tileIndex1 {number} - Index of first tile
     * @param tileIndex2 {number} - Index of second tile
     */
    swapTiles(tileIndex1, tileIndex2) {
        this.setState(state => {
            [state.board.tiles[tileIndex1], state.board.tiles[tileIndex2]]
                = [state.board.tiles[tileIndex2], state.board.tiles[tileIndex1]];
            state.board.blankIndex = state.board.getBlankIndex();
            return {board: state.board};
        })
    }

    /**
     * Check if a tile can move.
     * @param tile {Tile} - Tile to check
     * @return {boolean} Whether or not the tile can move
     */
    canTileMove(tile) {
        return this.getTileMoveDirection(tile) !== '';
    }

    /**
     * Get the direction a tile can move.
     * - If tile cannot move, return empty string.
     * @param tile {Tile} - Tile to get move direction of
     * @return {string} Tile move direction if valid to move; else, blank string
     */
    getTileMoveDirection(tile) {
        // Exit if trying to move blank tile
        if (tile.isBlank())
            return '';
        const tileI = this.state.board.tiles.indexOf(tile);
        for (let move of MOVES) {
            if (this.state.board.translate(tileI, move) === this.state.board.blankIndex)
                return move;
        }
        return '';
    }

    /**
     * Handle changes to the algorithm option.
     * @param event - Event info
     */
    handleAlgorithmChange(event) {
        this.setState({solverAlgorithm: event.target.value});
    }

    handleSizeChange(event) {

    }

    render() {
        return (
            <div>
                <div
                    style={{
                        width: '408px', height: '408px',
                        display: 'block', marginLeft: 'auto', marginRight: 'auto'
                    }}>
                    {this.state.board.tiles.map(tile => (<TileComponent tile={tile} board={this} n={this.state.n}/>))}
                </div>
                <div style={{margin: '4px 0'}}>
                    <button className={'primary'} onClick={this.shuffle.bind(this)}>Shuffle</button>
                    <button className={'success'} onClick={this.solve.bind(this)}>Solve</button>
                </div>
                <h3>Solving Algorithm</h3>
                <div style={{display: 'block', marginBottom: '10px'}}>
                    <label htmlFor={JS_ALGORITHM}>Native Javascript</label>
                    <input
                        type={'radio'}
                        id={JS_ALGORITHM}
                        value={JS_ALGORITHM}
                        checked={this.state.solverAlgorithm === JS_ALGORITHM}
                        onChange={this.handleAlgorithmChange.bind(this)}
                        style={{marginLeft: '5px'}}
                    />
                </div>
                <h3>Other Options</h3>
                <div>
                    <input type="text"/>
                </div>
                <div style={{display: 'block'}}>
                    <label htmlFor={RUST_ALGORITHM}>Web Assembly Rust</label>
                    <input
                        defaultChecked={true}
                        type={'radio'}
                        id={JS_ALGORITHM}
                        value={RUST_ALGORITHM}
                        checked={this.state.solverAlgorithm === RUST_ALGORITHM}
                        onChange={this.handleAlgorithmChange.bind(this)}
                        style={{marginLeft: '5px'}}
                    />
                </div>
                <h4>Times shuffled: {this.state.shuffleCount}</h4>
            </div>
        )
    }
}

export {TileBoard};
