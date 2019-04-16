import React, { Component } from 'react';
import '../TileBoard.css'

class TileBoard extends Component {

    render() {
        return (
            <div className="tile-board">
                <div className="tile">1</div>
                <div className="tile">2</div>
                <div className="tile">3</div>
                <div className="tile">4</div>
                <div className="tile">5</div>
                <div className="tile">6</div>
                <div className="tile">7</div>
                <div className="tile">8</div>
                <div className="tile"/>
            </div>
        )
    }
}

export default TileBoard;
