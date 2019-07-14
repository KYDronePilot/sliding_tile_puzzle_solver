mod tile;
mod board;
mod a_star_solver;
use tile::Tile;
use board::Board;
use board::*;
use std::collections::{BinaryHeap, HashSet};

#[macro_use]
extern crate lazy_static;

const N: i32 = 4;
const SHUFFLE_N: i32 = 50;


fn main() {
    // Priority queue for storing board leaves
    let mut board_leaves: BinaryHeap<Board> = BinaryHeap::new();
    // For holding solved leaf
    let solved_leaf: Board;
    // Holds previously seen boards
    let mut previous_boards: HashSet<Board> = HashSet::new();
    // Create the game board
    let solved_board = Board::new(N, None, -1, vec![]);
    println!("{}", solved_board.to_string());
//    let tiles = vec![
//        Tile::new(8), Tile::new(4), Tile::new(6),
//        Tile::new(3), Tile::new(7), Tile::new(1),
//        Tile::new(5), Tile::new(2), Tile::new(-1)
//    ];
    let mut unsolved_board = Board::new(N, Some(&solved_board), 0, vec![]);
    println!("{}", unsolved_board.to_string());
    // Shuffle tiles
    unsolved_board.shuffle(SHUFFLE_N);
    unsolved_board.cost = unsolved_board.get_cost();
    unsolved_board.last_direction = '\0';
    println!("{}", unsolved_board.to_string());
    // Add root node to board leaves and previous boards
    board_leaves.push(unsolved_board.clone());
    println!("{:?}", board_leaves);
    previous_boards.insert(unsolved_board.clone());
    println!("{:?}", previous_boards);

    // Solve the board using A star search
    loop {
        // Get the next best board leaf to expand
        let next_best_leaf = board_leaves.pop().unwrap();
        // Get solved leaf if solved
        if next_best_leaf.is_solved() {
            solved_leaf = next_best_leaf;
            break;
        }
//        else {
//            println!("Cost: {}, Depth: {}, Manhattan Cost: {}, Linear Conflicts: {}",
//                     next_best_leaf.get_cost(), next_best_leaf.depth,
//                     next_best_leaf._manhattan_cost(), next_best_leaf._linear_conflicts()
//            );
//            println!("{}", next_best_leaf.to_string());
//        }
        // Generate next moves for a leaf
//        let mut new_leaves: Vec<Board> = vec![];
        for tile_move in next_best_leaf.get_moves() {
            // New board for this move
            let mut new_board = next_best_leaf.clone();
            // Make move
            new_board.move_blank_tile(tile_move);
            // If resulting board has been seen before, skip it
            if previous_boards.contains(&new_board) {
                continue;
            }
            // Setup board
            new_board.path.push(tile_move);
            new_board.depth = next_best_leaf.depth + 1;
            new_board.cost = new_board.get_cost();
            board_leaves.push(new_board.clone());
            // Add to previously seen boards
            previous_boards.insert(new_board);
        }
    }
//    for leaf in board_leaves.iter() {
//        println!("{}", leaf.get_cost());
//    }
//    let walk = board_leaves.pop();
//    while walk.is_some() {
//        println!("{}", walk.unwrap().get_cost());
//    }
    println!("{}", solved_leaf.to_string());
    println!("{}", solved_leaf.path);
}
