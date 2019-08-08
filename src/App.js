import React, { Component } from 'react';
import './App.css';
import {TileBoard} from './components/TileBoard'

class App extends Component {
  render() {
    return (
      <div className="App">
        <TileBoard />
      </div>
    );
  }
}

export default App;
