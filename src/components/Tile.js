import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Tile as TileObject} from '../components/Tile';
import image from '../../dist/test_image_resized_2.jpg';

// Dimensions of individual tiles
const tileDimensions = '100px';

/**
 * Represents a physical tile on the game board.
 * @author Michael Galliers
 */
class Tile extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        tile: PropTypes.instanceOf(TileObject),
        n: PropTypes.number
    };

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

    /**
     * Get the background for the tile.
     * @return {string} Value of the CSS background property.
     */
    background() {
        if (this.props.tile.isBlank())
            return 'white';
        return `url(${image})`;
    }

    render() {
        return (
            <div
                className={'tile'}
                style={{
                    height: tileDimensions, width: tileDimensions,
                    background: this.background(),
                    backgroundPosition: this.backgroundPosition(),
                    display: 'block', float: 'left',
                    border: '1px solid white'
                }}>
            </div>
        );
    }
}

export {Tile};