import React, {Component} from 'react';
import '../TileBoard.css'

class Tile extends Component {
    render() {
        return (
            <div className="tile">
                {this.props.value}
            </div>
        );
    }
}

export default Tile;