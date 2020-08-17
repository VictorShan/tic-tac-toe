class TicTacToe {
  constructor(dbRef, height, width, uid, lobbyId) {
    this.height = height;
    this.width = width;
    this.playerIsX = true;
    this.dbRef = dbRef;
    this.dbDoc = {};
    this.lineWidth = 10;
    this.uid = uid;
    this.opponentUid = null;
    this.lobbyId = lobbyId;
    this.isYourTurn = false;
    this.ctx;
    this.createGameBoard();
    this.setupServer();
    // Runs every time game is updated
    this.infoElement;
  }

  /**
   * Sets an html element as the parent of all the game
   * information
   * @param {html} element An html element
   */
  setInfoElement(element) {
    this.infoElement = element;
    this.genInfo();
    if (this.docData) 
      this.updateInfo(docData);
  }

  get gameBoard() {
    return this.canvas;
  }

  get info() {
    return this.dbDoc;
  }

  /**
   * Creates canvas element, draws board lines and adds click listener
   * Game coordinates (0-indexed): 
   *    ------->x
   *    |
   *    |
   *    V
   *    Y
   */
  createGameBoard() {
    this.canvas = document.createElement("canvas");
    this.canvas.height = this.height;
    this.canvas.width = this.width;
    this.canvas.addEventListener('click', (e) => this.clickTurn(this.canvas, e));
    this.ctx = this.canvas.getContext('2d');
    this.drawGameBoardLines();
  }

  /**
   * Draws a turn. Symbol depends on uid and location on x and y.
   * @param {number} x 0 The game's horizontal, integer coordinate (0 <= x <= 2)
   * @param {number} y 0 The game's vertical, integer coordinate (0 <= y <= 2)
   * @param {string} uid The player's uid that made the move
   */
  drawTurn(x, y, uid) {
    if (this.uid === uid) {
      this.drawXorO(x, y, this.playerIsX);
    } else if (this.opponentUid === uid) {
      this.drawXorO(x, y, !this.playerIsX);
    } else {
      console.error(uid, "made a move but who is that?");
    }
    this.checkWin();
  }

  /**
   * Draws a 'X' or 'O' at x,y
   * @param {number} x The game's horizontal, integer coordinate (0 <= x <= 2)
   * @param {number} y The game's vertical, integer coordinate (0 <= y <= 2)
   * @param {boolean} drawX Whether to draw an 'X' or an 'O'
   */
  drawXorO(x, y, drawX) {
    if (drawX) {
      this.drawX(x, y);
    } else {
      this.drawO(x, y);
    }
  }

  /**
   * Translates x and y coordinates of the game into x, y coordinates of
   * the canvas.
   * @param {number} x The game's horizontal, integer coordinate (0 <= x <= 2)
   * @param {number} y The game's vertical, integer coordinate (0 <= y <= 2)
   * @returns {[number, number, number number]} Returns the upper left corner's x,y
   * and the width of the width and height of the symbol.
   */
  calculateCoordinates(x, y) {
    x = x * this.width / 3 + this.lineWidth;
    y = y * this.height / 3 + this.lineWidth;
    let width = this.width / 3 - 2 * this.lineWidth;
    let height = this.height / 3 - 2 * this.lineWidth;
    return [x, y, width, height]
  }

  /**
   * Draws an X at game coordinate (x,y)
   * @param {number} x The game's horizontal, integer coordinate (0 <= x <= 2)
   * @param {number} y The game's vertical, integer coordinate (0 <= y <= 2)
   */
  drawX(x, y) {
    let width, height;
    [x, y, width, height] = this.calculateCoordinates(x, y);
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = this.lineWidth / 2;
    this.ctx.beginPath();
    //  \
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + width, y + height);
    //  /
    this.ctx.moveTo(x + width, y);
    this.ctx.lineTo(x, y + height);
    //  X
    this.ctx.closePath();
    this.ctx.stroke();
  }

  /**
   * Draws an O at game coordinate (x,y)
   * @param {number} x The game horizontal, integer coordinate (0 <= x <= 2)
   * @param {number} y The game vertical, integer coordinate (0 <= y <= 2)
   */
  drawO(x, y) {
    let width, height;
    [x, y, width, height] = this.calculateCoordinates(x, y);
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = this.lineWidth / 2;
    this.ctx.beginPath();
    this.ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  /**
   * Check if there is a winner and draw the winning line if there is.
   */
  checkWin() {
    if (!this.winner) {
      return;
    }
    if (this.winner === this.uid) {
      this.isYourTurn = false;
      this.displayWin();

    } else if (this.winner === this.opponentUid) {
      this.isYourTurn = false;
      this.displayLoss();
    } else {
      console.error("Someone not part of the game won?", this.winner);
    }
  }

  /**
   * Draw the winning line in green because player won.
   */
  displayWin() {
    this.ctx.strokeStyle = 'green';
    this.drawWinningLine(this.ctx);
    if (this.serverObserver)
      this.serverObserver();
  } 

  /**
   * Draw the winning line in red because player lost.
   */
  displayLoss() {
    this.ctx.strokeStyle = 'red';
    this.drawWinningLine(this.ctx);
    if (this.serverObserver)
      this.serverObserver();
  }

  /**
   * Draws the winning line
   * @param {CanvasRenderingContext2D} ctx The canvas/game board pen
   */
  drawWinningLine(ctx) {
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.moveTo(this.width/3 * (this.winningLine[0][0] + 0.5),
              this.height/3 * (this.winningLine[0][1] + 0.5));
    ctx.lineTo(this.width/3 * (this.winningLine[2][0] + 0.5),
              this.height/3 * (this.winningLine[2][1] + 0.5));
    ctx.stroke();
  }

  /**
   * Handles clicks on the canvas by interpreting it as a player turn
   * or ignoring it.
   * @param {canvas} canvas The game board element
   * @param {event} e The event of clicking on the canvas
   */
  clickTurn(canvas, e) {
    let canvasPos = canvas.getBoundingClientRect();
    let xMousePos = e.clientX - canvasPos.left;
    let yMousePos = e.clientY - canvasPos.top; 
    if (this.isYourTurn) {
      let x = Math.floor(xMousePos / (this.width / 3));
      let y = Math.floor(yMousePos / (this.height / 3));
      if (this.docData &&
            (this.docData.history[this.uid].includes(`${x},${y}`) ||
            this.docData.history[this.opponentUid].includes(`${x},${y}`))) {
        return;
      }
      this.makeMoveServer(x, y);
    }
  }

  /**
   * Player wants to make a next move at (x,y). If server approves, it is drawn.
   * @param {number} x The x coordinate of the next move the player wants to make (0 <= x <= 2)
   * @param {number} y The y coordinate of the next move the player wants to make (0 <= y <= 2)
   */
  async makeMoveServer(x, y) {
    let data = {
      uid: this.uid,
      lobbyId: this.lobbyId,
      x: x,
      y: y
    }
    try {
      let result = await fetch('/makeMove', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)});
      // TODO: Clean up this code later
      if (result.status === 200) {
        if (result.winner) {
          this.winningLine = result.path;
          this.winner = result.winner;
        }
        this.drawTurn(x, y, this.uid);
        this.isYourTurn = false;
        this.updateInfo(this.docData);
      } else {
        alert('Invalid move');
        console.log(result);
      }
    } catch (error) {
      console.log("Couldn't make move.")
      console.error(error);
    }
  }


  /**
   * Setup the server connection for the game
   */
  async setupServer() {
    await this.drawCurrentGame();
    this.setupServerUpdates();
  }

  /**
   * Draws the current game using database
   */
  async drawCurrentGame() {
    const doc = await this.dbRef.get();
    const data = doc.data();
    if (this.infoElement)
      this.updateInfo(data);
    if (data.users.length < 2) {
      this.isYourTurn = false;
      return;
    }
    this.opponentUid = data.users[0] === this.uid ? data.users[1] : data.users[0];
    if (!data.gameOn) {
      this.winningLine = JSON.parse(data.history.lastWinner.path);
      this.winner = data.history.lastWinner.uid;
    }
    data.history[this.uid].forEach(e => this.drawTurnFromString(this.uid, e));
    data.history[this.opponentUid].forEach(e => this.drawTurnFromString(this.opponentUid, e));
    if (!data.history.lastMove.uid) {
      this.isYourTurn = data.users[0] === this.uid;
    } else {
      this.isYourTurn = data.history.lastMove.uid === this.opponentUid;
    }
    this.docData = data;
  }

  /**
   * Draws a turn from string coordinates and player uid
   * @param {string} uid The uid of the move's player
   * @param {string} coordinates Coordinates in string form "x,y"
   */
  drawTurnFromString(uid, coordinates) {
    let coords = coordinates.split(',');
    this.drawTurn(coords[0], coords[1], uid);
  }

  /**
   * Subscribe to firestore for updates
   */
  setupServerUpdates() {
    this.serverObserver = this.dbRef.onSnapshot({
                                    includeMetadataChanges: true
                                  }, doc => TicTacToe.onServerUpdate(this, doc));
  }

  /**
   * When the lobby's entry is updated in the database, draw the result
   * @param {TicTacToe} game The current game
   * @param {DocumentSnapshot} doc A snapshot of the database document
   */
  static onServerUpdate(game, doc) {
    if (!doc.exists)
      return;
    const data = doc.data();
    if (!game.opponentUid) {
      if (data.users[1]) {
        game.opponentUid = data.users[1];
        game.isYourTurn = true;
      }
    } else {
      if (!data.gameOn) {
        game.winningLine = JSON.parse(data.history.lastWinner.path);
        game.winner = data.history.lastWinner.uid;
      }
      if (data.history.lastMove.uid === game.opponentUid) {
        game.isYourTurn = true;
        game.drawTurn(data.history.lastMove.x,
                      data.history.lastMove.y,
                      data.history.lastMove.uid);
      }
    }
    game.docData = data;
    if (game.infoElement)
      game.updateInfo(data);
  }

  genInfo() {
    this.infoElement.innerHtml = "";

    // Static elements
    let title = TicTacToe.genElement("h3", "game-info-title");
    title.textContent = "Game Info";
    this.infoElement.appendChild(title);

    // Dynamic elements
    let status = TicTacToe.genElement("p", "game-info-status");
    this.infoElement.appendChild(status);
    let turn = TicTacToe.genElement("p", "game-info-turn");
    this.infoElement.appendChild(turn);
  }

  /**
   * Creates a new html element with a class name
   * @param {string} tag An html tag
   * @param {string} className A class name
   */
  static genElement(tag, className="") {
    let element = document.createElement(tag);
    element.classList.add(className);
    return element;
  }

  /**
   * Populates an html element with 
   * @param {object} data Data from game
   */
  updateInfo(data) {
    if (data.gameOn) {
      if (data.users.length == 2) {
        this.infoElement
          .querySelector(".game-info-status")
          .textContent = "Game in progress.";
        this.infoElement
          .querySelector(".game-info-turn")
          .textContent = this.isYourTurn ? "It's your turn" : "It's your opponent's turn";
      } else {
        this.infoElement
          .querySelector(".game-info-status")
          .textContent = "Please wait for opponent to join the game.";
        this.infoElement
          .querySelector(".game-info-turn")
          .textContent = "";
      }
    } else {
      let winText;
      if (this.winner == this.uid) {
        winText = "You won! ";
      } else if (this.winner == this.opponentUid) {
        winText = "Your opponent won. ";
      } else {
        winText = "No one won. ";
      }
      this.infoElement
          .querySelector(".game-info-status")
          .textContent = winText + "Please join a new lobby to start another game.";
      this.infoElement
            .querySelector(".game-info-turn")
            .textContent = "";
    }
  }

  /**
   * Draws the lines on the tic tac toe board
   */
  drawGameBoardLines() {
    this.ctx.fillStyle = 'black';

    //   |
    //   |
    //   |
    this.ctx.fillRect(this.width/3 - this.lineWidth/2, 0, this.lineWidth, this.height);

    //   | |
    //   | | 
    //   | |
    this.ctx.fillRect(this.width * 2/3 - this.lineWidth/2, 0, this.lineWidth, this.height);

    //  _|_|_
    //   | | 
    //   | |
    this.ctx.fillRect(0, this.height/3 - this.lineWidth/2, this.width, this.lineWidth);

    //  _|_|_
    //  _|_|_
    //   | |
    this.ctx.fillRect(0, this.height * 2/3 - this.lineWidth/2, this.width, this.lineWidth);
  }

  /**
   * Delete game by unsubscribing to the database
   */
  deleteGame() {
    this.serverObserver();
  }
}