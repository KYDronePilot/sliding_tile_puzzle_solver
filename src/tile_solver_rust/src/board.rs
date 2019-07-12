use std::collections::HashMap;

use super::tile::BLANK_TILE;
use super::tile::Tile;
use rand::seq::SliceRandom;
use std::hash::{Hash, Hasher};

/// Tile move directions
const UP: &'static str = "up";
const DOWN: &'static str = "down";
const LEFT: &'static str = "left";
const RIGHT: &'static str = "right";

lazy_static! {
    /// Opposite of each move direction
    pub static ref OPPOSITE_DIRECTIONS: HashMap<&'static str, &'static str> = {
        let mut m = HashMap::new();
        m.insert(UP, DOWN);
        m.insert(DOWN, UP);
        m.insert(LEFT, RIGHT);
        m.insert(RIGHT, LEFT);
        m
    };
}

/// All tile moves
const MOVES: [&str; 4] = [UP, DOWN, LEFT, RIGHT];


/// The layout of the game board.
///
/// * Author - Michael Galliers
///
/// # Attributes
/// * `n` - Size of board
/// * `n2` - Number of tiles in board
/// * `last_direction` - Direction of last move made
/// * `solved_board` - Solved version of board
/// * `tiles` - Board tiles
/// * `blank_index` - Index of blank tile on board
#[derive(Debug, Clone)]
pub struct Board<'a> {
    n: i32,
    n2: i32,
    last_direction: &'a str,
    solved_board: Option<&'a Board<'a>>,
    tiles: Vec<Tile>,
    blank_index: i32,
}

