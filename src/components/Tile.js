import React, {Component} from 'react';

/**
 * Represents a physical tile on the game board.
 * @author Michael Galliers
 */
class Tile extends Component {
    /**
     * Get the filename of the image to display.
     * @return {string} Filename of image to display
     */
    getFileName() {
        let row = Math.floor((this.props.tile.symbol - 1) / this.props.n) + 1;
        let col = (this.props.tile.symbol - 1) % this.props.n + 1;
        console.log(`row-${row}-col-${col}.jpg`);
        return `row-${row}-col-${col}.jpg`;
    }

    render() {
        return (
            <div>
                <img
                    src={`logo_files/${this.getFileName()}`}
                    alt={`Tile puzzle tile`}
                    height={100} width={100}
                    className="tile"
                />
            </div>
        );
    }
}

export {Tile};