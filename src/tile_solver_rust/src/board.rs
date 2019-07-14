use std::cmp::Ordering;
use std::collections::{HashMap, HashSet};
use std::hash::{Hash, Hasher};

use rand::seq::SliceRandom;

use super::tile::BLANK_TILE;
use super::tile::Tile;

/// Tile move directions
const UP: char = 'U';
const DOWN: char = 'D';
const LEFT: char = 'L';
const RIGHT: char = 'R';

lazy_static! {
    /// Opposite of each move direction
    pub static ref OPPOSITE_DIRECTIONS: HashMap<char, char> = {
        let mut m = HashMap::new();
        m.insert(UP, DOWN);
        m.insert(DOWN, UP);
        m.insert(LEFT, RIGHT);
        m.insert(RIGHT, LEFT);
        m
    };
}

/// All tile moves
const MOVES: [char; 4] = [UP, DOWN, LEFT, RIGHT];


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
    pub last_direction: char,
    solved_board: Option<&'a Board<'a>>,
    tiles: Vec<Tile>,
    blank_index: i32,
    pub depth: i32,
    //    pub parent_node: Option<&'a Board<'a>>,
    pub cost: i32,
    pub path: String,
}

impl Board<'_> {
    /// Create a new board with optional tiles.
    ///
    /// # Parameters
    /// * `n` - Size of the board
    /// * `solved_board` - Solved version of the board
    /// * `depth` - The depth of the board in the state-space tree
    /// * `parent_node` - The parent board from which this board was derived
    /// * `tiles` - Board tiles
    pub fn new<'a>(n: i32, solved_board: Option<&'a Board>, depth: i32,
                   mut tiles: Vec<Tile>) -> Board<'a> {
        if tiles.is_empty() {
            tiles = Tile::generate_tiles(&n);
        }
        let mut board = Board {
            n,
            n2: n * n,
            last_direction: '\0',
            solved_board,
            tiles,
            blank_index: -1,
            depth,
            cost: -1,
            path: String::new(),
        };
        board.blank_index = board.get_blank_index();
        if solved_board != None {
            board.cost = board.get_cost();
        }
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

