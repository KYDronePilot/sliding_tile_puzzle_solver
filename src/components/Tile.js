import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Tile as TileObject} from '../tile_solver/Tile';
import {TileBoard} from './TileBoard';
import image from '../../dist/background.jpg';


/**
 * Represents a physical tile on the game board.
 * @author Michael Galliers
 */
class Tile extends Component {
    constructor(props) {
        super(props);
        this.state = {moveClass: ''};
    }

    // Styles for smooth transitions
    static transitions = {
        WebkitTransition: '-webkit-transform 0.3s, background 0.3s',
        transition: 'transform 0.3s, background 0.3s'
    };

    // Styles for CSS tile sliding
    moveStyles = {
        up: {...{
            WebkitTransform: `translateY(-${this.props.tileSize}px)`,
            transform: `translateY(-${this.props.tileSize}px)`
        }, ...Tile.transitions},
        down: {...{
            WebkitTransform: `translateY(${this.props.tileSize}px)`,
            transform: `translateY(${this.props.tileSize}px)`
        }, ...Tile.transitions},
        left: {...{
            WebkitTransform: `translateX(-${this.props.tileSize}px)`,
            transform: `translateX(-${this.props.tileSize}px)`
        }, ...Tile.transitions},
        right: {...{
            WebkitTransform: `translateX(${this.props.tileSize}px)`,
            transform: `translateX(${this.props.tileSize}px)`
        }, ...Tile.transitions}
    };

    static propTypes = {
        numTiles: PropTypes.number,
        tileSize: PropTypes.number,
        tile: PropTypes.any,
        board: PropTypes.any,
        backgroundColor: PropTypes.string
    };

    /**
     * Get the row of the tile.
     * @return {number} Row of tile
     */
    row() {
        return Math.floor((this.props.tile.symbol - 1) / this.props.numTiles) + 1;
    }

    /**
     * Get the column of the tile.
     * @return {number} Column of the tile
     */
    col() {
        return (this.props.tile.symbol - 1) % this.props.numTiles + 1;
    }

    /**
     * Get the position of the background for this tile.
     * @return {string} The "X Y" background position info
     */
    backgroundPosition() {
        return `${(this.col() - 1) * (-1 * this.props.tileSize)}px ${(this.row() - 1) * (-1 * this.props.tileSize)}px`;
    }

    /**
     * Get the background for the tile.
     * @return {string} Value of the CSS background property.
     */
    background() {
        if (this.props.tile.isBlank())
            return this.props.backgroundColor;
        return `url(${image})`;
    }

    /**
     * Slide the tile on the visual board.
     * @param moveDirection {string} - Direction to move the tile
     * @param callback {function} - Callback after tile finishes moving
     */
    slideTile(moveDirection, callback) {
        this.setState({moveClass: moveDirection}, () => {
            setTimeout(() => {
                this.setState({moveClass: ''}, callback);
            }, 300)
        })
    }

    /**
     * Move tile if moving is valid.
     */
    handleClick() {
        // Exit if cannot move
        if (!this.props.board.canTileMove(this.props.tile))
            return;
        // Get move direction
        const moveDirection = this.props.board.getTileMoveDirection(this.props.tile);
        // Slide the tile
        this.slideTile(moveDirection, () => {
            this.props.board.swapTiles(
                this.props.board.state.board.tiles.indexOf(this.props.tile),
                this.props.board.state.board.blankIndex
            );
        })
    }

    render() {
        return (
            <div
                className={`tile ${this.state.moveClass}`}
                id={`tile-${this.props.tile.symbol}`}
                onClick={this.handleClick.bind(this)}
                style={{...{
                    height: `${this.props.tileSize}px`, width: `${this.props.tileSize}px`,
                    background: this.background(),
                    backgroundPosition: this.backgroundPosition(),
                    display: 'block', float: 'left',
                    border: `1px solid ${this.props.backgroundColor}`
                }, ...this.moveStyles[this.state.moveClass]}}>
            </div>
        );
    }
}

export {Tile};
