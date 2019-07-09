use std::collections::HashMap;

use super::tile::BLANK_TILE;
use super::tile::Tile;

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

//    /// Shuffle the tiles using valid moves to ensure the puzzle is solvable.
//    ///
//    /// # Parameters
//    /// * `n` - Number of random moves to make
//    pub fn shuffle(&mut self, n: i32) {
//        for i in 0..n {
//            // Update the blank index
//            self.blank_index = self.get_blank_index();
//            // Get all valid moves
//            // TODO: Implement get_moves
//            let moves = self.
//        }
//    }

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
    pub fn get_moves(&self) -> Vec<&str> {
        let mut moves: Vec<&str> = Vec::new();
        for tile_move in &MOVES {
            if self.is_valid_move(tile_move) {
                moves.push(tile_move);
            }
        }
        return moves;
    }
}

impl PartialEq for Board<'_> {
    fn eq(&self, other: &Self) -> bool {
        self.tiles == other.tiles
    }
}

impl Eq for Board<'_> {}

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
}