//    /// Create the root game board.
//    ///
//    /// # Parameters
//    /// * `n` - Size of board
//    /// * `shuffle_n` - Number of times to shuffle the board
//    ///
//    /// # Returns
//    /// New game board
//    pub fn create_game_board<'a>(n: i32, shuffle_n: i32) -> Board<'a> {
//        // Create solved and unsolved boards
//        let solved_board = Board::new(n, None, -1, None, vec![]);
//        let mut unsolved_board = Board::new(n, Some(&solved_board), 0, None, vec![]);
//        // Shuffle tiles
//        unsolved_board.shuffle(shuffle_n);
//        unsolved_board
//    }

    /// Reset previous boards that have been encountered
    pub fn reset_previous_boards(previous_boards: &mut HashSet<Board>) {
        previous_boards.clear();
    }

    /// Find if board has already been encountered.
    ///
    /// # Returns
    /// Whether this board has been seen before
    pub fn previously_encountered(&self, previous_boards: &mut HashSet<Board>) -> bool {
        previous_boards.contains(self)
    }

    /// Add board to previously encountered.
    ///
    /// TODO: Consider not doing this hear to prevent the copy from taking place (move directly in)
    pub fn add_to_previously_encountered(&'static self, previous_boards: &'static mut HashSet<Board>) {
        previous_boards.insert(self.clone());
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
            let moves: Vec<char> = self.get_moves();
            // Get a random move
            let board_move = *moves.choose(&mut rand::thread_rng()).unwrap();
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
    pub fn is_valid_move(&self, move_direction: char) -> bool {
        // Check if move would be back-stepping
        if OPPOSITE_DIRECTIONS.get(&move_direction).unwrap() == &self.last_direction {
            return false;
        }
        // Check if up move would be out of bounds
        if move_direction == UP && self.blank_index - self.n < 0 {
            return false;
        }
        // Check if down move would be out of bounds
        if move_direction == DOWN && self.blank_index + self.n >= self.n2 {
            return false;
        }
        // Check if left move would be out of bounds
        if move_direction == LEFT && self.blank_index % self.n == 0 {
            return false;
        }
        // Check if right move would be out of bounds
        !(move_direction == RIGHT && (self.blank_index + 1) % self.n == 0)
    }

    /// Get the available moves that can be made.
    ///
    /// # Returns
    /// The available moves that can be made
    pub fn get_moves(&self) -> Vec<char> {
        let mut moves: Vec<char> = Vec::new();
        for tile_move in &MOVES {
            if self.is_valid_move(*tile_move) {
                moves.push(*tile_move);
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
    pub fn translate_index(&self, position: i32, move_direction: char) -> i32 {
        if move_direction == UP {
            return position - self.n;
        }
        if move_direction == DOWN {
            return position + self.n;
        }
        if move_direction == LEFT {
            return position - 1;
        }
        return position + 1;
    }

    /// Move the empty space in the specified direction.
    ///
    /// # Parameters
    /// * `move_direction` - Direction to move the blank tile
    pub fn move_blank_tile(&mut self, move_direction: char) {
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
    pub fn _manhattan_cost(&self) -> i32 {
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
    ///
    /// # Returns
    /// Cost for board
    pub fn get_cost(&self) -> i32 {
        self._manhattan_cost() + self._linear_conflicts() + self.depth
    }

    /// Check if the board is solved.
    ///
    /// # Returns
    /// Whether the board is solved
    pub fn is_solved(&self) -> bool {
        self._manhattan_cost() == 0
    }

    /// Calculate the number of linear conflicts in the board.
    ///
    /// # Returns
    /// Linear conflicts in board
    pub fn _linear_conflicts(&self) -> i32 {
        // Create tile-index maps
        let solved_row_map = self._create_tile_row_indices_map(
            self.solved_board.unwrap()
        );
        let solved_col_map = self._create_tile_column_indices_map(
            self.solved_board.unwrap()
        );
        let unsolved_row_map = self._create_tile_row_indices_map(
            self
        );
        let unsolved_col_map = self._create_tile_column_indices_map(
            self
        );
        // Already conflicting tiles
        let conflicting_tiles: &mut HashSet<Tile> = &mut HashSet::new();
        let mut total = 0;
        // Get row conflicts
        for i in 0..self.n {
            total += self._find_row_conflicts(
                i,
                conflicting_tiles,
                &solved_row_map,
                &solved_col_map,
                &unsolved_row_map,
                &unsolved_col_map,
            );
        }
        // Get column conflicts
        for i in 0..self.n {
            total += self._find_column_conflicts(
                i,
                conflicting_tiles,
                &solved_row_map,
                &solved_col_map,
                &unsolved_row_map,
                &unsolved_col_map,
            );
        }
        total
    }

    /// Find the number of linear conflicts in a row.
    ///
    /// # Parameters
    /// * `row` - Index of the row
    /// * `conflicting_tiles` - Already conflicting tiles
    /// * `solved_row_map` - Solved board map from tile to relative row index
    /// * `solved_col_map` - Solved board map from tile to relative column index
    /// * `unsolved_row_map` - Unsolved board map from tile to relative row index
    /// * `unsolved_col_map` - Unsolved board map from tile to relative column index
    ///
    /// # Returns
    /// Conflicts in column
    fn _find_row_conflicts(&self, row: i32, mut conflicting_tiles: &mut HashSet<Tile>,
                           solved_row_map: &HashMap<Tile, i32>,
                           solved_col_map: &HashMap<Tile, i32>,
                           unsolved_row_map: &HashMap<Tile, i32>,
                           unsolved_col_map: &HashMap<Tile, i32>) -> i32 {
        let mut total = 0;
        // Go through each pair of tiles in the row
        for i in 0..self.n - 1 {
            // Skip blank tile
            if self.index(row, i, None).is_blank() {
                continue;
            }
            for j in i + 1..self.n {
                // Ensure present and goal positions are in the same row
                if solved_col_map[&self.index(row, i, None)]
                    != unsolved_col_map[&self.index(row, i, None)]
                    || solved_col_map[&self.index(row, j, None)]
                    != unsolved_col_map[&self.index(row, j, None)] {
                    continue;
                }
                // Skip if already conflicting
                if conflicting_tiles.contains(&self.index(row, i, None))
                    || conflicting_tiles.contains(&self.index(row, j, None)) {
                    continue;
                }
                // Skip blank jth tile
                if self.index(row, j, None).is_blank() {
                    continue;
                }
                // Check if conflicting
                if Board::_in_conflict(
                    unsolved_row_map[&self.index(row, i, None)],
                    unsolved_row_map[&self.index(row, j, None)],
                    solved_row_map[&self.index(row, i, None)],
                    solved_row_map[&self.index(row, j, None)],
                ) {
                    total += 2;
                    conflicting_tiles.insert(self.index(row, i, None));
                    conflicting_tiles.insert(self.index(row, j, None));
                }
            }
        }
        total
    }

    /// Find the number of linear conflicts in a column.
    ///
    /// # Parameters
    /// * `col` - Index of the column
    /// * `conflicting_tiles` - Already conflicting tiles
    /// * `solved_row_map` - Solved board map from tile to relative row index
    /// * `solved_col_map` - Solved board map from tile to relative column index
    /// * `unsolved_row_map` - Unsolved board map from tile to relative row index
    /// * `unsolved_col_map` - Unsolved board map from tile to relative column index
    ///
    /// # Returns
    /// Conflicts in column
    fn _find_column_conflicts(&self, col: i32, mut conflicting_tiles: &mut HashSet<Tile>,
                              solved_row_map: &HashMap<Tile, i32>,
                              solved_col_map: &HashMap<Tile, i32>,
                              unsolved_row_map: &HashMap<Tile, i32>,
                              unsolved_col_map: &HashMap<Tile, i32>) -> i32 {
        let mut total = 0;
        // Go through each pair of tiles in the column
        for i in 0..self.n - 1 {
            // Skip blank tile
            if self.index(i, col, None).is_blank() {
                continue;
            }
            for j in i + 1..self.n {
                // Ensure present and goal positions are in the same column
                if solved_row_map[&self.index(i, col, None)]
                    != unsolved_row_map[&self.index(i, col, None)]
                    || solved_row_map[&self.index(j, col, None)]
                    != unsolved_row_map[&self.index(j, col, None)] {
                    continue;
                }
                // Skip if already conflicting
                if conflicting_tiles.contains(&self.index(i, col, None))
                    || conflicting_tiles.contains(&self.index(j, col, None)) {
                    continue;
                }
                // Skip blank jth tile
                if self.index(j, col, None).is_blank() {
                    continue;
                }
                // Check if conflicting
                if Board::_in_conflict(
                    unsolved_col_map[&self.index(i, col, None)],
                    unsolved_col_map[&self.index(j, col, None)],
                    solved_col_map[&self.index(i, col, None)],
                    solved_col_map[&self.index(j, col, None)],
                ) {
                    total += 2;
                    conflicting_tiles.insert(self.index(i, col, None));
                    conflicting_tiles.insert(self.index(j, col, None));
                }
            }
        }
        total
    }

    /// Create a map of tiles to their relative row indices.
    ///
    /// # Parameters
    /// * `board` - The board to use
    ///
    /// # Returns
    /// Map from tile to relative row index
    fn _create_tile_row_indices_map(&self, board: &Board) -> HashMap<Tile, i32> {
        let mut row_map: HashMap<Tile, i32> = HashMap::new();
        for row in 0..self.n {
            for col in 0..self.n {
                row_map.insert(self.index(row, col, Some(board)), col);
            }
        }
        row_map
    }

    /// Create a map of tiles to their relative column indices.
    ///
    /// # Parameters
    /// * `board` - The board to use
    ///
    /// # Returns
    /// Map from tile to relative column index
    fn _create_tile_column_indices_map(&self, board: &Board) -> HashMap<Tile, i32> {
        let mut col_map: HashMap<Tile, i32> = HashMap::new();
        for col in 0..self.n {
            for row in 0..self.n {
                col_map.insert(self.index(row, col, Some(board)), row);
            }
        }
        col_map
    }

//    /// Get new board leaves from making every possible move.
//    ///
//    /// # Returns
//    /// The new board leaves
//    pub fn get_move_leaves(self, previous_boards: &mut HashSet<Board>) {
//        let mut new_boards: Vec<Board> = vec![];
//        for tile_move in self.get_moves() {
//            // New board for this move
//            let mut new_board = self.clone();
//            // Make move
//            new_board.move_blank_tile(tile_move);
//            // If resulting board has been seen before, skip it
//            if new_board.previously_encountered(previous_boards) {
//                continue;
//            }
//            // Setup board
//            new_board.parent_node = Some(self);
//            new_board.depth = self.depth + 1;
//            new_board.cost = new_board.get_cost();
//            // Add to resulting boards
//            new_boards.push(new_board);
//            // Add to previously seen boards
//            new_board.add_to_previously_encountered(previous_boards);
//        }
//    }
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

impl Ord for Board<'_> {
    fn cmp(&self, other: &Self) -> Ordering {
        other.cost.cmp(&self.cost)
    }
}

impl PartialOrd for Board<'_> {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BinaryHeap;

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
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            -1,
            tiles.clone());
        assert_eq!(board.n, 3);
        assert_eq!(board.n2, 9);
        assert_eq!(board.last_direction, '\0');
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
        assert_eq!(board.depth, -1);
        assert_eq!(board.cost, 17);
        assert_eq!(board.path, "");
    }

    /// Test board cloning
    #[test]
    fn test_board_clone() {
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            -1,
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
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            -1,
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
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            -1,
            tiles.clone());
        assert_eq!(
            board.to_string(),
            "Tile 8, Tile 4, Tile 6\nTile 3, Tile 7, Tile 1\nTile 5, Tile 2,       \n".to_owned()
        );
    }

    /// Test board get blank index
    #[test]
    fn test_board_get_blank_index() {
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(BLANK_TILE), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(7)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            -1,
            tiles.clone());
        assert_eq!(board.get_blank_index(), 4);
    }

    /// Test board is valid move
    #[test]
    fn test_board_is_valid_move() {
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            -1,
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
            -1,
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
            -1,
            tiles_3.clone());
        assert!(!board_3.is_valid_move(UP));
        assert!(board_3.is_valid_move(DOWN));
        assert!(!board_3.is_valid_move(LEFT));
        assert!(board_3.is_valid_move(RIGHT));
    }

    /// Test board get moves
    #[test]
    fn test_board_get_moves() {
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            -1,
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
            -1,
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
            -1,
            tiles_3.clone());
        assert_eq!(board_3.get_moves(), [DOWN, RIGHT]);
    }

    /// Test board index translation
    #[test]
    fn test_board_index_translation() {
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            -1,
            tiles.clone());
        assert_eq!(board.translate_index(0, DOWN), 3);
        assert_eq!(board.translate_index(0, RIGHT), 1);
        assert_eq!(board.translate_index(8, UP), 5);
        assert_eq!(board.translate_index(8, LEFT), 7);
    }

    /// Test board move blank tile - UP
    #[test]
    fn test_board_move_blank_tile_up() {
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            -1,
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
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            -1,
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
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(BLANK_TILE), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(8), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(7)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            -1,
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
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(BLANK_TILE), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(8), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(7)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            -1,
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
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let board = Board::new(
            3,
            Some(&solved_board),
            -1,
            tiles.clone());
        assert_eq!(board._manhattan_cost(), 18);
    }

    /// Test board shuffle
    #[test]
    fn test_board_shuffle() {
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            -1,
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
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            -1,
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
            -1,
            tiles_2.clone());
        assert!(board_2.is_solved());
    }

    /// Test board create tile row indices map
    #[test]
    fn test_create_tile_row_indices_map() {
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            -1,
            tiles.clone());
        let mut row_map: HashMap<Tile, i32> = HashMap::new();
        row_map.insert(Tile::new(8), 0);
        row_map.insert(Tile::new(4), 1);
        row_map.insert(Tile::new(6), 2);
        row_map.insert(Tile::new(3), 0);
        row_map.insert(Tile::new(7), 1);
        row_map.insert(Tile::new(1), 2);
        row_map.insert(Tile::new(5), 0);
        row_map.insert(Tile::new(2), 1);
        row_map.insert(Tile::new(BLANK_TILE), 2);
        assert_eq!(board._create_tile_row_indices_map(&board), row_map)
    }

    /// Test board create tile column indices map
    #[test]
    fn test_create_tile_column_indices_map() {
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            -1,
            tiles.clone());
        let mut col_map: HashMap<Tile, i32> = HashMap::new();
        col_map.insert(Tile::new(8), 0);
        col_map.insert(Tile::new(3), 1);
        col_map.insert(Tile::new(5), 2);
        col_map.insert(Tile::new(4), 0);
        col_map.insert(Tile::new(7), 1);
        col_map.insert(Tile::new(2), 2);
        col_map.insert(Tile::new(6), 0);
        col_map.insert(Tile::new(1), 1);
        col_map.insert(Tile::new(BLANK_TILE), 2);
        assert_eq!(board._create_tile_column_indices_map(&board), col_map)
    }

    /// Test board linear conflicts
    #[test]
    fn test_board_linear_conflicts() {
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(1), Tile::new(7), Tile::new(3),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            -1,
            tiles.clone());
        assert_eq!(board._linear_conflicts(), 2);
    }

    /// Test board get cost
    #[test]
    fn test_board_get_cost() {
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        let mut board = Board::new(
            3,
            Some(&solved_board),
            -1,
            tiles.clone());
        board.depth = 5;
        assert_eq!(board.get_cost(), 23);
    }

    /// Test board priority queue
    /// - Ensure the priority queue acting as it should
    #[test]
    fn test_board_priority_queue() {
        let solved_board = Board::new(3, None, -1, vec![]);
        let tiles = vec![
            Tile::new(8), Tile::new(4), Tile::new(6),
            Tile::new(3), Tile::new(7), Tile::new(1),
            Tile::new(5), Tile::new(2), Tile::new(BLANK_TILE)
        ];
        // Create some boards with manually entered costs and shuffle to make them different
        let mut board = Board::new(
            3, Some(&solved_board), -1, tiles.clone());
        board.cost = 17;
        board.shuffle(1000);
        let mut board_2 = Board::new(
            3, Some(&solved_board), -1, tiles.clone());
        board_2.cost = 5;
        board_2.shuffle(1000);
        let mut board_3 = Board::new(
            3, Some(&solved_board), -1, tiles.clone());
        board_3.cost = 1;
        board_3.shuffle(1000);
        let mut board_4 = Board::new(
            3, Some(&solved_board), -1, tiles.clone());
        board_4.cost = 5;
        board_4.shuffle(1000);
        let mut board_5 = Board::new(
            3, Some(&solved_board), -1, tiles.clone());
        board_5.cost = 7;
        board_5.shuffle(1000);
        // Assert all the costs for verification purposes
        assert_eq!(board.cost, 17);
        assert_eq!(board_2.cost, 5);
        assert_eq!(board_3.cost, 1);
        assert_eq!(board_4.cost, 5);
        assert_eq!(board_5.cost, 7);
        // Ensure they are all different
        let boards = [&board, &board_2, &board_3, &board_4, &board_5];
        for i in 0..5 {
            for j in i + 1..5 {
                assert_ne!(boards[i], boards[j]);
            }
        }
        // Load into PQ
        let mut pq: BinaryHeap<&Board> = BinaryHeap::new();
        pq.push(&board);
        pq.push(&board_2);
        pq.push(&board_3);
        pq.push(&board_4);
        pq.push(&board_5);
        // Pull out and assert the order in which they come out
        assert_eq!(pq.pop().unwrap(), &board_3);
        let same = pq.pop();
        assert!(same.unwrap() == &board_2 || same.unwrap() == &board_4);
        let same_2 = pq.pop();
        assert!(same_2.unwrap() == &board_2 || same_2.unwrap() == &board_4);
        assert_eq!(pq.pop().unwrap(), &board_5);
        assert_eq!(pq.pop().unwrap(), &board);
    }
}
