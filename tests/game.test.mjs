import Game from "../game.js";
let size = 4;
let game = new Game(size);
game.rows(4);
game.columns(4);
//Test that the board property is set to an empty 2D array with the correct size:
    //Copy code
game.board.rows(4);
game.board[0].columns(4);
//Test that the boardFlatten function returns the correct result:
    //Copy code
game.board = [
    [new Tile(0, 0), null, new Tile(2, 2), null],
    [null, new Tile(3, 1), null, new Tile(5, 3)],
    [new Tile(6, 0), null, new Tile(8, 2), null],
    [null, new Tile(9, 1), null, new Tile(11, 3)]
];
game.boardFlatten().length(16);
//Test that the score property is set to 0:
//Copy code
game.score(0);
//Test that the moveInProgress property is set to false:
//Copy code

game.moveInProgress(false);