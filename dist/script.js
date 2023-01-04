function gameStart() {
  window.game = new Game(4);
  window.game.initialize();
}
$(document).ready(gameStart);

/* Board */
function Game(size) {
  this.rows = size;
  this.columns = size;
  this.score = 0;
  this.board = [];
  this.moveInProgress = false;

  this.boardFlatten = function () {
    return _.flatten(this.board);
  };

  $('[data-js="score"]').html(this.score.toString());
}

/* Initialisations */
Game.prototype.initialize = function () {
  $(".grid").empty();
  $(".tile-container").empty();

  this.initBoard();
  this.initTile();
  this.initEventListeners();
};

//Grid init
Game.prototype.initBoard = function () {
  function initGridCell(x, y) {
    let getGridCell = $.parseHTML($("#template_grid_cell").html());
    $(getGridCell).appendTo(".grid");
    return {
      x: x,
      y: y,
      tilesArray: []
    };
  }

  for (let x = 0; x < this.rows; x++) {
    let newArray = [];
    this.board.push(newArray);
    for (let y = 0; y < this.columns; y++) {
      let gridObj = initGridCell(x, y);
      let rowCell = this.board[x];
      rowCell.push(gridObj);
    }
  }
};

Game.prototype.initTile = function () {
  this.isGameOver();
  let emptyCell = this.getRandomEmptyCell();
  let tile = new Tile(emptyCell.x, emptyCell.y, game);
  this.isGameOver();
};

Game.prototype.initEventListeners = function () {
  let self = this;
  let getGameboard = document.getElementById("touchGameboard");

  window.hammertime && window.hammertime.destroy();
  window.hammertime = new Hammer(getGameboard, {
    recognizers: [[Hammer.Swipe, { direction: Hammer.DIRECTION_ALL }]] });

  window.hammertime.
  on("swipeleft", function (ev) {
    self.move("left");
  }).
  on("swiperight", function (ev) {
    self.move("right");
  }).
  on("swipedown", function (ev) {
    self.move("down");
  }).
  on("swipeup", function (ev) {
    self.move("up");
  });

  $(document).off("keydown.move").on("keydown.move", function (event) {
    event.preventDefault();
    switch (event.which) {
      // left
      case 37:
        self.move("left");
        break;
      // up
      case 38:
        self.move("up");
        break;
      // right
      case 39:
        self.move("right");
        break;
      // down
      case 40:
        self.move("down");
        break;}

  });

  $('[data-js="newGame"]').off("click.newGame").on("click.newGame", window.gameStart);

};

Game.prototype.gameWon = function () {
  alert("You won!");
};

Game.prototype.gameLost = function () {
  alert("You lose :(");
};

Game.prototype.isGameOver = function () {
  let gameBoard = this.boardFlatten();
  let is2048 = false;
  let canAnyTileMove = false;
  let hasEmptyCells = false;

  gameBoard.forEach(function (val, index, array) {
    val.tilesArray.forEach(function (val, index, array) {
      if (val.valueProp === 2048) {
        is2048 = true;
      }
    });
  });

  if (this.getEmptyCells().length > 0) {
    hasEmptyCells = true;
  }

  gameBoard.forEach(function (val, index, array) {
    val.tilesArray.forEach(function (val, index, array) {
      val.moveCheck();
      if (val.canMove === true) {
        canAnyTileMove = true;
      }
    });
  });

  if (is2048) {
    this.gameWon();
    return true;
  } else if (!hasEmptyCells && !canAnyTileMove) {
    // if no empty cells, no tile can move
    this.gameLost();
    return true;
  } else {
    // if there is an empty, a tile can move
    return false;
  }
};

Game.prototype.getEmptyCells = function () {
  let emptyCells = _.filter(this.boardFlatten(), function (val) {
    return !val.tilesArray.length;
  });
  return emptyCells;
};

Game.prototype.getRandomEmptyCell = function () {
  let emptyGridCells = this.getEmptyCells();
  let randomIndex = Math.floor(
      Math.random() * Math.floor(emptyGridCells.length));

  return emptyGridCells[randomIndex];
};

Game.prototype.TileMerge = function () {
  let gameBoard = this.boardFlatten();
  let newScore = this.score;

  gameBoard.forEach(function (val, index, array) {
    if (val.tilesArray.length === 2) {
      let currentValue = val.tilesArray[0].valueProp;
      val.tilesArray[0].value = currentValue * 2;
      let x = val.tilesArray.pop();
      x.el.remove();
      newScore += currentValue;
    }
  });

  this.score = newScore;
  $('[data-js="score"]').html(this.score.toString());
};

Game.prototype.moveAnimations = function (gameBoard) {
  let self = this;
  let promiseArray = [];

  if (this.moveInProgress) {
    return false;
  }

  this.moveInProgress = true;
  gameBoard.forEach(function (val, index, array) {
    val.tilesArray.forEach(function (val, index, array) {
      promiseArray.push(val.animatePosition());
    });
  });

  $.when.apply($, promiseArray).then(function () {
    self.moveInProgress = false;
    self.TileMerge();
    self.initTile();
  });
  if (promiseArray.length === 0) {
    self.moveInProgress = false;
    self.TileMerge();
    self.initTile();
  }
};

