import React, {Component} from 'react';
import image from '../../dist/test_image_resized_2.jpg';

// Dimensions of individual tiles
const tileDimensions = '100px';

/**
 * Represents a physical tile on the game board.
 * @author Michael Galliers
 */
class Tile extends Component {
    /**
     * Get the row of the tile.
     * @return {number} Row of tile
     */
    row() {
        return Math.floor((this.props.tile.symbol - 1) / this.props.n) + 1;
    }

    /**
     * Get the column of the tile.
     * @return {number} Column of the tile
     */
    col() {
        return (this.props.tile.symbol - 1) % this.props.n + 1;
    }

    /**
     * Get the position of the background for this tile.
     * @return {string} The "X Y" background position info
     */
    backgroundPosition() {
        return `${(this.col() - 1) * -100}px ${(this.row() - 1) * -100}px`;
    }

    render() {
        return (
            <div
                style={{
                    height: tileDimensions, width: tileDimensions,
                    background: `url(${image})`,
                    'background-position': this.backgroundPosition(),
                    display: 'block', float: 'left'
                }}>
            </div>
        );
    }
}

export {Tile};