impl Board<'_> {
    /// Create a new board with optional tiles.
    ///
    /// # Parameters
    /// * `n` - Size of the board
    /// * `solved_board` - Solved version of the board
    /// * `tiles` - Board tiles
    pub fn new<'a>(n: i32, solved_board: Option<&'a Board>, mut tiles: Vec<Tile>) -> Board<'a> {
        if tiles.is_empty() {
            tiles = Tile::generate_tiles(&n);
        }
        let mut board = Board {
            n,
            n2: n * n,
            last_direction: "",
            solved_board,
            tiles,
            blank_index: -1,
        };
        board.blank_index = board.get_blank_index();
        board
    }

    /// Get index of the blank tile.
    ///
    /// # Returns
    /// Index of blank tile
    pub fn get_blank_index(&self) -> i32 {
        for i in 0..self.n2 as usize {
            if self.tiles[i].is_blank() {
                return i as i32;
            }
        }
        return -1;
    }

    /// Check if two tiles are in linear conflict.
    /// * Indices are 0-indexed and relative to the row/column they are in.
    ///
    /// # Parameters
    /// * `tile_1` - Index of first tile
    /// * `tile_2` - Index of first tile
    /// * `tile_1_goal` - Goal index of first tile
    /// * `tile_2_goal` - Goal index of second tile
    ///
    /// # Returns
    /// Whether they are in linear conflict
    fn _in_conflict(tile_1: i32, tile_2: i32, tile_1_goal: i32, tile_2_goal: i32) -> bool {
        (tile_1 < tile_2 && tile_1_goal > tile_2_goal) ||
            (tile_1 > tile_2 && tile_1_goal < tile_2_goal)
    }

    /// Shortcut for indexing the board tiles like a 2-dim array.
    /// TODO: Consider changing tile to array of references to improve performance
    ///
    /// # Parameters
    /// * `row` - Row index
    /// * `col` - Column index
    /// * `board` - The board to index (default: self)
    ///
    /// # Returns
    /// Tile at index specified
    pub fn index(&self, row: i32, col: i32, board: Option<&Board>) -> Tile {
        let board = if board == None { self } else { board.unwrap() };
        board.tiles[(row * self.n + col) as usize]
    }

    /// Shuffle the tiles using valid moves to ensure the puzzle is solvable.
    ///
    /// # Parameters
    /// * `n` - Number of random moves to make
    pub fn shuffle(&mut self, n: i32) {
        for _i in 0..n {
            // Update the blank index
            self.blank_index = self.get_blank_index();
            // Get all valid moves
            let moves: Vec<&'static str> = self.get_moves();
            // Get a random move
            let board_move: &'static str = *moves.choose(&mut rand::thread_rng()).unwrap();
            // Perform that move
            self.move_blank_tile(board_move);
        }
        // Update the blank index
        self.blank_index = self.get_blank_index();
    }

    /// Check if a move is valid.
    ///
    /// # Params
    /// * `move_direction` - Direction to move
    ///
    /// # Returns
    /// Whether or not the move is valid
    pub fn is_valid_move(&self, move_direction: &str) -> bool {
        // Check if move would be back-stepping
        if OPPOSITE_DIRECTIONS.get(&move_direction).unwrap() == &self.last_direction {
            return false
        }
        // Check if up move would be out of bounds
        if move_direction == UP && self.blank_index - self.n < 0 {
            return false
        }
        // Check if down move would be out of bounds
        if move_direction == DOWN && self.blank_index + self.n >= self.n2 {
            return false
        }
        // Check if left move would be out of bounds
        if move_direction == LEFT && self.blank_index % self.n == 0 {
            return false
        }
        // Check if right move would be out of bounds
        !(move_direction == RIGHT && (self.blank_index + 1) % self.n == 0)
    }

    /// Get the available moves that can be made.
    ///
    /// # Returns
    /// The available moves that can be made
    pub fn get_moves(&self) -> Vec<&'static str> {
        let mut moves: Vec<&'static str> = Vec::new();
        for tile_move in &MOVES {
            if self.is_valid_move(tile_move) {
                moves.push(tile_move);
            }
        }
        return moves;
    }

    /// Translate tile indices based on position and move direction.
    ///
    /// # Parameters
    /// * `position` - Index of tile
    /// * `move_direction` - Direction to move
    ///
    /// # Returns
    /// Resulting index from translation
    pub fn translate_index(&self, position: i32, move_direction: &str) -> i32 {
        if move_direction == UP {
            return position - self.n
        }
        if move_direction == DOWN {
            return position + self.n
        }
        if move_direction == LEFT {
            return position - 1
        }
        return position + 1
    }

    /// Move the empty space in the specified direction.
    ///
    /// # Parameters
    /// * `move_direction` - Direction to move the blank tile
    pub fn move_blank_tile(&mut self, move_direction: &'static str) {
        // Get index to swap with
        let swap_i = self.translate_index(self.blank_index, move_direction);
        self.tiles.swap(swap_i as usize, self.blank_index as usize);
        // Update last move direction and blank index
        self.last_direction = move_direction;
        self.blank_index = swap_i;
    }

    /// Get the Manhattan cost of the current board compared with the solved board.
    ///
    /// # Returns
    /// Manhattan cost of board
    fn _manhattan_cost(&self) -> i32 {
        let mut cost = 0;
        // Check each tile
        for i in 0..self.n2 {
            // Do not use blank tile
            if i == self.blank_index {
                continue;
            }
            // Get index of tile in solved board
            let mut solved_i = -1;
            for j in 0..self.n2 {
                if self.solved_board.unwrap().tiles[j as usize] == self.tiles[i as usize] {
                    solved_i = j;
                    break;
                }
            }
            // Get distance for x-axis
            cost += ((i % self.n) - (solved_i % self.n)).abs();
            // Get distance for y-axis
            cost += ((i / self.n) - (solved_i / self.n)).abs();
        }
        return cost;
    }

    /// Cost/heuristic function for board.
    /// TODO: Add linear conflicts and a test
    ///
    /// # Returns
    /// Cost for board
    pub fn get_cost(&self) -> i32 {
        self._manhattan_cost()
    }

    /// Check if the board is solved.
    ///
    /// # Returns
    /// Whether the board is solved
    pub fn is_solved(&self) -> bool {
        self._manhattan_cost() == 0
    }
}

