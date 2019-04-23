# A Star Tile Puzzle Solver

This is a React JS application for solving the 15-tile puzzle using the A* searching algorithm.

*Note*: The program is not perfect and will freeze up occasionally, depending on the number of times the board has been
shuffled, and on random chance. (This can freeze the browser)

## Usage
The program is built with react and needs specialized components to run properly. Please follow these instructions to
run the app:

1. Download and install node.js
2. Go into the main project directory (where this file is located)
3. Run `npm install`
4. Run `npm run start`

You browser should now be launched with the program being displayed.

Click the solve button and watch it be solved.

## Algorithm
The algorithm for solving this problem is a simple implementation of the A* search algorithm. It maintains a priority
queue of board leaves of the solution paths tree. This priority queue is prioritized by the node with the lowest heuristic
value, which is the depth in the tree + the manhattan distance for each of the nodes compared with the solved version of
the board. Here are the basics steps of operation:

 - Remove a board from the priority queue.
 - If solved, exit.
 - Generate new boards for each of the possible moves that can be made from that board.
 - If any of those boards have been seen before, discard.
 - Add new boards to the priority queue.
