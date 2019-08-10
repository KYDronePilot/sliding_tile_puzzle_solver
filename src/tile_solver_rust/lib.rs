#[macro_use]
extern crate lazy_static;

extern crate rand;
extern crate wasm_bindgen;
extern crate web_sys;

mod board;
mod tile;

use board::Board;
use std::collections::{BinaryHeap, HashSet};
use tile::Tile;
use wasm_bindgen::prelude::*;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
//macro_rules! log {
//    ( $( $t:tt )* ) => {
//        web_sys::console::log_1(&format!( $( $t )* ).into());
//    }
//}

/// Wasm entry point for Rust tile puzzle solver.
///
/// # Parameters
/// * `board_info` - Board info in the following format:
///     * "<board size>(,<tile symbol>)*" (Note the regex used)
///
/// # Returns
/// String of single characters representing solution moves
#[wasm_bindgen]
pub fn solve_board(board_info: &str) -> String {
    let split_board_info: Vec<&str> = board_info.split(',').collect();
    // Get size of board
    let n = split_board_info[0].parse::<i32>().unwrap();
    let tiles: Vec<Tile> = split_board_info[1..]
        .iter()
        .map(|&tile_id| Tile::new(tile_id.parse().unwrap()))
        .collect();
    solve_main(n, tiles)
}


/// Main function of tile solver.
///
/// # Parameters
/// * `boardSize` - Size of the board
/// * `tiles` - Tiles that make up the board
///
/// # Returns
/// String of single characters representing solution moves
fn solve_main(n: i32, tiles: Vec<Tile>) -> String {
    // Priority queue for storing leaf boards in state space tree
    let mut board_leaves: BinaryHeap<Board> = BinaryHeap::new();
    // Previously seen paths
    let mut previous_paths: HashSet<String> = HashSet::new();
    // Create the game board
    let solved_board = Board::new(n, None, -1, None);
    let unsolved_board = Board::new(
        n,
        Some(&solved_board),
        0,
        Some(tiles.into_boxed_slice()),
    );
    // Add path to previously seen and root board to leaves PQ
    previous_paths.insert(unsolved_board.path.clone());
    board_leaves.push(unsolved_board);

    // Loop until solved
    loop {
        // Get the next best board leaf to expand
        let next_best_leaf = board_leaves.pop().unwrap();
        // Return path if solved
        if next_best_leaf.is_solved() {
            return next_best_leaf.path;
        }
        // Expand the next best leaf
        for tile_move in next_best_leaf.get_moves() {
            let mut new_board = next_best_leaf.clone();
            // If resulting board has been seen before, skip it
            new_board.path.push(tile_move);
            if previous_paths.contains(&new_board.path) {
                continue;
            }
            // Make move
            new_board.move_blank_tile(tile_move);
            // Setup new board
            new_board.depth = next_best_leaf.depth + 1;
            new_board.cost = new_board.get_cost(&solved_board);
            // Add to previous paths and leaves
            previous_paths.insert(new_board.path.clone());
            board_leaves.push(new_board);
        }
    }
}
