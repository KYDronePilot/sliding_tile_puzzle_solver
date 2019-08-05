import React, {Component} from 'react';

/**
 * Represents a physical tile on the game board.
 * @author Michael Galliers
 */
class Tile extends Component {


    render() {
        return (
            <div>
                <img
                    src={`logo_files/row-${Math.floor((tile.symbol - 1) / this.state.n) + 1}-col-${(tile.symbol - 1) % this.state.n + 1}.jpg`}
                    height={100} width={100} className="tile"
                />
            </div>
        );
    }
}

export default Tile;