impl PartialEq for Board<'_> {
    /// Custom equivalence function based only on tiles
    fn eq(&self, other: &Self) -> bool {
        self.tiles == other.tiles
    }
}

impl Eq for Board<'_> {}

impl Hash for Board<'_> {
    /// Custom hash function based only on tiles.
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.tiles.hash(state)
    }
}

impl ToString for Board<'_> {
    fn to_string(&self) -> String {
        let mut result: String = "".to_owned();
        for row in 0..self.n {
            for col in 0..self.n - 1 {
                result.push_str(&self.index(row, col, None).to_string());
                result.push_str(", ");
            }
            result.push_str(&self.index(row, self.n - 1, None).to_string());
            result.push_str("\n");
        }
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Test opposite directions hashmap
    #[test]
    fn test_opposite_directions_hashmap() {
        assert_eq!(OPPOSITE_DIRECTIONS.get(&UP).unwrap(), &DOWN);
        assert_eq!(OPPOSITE_DIRECTIONS.get(&DOWN).unwrap(), &UP);
        assert_eq!(OPPOSITE_DIRECTIONS.get(&RIGHT).unwrap(), &LEFT);
        assert_eq!(OPPOSITE_DIRECTIONS.get(&LEFT).unwrap(), &RIGHT);
    }

    /// Test board construction
    #[test]
    fn test_board_construction() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        assert_eq!(board.n, 3);
        assert_eq!(board.n2, 9);
        assert_eq!(board.last_direction, "");
        assert_eq!(board.blank_index, 8);
        assert_eq!(board.tiles, vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ]);
        assert_eq!(board.solved_board.unwrap().tiles, vec![
            Tile::new(1), Tile::new(2), Tile::new(3),
            Tile::new(4), Tile::new(5), Tile::new(6),
            Tile::new(7), Tile::new(8), Tile::new(BLANK_TILE)
        ]);
    }

    /// Test board cloning
    #[test]
    fn test_board_clone() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        let board_2 = board.clone();
        assert_eq!(board.tiles, board_2.tiles);
        assert_eq!(board.solved_board.unwrap(), board_2.solved_board.unwrap());
        assert_eq!(board.blank_index, board_2.blank_index);
        assert_eq!(board.last_direction, board_2.last_direction);
        assert_eq!(board.n, board_2.n);
        assert_eq!(board.n2, board_2.n2);
    }

    /// Test board in conflict
    #[test]
    fn test_board_in_conflict() {
        assert!(Board::_in_conflict(0, 1, 1, 0));
        assert!(Board::_in_conflict(0, 1, 2, 1));
        assert!(!Board::_in_conflict(0, 1, 0, 1));
        assert!(!Board::_in_conflict(0, 2, 1, 2));
    }

    /// Test board index
    #[test]
    fn test_board_index() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        assert_eq!(board.index(0, 0, None), Tile::new(8));
        assert_eq!(board.index(0, 1, None), Tile::new(4));
        assert_eq!(board.index(0, 2, None), Tile::new(6));
        assert_eq!(board.index(2, 2, None), Tile::new(BLANK_TILE));
        assert_eq!(board.index(1, 1, None), Tile::new(7));
    }

    /// Test board to string
    #[test]
    fn test_board_to_string() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        assert_eq!(
            board.to_string(),
            "Tile 8, Tile 4, Tile 6\nTile 3, Tile 7, Tile 1\nTile 5, Tile 2,       \n".to_owned()
        );
    }

    /// Test board get blank index
    #[test]
    fn test_board_get_blank_index() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(BLANK_TILE), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(7)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        assert_eq!(board.get_blank_index(), 4);
    }

    /// Test board is valid move
    #[test]
    fn test_board_is_valid_move() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        assert!(board.is_valid_move(UP));
        assert!(!board.is_valid_move(DOWN));
        assert!(board.is_valid_move(LEFT));
        assert!(!board.is_valid_move(RIGHT));
        let tiles_2 = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(BLANK_TILE), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(7)
        ];
        let board_2 = Board::new(
            3,
            Some(&solved_board),
            tiles_2.clone());
        assert!(board_2.is_valid_move(UP));
        assert!(board_2.is_valid_move(DOWN));
        assert!(board_2.is_valid_move(LEFT));
        assert!(board_2.is_valid_move(RIGHT));
        let tiles_3 = vec![
            Tile::new(BLANK_TILE), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(8), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(7)
        ];
        let board_3 = Board::new(
            3,
            Some(&solved_board),
            tiles_3.clone());
        assert!(!board_3.is_valid_move(UP));
        assert!(board_3.is_valid_move(DOWN));
        assert!(!board_3.is_valid_move(LEFT));
        assert!(board_3.is_valid_move(RIGHT));
    }

    /// Test board get moves
    #[test]
    fn test_board_get_moves() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        assert_eq!(board.get_moves(), [UP, LEFT]);
        let tiles_2 = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(BLANK_TILE), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(7)
        ];
        let board_2 = Board::new(
            3,
            Some(&solved_board),
            tiles_2.clone());
        assert_eq!(board_2.get_moves(), [UP, DOWN, LEFT, RIGHT]);
        let tiles_3 = vec![
            Tile::new(BLANK_TILE), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(8), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(7)
        ];
        let board_3 = Board::new(
            3,
            Some(&solved_board),
            tiles_3.clone());
        assert_eq!(board_3.get_moves(), [DOWN, RIGHT]);
    }

    /// Test board index translation
    #[test]
    fn test_board_index_translation() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        assert_eq!(board.translate_index(0, DOWN), 3);
        assert_eq!(board.translate_index(0, RIGHT), 1);
        assert_eq!(board.translate_index(8, UP), 5);
        assert_eq!(board.translate_index(8, LEFT), 7);
    }

    /// Test board move blank tile - UP
    #[test]
    fn test_board_move_blank_tile_up() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        board.move_blank_tile(UP);
        assert_eq!(board.tiles, vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(BLANK_TILE),
            Tile::new(5), Tile::new(2), Tile::new(1)
        ])
    }

    /// Test board move blank tile - LEFT
    #[test]
    fn test_board_move_blank_tile_left() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        board.move_blank_tile(LEFT);
        assert_eq!(board.tiles, vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(BLANK_TILE), Tile::new(2)
        ])
    }

    /// Test board move blank tile - DOWN
    #[test]
    fn test_board_move_blank_tile_down() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(BLANK_TILE), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(8), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(7)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        board.move_blank_tile(DOWN);
        assert_eq!(board.tiles, vec![
            Tile::new(3), Tile::new(4), Tile::new(6),
            Tile::new(BLANK_TILE), Tile::new(8), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(7)
        ])
    }

    /// Test board move blank tile - RIGHT
    #[test]
    fn test_board_move_blank_tile_right() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(BLANK_TILE), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(8), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(7)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        board.move_blank_tile(RIGHT);
        assert_eq!(board.tiles, vec![
            Tile::new(4), Tile::new(BLANK_TILE), Tile::new(6),
            Tile::new(3), Tile::new(8), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(7)
        ])
    }

    /// Test board get manhattan cost
    #[test]
    fn test_board_get_manhattan_cost() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        assert_eq!(board._manhattan_cost(), 18);
    }

    /// Test board shuffle
    #[test]
    fn test_board_shuffle() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        board.shuffle(1000);
        println!("{}", board.to_string());
        assert_ne!(board.tiles, vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ]);
    }

    /// Test board is solved
    #[test]
    fn test_board_is_solved() {
        let solved_board = Board::new(3, None, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            tiles.clone());
        assert!(!board.is_solved());
        let tiles_2 = vec![
            Tile::new(1), Tile::new(2), Tile::new(3),
            Tile::new(4), Tile::new(5), Tile::new(6),
            Tile::new(7), Tile::new(8), Tile::new(BLANK_TILE)
        ];
        let mut board_2 = Board::new(
            3,
            Some(&solved_board),
            tiles_2.clone());
        assert!(board_2.is_solved());
    }
}
