import React, {Component} from 'react';
import {Tile} from '../tile_solver/Tile';
import BoardNode from '../tile_solver/BoardNode';
import {MOVES} from '../tile_solver/Board';
import AStarSolver from '../tile_solver/AStarSolver';
import '../TileBoard.css'
import {Tile as TileComponent} from './Tile';
import RadioBlock from './RadioBlock';
import OptionSection from './OptionSection';
import Hr from './Hr';
import TextBasedInput from './TextBasedInput';
import Dropdown from './dropdown';
import PropTypes from 'prop-types';

const wasmSolver = import('../../build/sliding_tile_puzzle_solver');

const RUST_ALGORITHM = 'rust-algorithm';
const JS_ALGORITHM = 'js-algorithm';

// Maximum size of the board (horizontally and vertically, in pixels)
const MAX_BOARD_SIZE = 400;

// Board size
let BOARD_N = 4;
// Initial number of times to shuffle
let INITIAL_SHUFFLE_N = 10;
// Visual move timeout (ms)
let MOVE_TIMEOUT = 1000;

/**
 * Simple method for synchronous sleeping in code.
 * @param ms {number} - Number of milliseconds to sleep for
 * @return {Promise<any>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simple heading with info.
 */
function StatsHeading(props) {
    return (
        <div>
            <h3 style={{display: 'inline-block', marginRight: '4px'}}>{props.label}:</h3>
            <span style={{fontSize: '1.17em'}}>{props.value}</span>
        </div>
    );
}

/**
 * Buttons for controlling the board (with styling).
 */
function Button(props) {
    const styles = {
        backgroundColor: props.backgroundColor,
        border: 'none',
        color: 'white',
        padding: '10px 20px',
        textAlign: 'center',
        textDecoration: 'none',
        display: 'inline-block',
        fontSize: '20px',
        borderRadius: 0
    };

    return (
        <button className={'primary'} onClick={props.onClick}
                style={styles}>
            {props.label}
        </button>
    );
}

/**
 * Main class for representing the visual game board.
 * @author Michael Galliers (KYDronePilot)
 */