Game.prototype.move = function (getDirection) {
  let gameBoard;
  let direction = getDirection.toLowerCase();
  let hasAnyTileMoved = false;

  if (this.moveInProgress) { return false; }

  if (direction === "up") {
    gameBoard = _.orderBy(this.boardFlatten(), "y", "asc");
  } else if (direction === "right") {
    gameBoard = _.orderBy(this.boardFlatten(), "x", "desc");
  } else if (direction === "down") {
    gameBoard = _.orderBy(this.boardFlatten(), "y", "desc");
  } else if (direction === "left") {
    gameBoard = _.orderBy(this.boardFlatten(), "y", "asc");
  }

  gameBoard.forEach(function (val, index, array) {
    val.tilesArray.length ?
    val.tilesArray.forEach(function (val) {
      if (val.move(direction, true)) {
        hasAnyTileMoved = true;
        val.move(direction);
      }
    }) :
    false;
  });

  hasAnyTileMoved ? this.moveAnimations(gameBoard) : false;
};

function Tile(x, y, game) {
  this.game = game;
  this.el; //for JQuerry
  this.x = x; // current position
  this.y = y;
  this.valueProp = 2;
  Object.defineProperties(this, {
    value: {
      get: function () {
        return this.valueProp;
      },
      set: function (val) {
        this.valueProp = val;
        this.el.find(".tile_number").html(this.valueProp).attr("data-value", val);
      }
    }
  });

  this.canMove = false;
  this.initialize();
}

Tile.prototype.initialize = function () {
  let getTile = $.parseHTML($("#template_tile").html());
  this.el = $(getTile);
  this.el.find(".tile_number").html(this.valueProp).attr("data-value", 2);
  this.setPosition(this.x, this.y);
  this.animatePosition(true);
  this.el.appendTo(".tile-container");
};

Tile.prototype.setPosition = function (getX, getY) {
  this.x = getX;
  this.y = getY;
  this.game.board[getX][getY].tilesArray.push(this);
};

Tile.prototype.removeOldPosition = function (getX, getY) {
  this.game.board[getX][getY].tilesArray.pop();
};

Tile.prototype.animatePosition = function (initalizeFlag) {
  let self = this;
  let fromLeft = this.x * (100 / this.game.rows);
  let fromTop = this.y * (100 / this.game.columns);
  let animationDuration = 175;
  let getPromise = $.Deferred();

  if (initalizeFlag) {
    this.el.addClass("initialize");
  } else {
    this.el.removeClass("initialize");
  }

  function resolvePromise() {
    getPromise.resolve();
    self.el.removeClass("animate");
    self.el.removeClass("initialize");
  }

  function setPosition() {
    self.el.addClass("animate");
    self.el.attr({
      "data-x": fromLeft,
      "data-y": fromTop });
  }

  if (initalizeFlag) {
    setPosition();
    window.setTimeout(resolvePromise, animationDuration + 50);
  } else {
    setPosition();
    window.setTimeout(resolvePromise, animationDuration);
  }
  return getPromise;
};

//Check if move possible
Tile.prototype.moveCheck = function () {
  if (this.move("up", true) || this.move("right", true)
      || this.move("down", true) || this.move("left", true)) {
    this.canMove = true;
    return true;
  } else {
    this.canMove = false;
    return false;
  }
};

Tile.prototype.move = function (getDirection, checkFlag) {
  var checkFlag = !!checkFlag;
  const direction = getDirection.toLowerCase();
  let getX = this.x;
  let getY = this.y;
  let getNext;
  let isNextMatch;
  let isNextEmpty;
  let nextPositionArray = [];

  if (direction === "up") {
    getNext = this.y > 0 ? this.game.board[this.x][this.y - 1] : false;
    nextPositionArray.push(this.x, this.y - 1);
  } else if (direction === "right") {
    getNext = this.x < 3 ? this.game.board[this.x + 1][this.y] : false;
    nextPositionArray.push(this.x + 1, this.y);
  } else if (direction === "down") {
    getNext = this.y < 3 ? this.game.board[this.x][this.y + 1] : false;
    nextPositionArray.push(this.x, this.y + 1);
  } else if (direction === "left") {
    getNext = this.x > 0 ? this.game.board[this.x - 1][this.y] : false;
    nextPositionArray.push(this.x - 1, this.y);
  }

  isNextMatch = getNext && getNext.tilesArray.length === 1 && getNext.tilesArray[0].valueProp === this.valueProp;
  isNextEmpty = getNext && getNext.tilesArray.length === 0;

  if (checkFlag) {
    return isNextEmpty || isNextMatch;
  } else if (isNextEmpty || isNextMatch) {
    this.setPosition(nextPositionArray[0], nextPositionArray[1]);
    this.removeOldPosition(getX, getY);
    if (!isNextMatch) {
      this.move(direction);
    }
  }
};