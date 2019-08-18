# A* Sliding Tile Puzzle Solver
[![Build Status](https://travis-ci.org/KYDronePilot/sliding_tile_puzzle_solver.svg?branch=master)](https://travis-ci.org/KYDronePilot/sliding_tile_puzzle_solver)

### View Live Project [Here](https://tile-puzzle.kydronepilot.com)

This project is a web-based sliding tile puzzle solver built with React.js, Javascript, and Rust/Web Assembly. The site
is currently hosted by GitHub Pages on the `gh-pages` branch of this repo and can be accessed at the link above.

## Background
The project started as a college assignment where we had to implement the A* Search Algorithm to solve sliding tile
puzzles and visualize the solution moves with graphics. The first iteration of the project had a not-so-well designed
React interface (one of my first React projects) and a single Javascript solving algorithm prototyped in Python. The
algorithm had many issues and would occasionally never be able to solve the puzzle.

The next major iteration had the objective of fixing issues with the current algorithm and interface, implementing it
in Rust and running it in Web Assembly. This took quite some time to figure out, but was ultimately successful.

## Design
The Javascript algorithm is designed with a strong usage of OO-concepts so that it would be easy to understand and
improve. The Rust algorithm also has a lot of OO-concepts as well (to the extent of which the Rust language allows it),
however, some of the highest level solving operations were strongly coupled to prevent errors and increase performance.

The algorithms are very quick (< 4 seconds) when solving boards of widths less than or equal to 4 tiles and < 50
shuffles. For bigger boards and many more times shuffled, the time to solve increases a lot (> 2 minutes). As the
complexity of the solutions increases, however, the efficiency of the Rust algorithm becomes more apparent. I have yet
to do a statistical analysis, but the faster solve times of the Rust algorithm are easy to see.

## Interface Usage
**Note**: The algorithms are not perfect and all run locally on your machine. If you shuffle large boards thousands of
times, there is a good likelihood that your browser window will freeze up until the puzzle is solved or it maxes out the
Web Assembly/OS memory limit. Use at your own risk.

The user interface is simple and easy to use. To run the solver, do the following:
* Choose which algorithm you want to use
* Chose the size of your board
* Enter the number of times you want to shuffle with each button press
* Shuffle the board with the "Shuffle" button and watch the "Times Shuffled" counter increase
* Try your hand at solving the board yourself by clicking on the tiles you want to move
* When you give up, press the "Solve" button and watch it do its work

## Known Issues
#### Rust/Web Assembly Running out of Memory
When trying to solve an extremely difficult puzzle, the Rust algorithm will likely fail due to it running out of memory.
This can be seen as an error in the dev console of your browser.

This problem could be fixed by somehow finding a way to increase the amount of memory allocatable with Web Assembly, but
a better solution would likely be to further optimize the solving algorithm, if possible. From my research, I was unable
to find benchmarks of other algorithms to compare mine too. The other web-based solvers I have encountered seem to only
shuffle the board a few times, thus preventing someone from testing the algorithm's robustness easily.

## Contributing
Pull requests are welcome. I only ask that you first create an issue if you plan on making major changes.

The current goal of this project is to be a demo for showing the capabilities of Web Assembly and how it can speed up
computationally heavy tasks at the edge. There are a lot of improvements that can still be made and amy help would be
greatly appreciated.

## Development Environment Setup
The main requirements for building this project are Rust and Node.js. The rest of the minor packages needed are
described below. The steps for setup may vary depending on platforms. The instructions below are generalized and are
the build steps for Travis CI. Please let me know (or make a pull request) if the instruction needs extra details.

 - The installation of Node.js varies by platform. Please see the
   [Node.js Downloads Page](https://nodejs.org/en/download/) for instructions.
 - Install rustup with the 1.37.0 version of the toolchain (will likely work with newer versions, but this is the one
   that works as of August, 2019): `curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain 1.37.0 -y`
   - If you let rustup modify your PATH, restart your console before continuing
   - If you didn't let rustup modify your PATH, configure your environment: `source $HOME/.cargo/env`
 - Add WASM target to the Rust toolchain: `rustup target add wasm32-unknown-unknown`
 - Install some Rust WASM packages that will be needed: `cargo install wasm-bindgen-cli wasm-pack`
 - Build the project: `npm run build-dev` or `npm run build-prod`
   - Prod is much smoother when running in the browser, but takes a little longer to build.
   - There may be some increased debugging difficulty when building with prod vs. dev, but this is unconfirmed.
