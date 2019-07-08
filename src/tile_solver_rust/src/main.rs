mod tile;
mod board;
use tile::Tile;

#[macro_use]
extern crate lazy_static;

fn main() {
    println!("Hello, world!");
    let tile: Tile = Tile::new(-1);
    println!("{}", tile.to_string());

    let n = 3;
    let tiles = Tile::generate_tiles(&n);
    println!("{:?}", tiles);
    println!("{}", n);
}
