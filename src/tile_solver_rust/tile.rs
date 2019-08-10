/// Symbol for blank tile
pub const BLANK_TILE: i32 = -1;

/// Simple representation of a tile in the board.
/// * `symbol` - Symbol to represent tile
#[derive(Debug, Hash, PartialEq, Eq, Copy, Clone)]
pub struct Tile {
    symbol: i32
}

impl Tile {
    /// Construct a new tile.
    ///
    /// # Parameters
    /// * `symbol` - Symbol to represent tile
    pub fn new(symbol: i32) -> Tile {
        Tile { symbol }
    }

    /// Check if tile is blank.
    ///
    /// # Returns
    /// Whether or not the tile is blank
    pub fn is_blank(&self) -> bool {
        self.symbol == BLANK_TILE
    }

    /// Generate tiles for a solved game board.
    ///
    /// # Parameters
    /// * `boardSize` - Number of tiles to generate
    ///
    /// # Returns
    /// Generated tiles
    pub fn generate_tiles(n: i32) -> Box<[Tile]> {
        let mut tiles: Vec<Tile> = Vec::with_capacity(n as usize);
        // Generate the first boardSize - 1 tiles
        for i in 1..(n * n) {
            tiles.push(Tile::new(i));
        }
        // Add on the blank tile
        tiles.push(Tile::new(BLANK_TILE));
        tiles.into_boxed_slice()
    }
}

impl ToString for Tile {
    /// Format the tile symbol.
    ///
    /// # Returns
    /// The formatted tile symbol
    fn to_string(&self) -> String {
        if self.is_blank() {
            return "      ".to_string();
        }
        format!("Tile {}", self.symbol)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Test tile construction
    #[test]
    fn test_tile_construction() {
        let tile = Tile::new(1);
        assert_eq!(tile.symbol, 1);
    }

    /// Test tile to string
    #[test]
    fn test_tile_to_string() {
        let tile = Tile::new(1);
        assert_eq!(tile.to_string(), "Tile 1");
        let tile_2 = Tile::new(BLANK_TILE);
        assert_eq!(tile_2.to_string(), "      ");
    }

    /// Test tile equivalence
    #[test]
    fn test_tile_equivalence() {
        let tile = Tile::new(1);
        let tile_2 = Tile::new(2);
        assert_ne!(tile, tile_2);
        let tile_3 = Tile::new(1);
        assert_eq!(tile, tile_3);
    }

    /// Test tile is blank
    #[test]
    fn test_tile_is_blank() {
        let tile = Tile::new(1);
        assert!(!tile.is_blank());
        let tile_2 = Tile::new(BLANK_TILE);
        assert!(tile_2.is_blank());
    }

    /// Test tile is blank
    #[test]
    fn test_tile_generate_tiles() {
        let tiles = Tile::generate_tiles(2);
        assert_eq!(tiles, [Tile::new(1), Tile::new(2),
                           Tile::new(3), Tile::new(BLANK_TILE)]);
    }
}
