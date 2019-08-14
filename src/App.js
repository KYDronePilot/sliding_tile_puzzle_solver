import React, { Component } from 'react';
// import './App.css';
import {TileBoard} from './components/TileBoard'

class App extends Component {
  render() {
    return (
      <div>
        <TileBoard color={'black'} backgroundColor={'white'}/>
      </div>
    );
  }
}

export default App;
