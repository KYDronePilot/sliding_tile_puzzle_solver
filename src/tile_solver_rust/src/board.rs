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
#[derive(Debug)]
pub struct Board<'a> {
    n: i32,
    n2: i32,
    last_direction: String,
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
            last_direction: String::from(""),
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
    pub fn get_blank_index(&mut self) -> i32 {
        for i in 0..self.n2 {
            if self.tiles[i as usize].is_blank() {
                return i;
            }
        }
        return -1;
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
}