class TileBoard extends Component {
    static propTypes = {
        color: PropTypes.string,
        backgroundColor: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            numTiles: 4,
            boardSize: 408,
            tileSize: 100,
            board: BoardNode.createGameBoard(BOARD_N, INITIAL_SHUFFLE_N),
            solverAlgorithm: JS_ALGORITHM,
            shuffleCount: INITIAL_SHUFFLE_N,
            timesShuffled: INITIAL_SHUFFLE_N
        };
    }

    /**
     * Shuffle the board.
     */
    shuffle() {
        this.setState(state => {
            state.board.shuffle(state.shuffleCount);
            return {board: state.board, timesShuffled: state.timesShuffled + state.shuffleCount};
        });
    }

    /**
     * Solve the board algorithmically and then visually.
     * @return {Promise<void>}
     */
    async solve() {
        // Solve the board
        if (this.state.solverAlgorithm === JS_ALGORITHM) {
            this.solveJS();
        } else {
            this.solveRust();
        }
        // Reset shuffle count
        this.setState({timesShuffled: 0});
    }

    /**
     * Animate moves to solve the board (solve the board visually).
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
                this.setState({board: BoardNode.createGameBoard(this.state.numTiles, 0)});
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
            let tilesCSV = this.state.numTiles + ',' + unsolvedBoard.tiles.map(tile => tile.symbol).join(',');
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
                    this.setState({board: BoardNode.createGameBoard(this.state.numTiles, 0)});
                });
        })
    }

    /**
     * Slide tile on the visual board.
     * @param blankTileMoveDirection {string} - Direction to move blank tile
     */
    slideTile(blankTileMoveDirection) {
        // Get tile to move and click it
        let tileI = this.state.board.translate(this.state.board.blankIndex, blankTileMoveDirection);
        const tile = document.getElementById(`tile-${this.state.board.tiles[tileI].symbol}`);
        tile.click();
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
     * Calculate the size of the tiles and board based on the number of tiles in a row/column.
     * @param numTiles {string} - Number of tiles in a row/column
     */
    updateSize(numTiles) {
        const numTilesInt = parseInt(numTiles);
        // Size of each tile
        const tileSize = Math.floor(MAX_BOARD_SIZE / numTilesInt);
        // Size of board
        const boardSize = tileSize * numTilesInt;
        this.setState({
            numTiles: numTilesInt,
            tileSize, boardSize,
            board: BoardNode.createGameBoard(numTilesInt, 0)
        });
    }

    /**
     * Handle changes to the algorithm option.
     * @param event - Event info
     */
    handleAlgorithmChange(event) {
        this.setState({solverAlgorithm: event.target.value});
    }

    /**
     * Handle change to the number of times to shuffle the board with each click.
     * @param value {number} - Number to update to
     */
    handleShuffleCountChange(value) {
        this.setState({shuffleCount: value});
    }

    render() {
        return (
            <div style={{
                textAlign: 'center',
                fontFamily: 'Roboto, sans-serif',
                color: this.props.color,
                marginBottom: '40px'
            }}>
                <div style={{display: 'inline-block', textAlign: 'left'}}>
                    <div
                        style={{
                            width: `${this.state.boardSize + this.state.numTiles * 2}px`,
                            height: `${this.state.boardSize + this.state.numTiles * 2}px`
                        }}>
                        {this.state.board.tiles.map(tile => (
                            <TileComponent tile={tile} board={this}
                                           n={this.state.boardSize}
                                           numTiles={this.state.numTiles}
                                           tileSize={this.state.tileSize}
                                           backgroundColor={this.props.backgroundColor}
                                           key={`${this.state.numTiles}-${tile.toString()}`}
                            />))}
                    </div>

                    <Hr color={this.props.color}/>

                    {/* Number of times the board has been shuffled */}
                    <StatsHeading label={'Times Shuffled'} value={this.state.timesShuffled}/>

                    <Hr color={this.props.color}/>

                    {/* Solving algorithm selection */}
                    <OptionSection name={'Solving Algorithm'}>
                        <RadioBlock
                            onChange={this.handleAlgorithmChange.bind(this)}
                            checked={this.state.solverAlgorithm === JS_ALGORITHM}
                            value={JS_ALGORITHM}
                            id={JS_ALGORITHM}
                            description={'Native Javascript'}
                        />
                        <RadioBlock
                            onChange={this.handleAlgorithmChange.bind(this)}
                            checked={this.state.solverAlgorithm === RUST_ALGORITHM}
                            value={RUST_ALGORITHM}
                            id={RUST_ALGORITHM}
                            description={'Web Assembly Rust'}
                        />
                    </OptionSection>

                    <Hr color={this.props.color}/>

                    {/* Other options */}
                    <OptionSection name={'Other Options'}>
                        {/* Shuffle count */}
                        <TextBasedInput
                            name={'shuffleCount'} inputType={'int'}
                            label={'Shuffle Count'} handleChange={this.handleShuffleCountChange.bind(this)}
                            defaultValue={10}
                        />
                        {/* Board size */}
                        <Dropdown
                            handleChange={this.updateSize.bind(this)}
                            label={'Board Size'}
                            defaultValue={'4'}
                            values={[3, 4, 5]}
                        />
                    </OptionSection>

                    {/* Action buttons */}
                    <OptionSection name={'Actions'}>
                        <Button label={'Shuffle'} onClick={this.shuffle.bind(this)} backgroundColor={'#d53346'}/>
                        <Button label={'Solve'} onClick={this.solve.bind(this)} backgroundColor={'#39a842'}/>
                    </OptionSection>
                </div>
            </div>
        )
    }
}

export {TileBoard};