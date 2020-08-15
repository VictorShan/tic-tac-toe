class TicTacToe {
  constructor(db, height, width, uid, lobbyId) {
    this.height = height;
    this.width = width;
    this.playerIsX = true;
    this.db = db;
    this.dbDoc = {};
    this.lineWidth = 10;
    this.uid = uid;
    this.opponentUid = null;
    this.lobbyId = lobbyId;
    this.isYourTurn = false;
    this.ctx;
    this.createGameBoard();
    this.setupServer();
  }

  get gameBoard() {
    return this.canvas;
  }

  createGameBoard() {
    this.canvas = document.createElement("canvas");
    this.canvas.height = this.height;
    this.canvas.width = this.width;
    this.canvas.addEventListener('click', (e) => this.clickTurn(this.canvas, e));
    this.ctx = this.canvas.getContext('2d');
    this.drawGameBoardLines();
  }

  drawTurn(x, y, uid) {
    if (this.uid === uid) {
      // this.player1Moves.push(`${x},${y}`);
      this.drawXorO(x, y, this.playerIsX);
    } else if (this.opponentUid === uid) {
      // this.player2Moves.push(`${x},${y}`);
      this.drawXorO(x, y, !this.playerIsX);
    } else {
      console.error(uid, "made a move but who is that?");
    }
    this.checkWin();
  }

  drawXorO(x, y, drawX) {
    if (drawX) {
      this.drawX(x, y);
    } else {
      this.drawO(x, y);
    }
  }

  calculateCoordinates(x, y) {
    x = x * this.width / 3 + this.lineWidth;
    y = y * this.height / 3 + this.lineWidth;
    let width = this.width / 3 - 2 * this.lineWidth;
    let height = this.height / 3 - 2 * this.lineWidth;
    return [x, y, width, height]
  }

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

  drawO(x1, y1) {
    let [x, y, width, height] = this.calculateCoordinates(x1, y1);
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = this.lineWidth / 2;
    this.ctx.beginPath();
    this.ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

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

  displayWin() {
    this.ctx.strokeStyle = 'green';
    this.drawWinningLine(this.ctx);
    if (this.serverObserver)
      this.serverObserver();
  } 

  displayLoss() {
    this.ctx.strokeStyle = 'red';
    this.drawWinningLine(this.ctx);
    if (this.serverObserver)
      this.serverObserver();
  }

  drawWinningLine(ctx) {
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.moveTo(this.width/3 * (this.winningLine[0][0] + 0.5),
              this.height/3 * (this.winningLine[0][1] + 0.5));
    ctx.lineTo(this.width/3 * (this.winningLine[2][0] + 0.5),
              this.height/3 * (this.winningLine[2][1] + 0.5));
    ctx.stroke();
  }

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
      if (result.status === 200) {
        if (result.winner) {
          this.winningLine = result.path;
          this.winner = result.winner;
        }
        this.drawTurn(x, y, this.uid);
        this.isYourTurn = false;
      } else {
        alert('Invalid move');
        console.log(result);
      }
    } catch (error) {
      console.log("Couldn't make move.")
      console.error(error);
    }
  }


  async setupServer() {
    await this.drawCurrentGame();
    this.setupServerUpdates();
  }

  async drawCurrentGame() {
    const doc = await this.db.collection('lobbies').doc(this.lobbyId).get();
    const data = doc.data(); 
    this.opponentUid = data.users[0] === this.uid ? data.users[1] : data.users[0];
    if (this.opponentUid === undefined) {
      this.isYourTurn = true;
      return;
    }
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
  }

  drawTurnFromString(uid, coordinates) {
    let coords = coordinates.split(',');
    this.drawTurn(coords[0], coords[1], uid);
  }

  setupServerUpdates() {
    this.serverObserver = this.db.collection('lobbies')
                                  .doc(this.lobbyId)
                                  .onSnapshot({
                                    includeMetadataChanges: true
                                  }, doc => TicTacToe.onServerUpdate(this, doc));
  }

  static onServerUpdate(game, doc) {
    if (!doc.exists)
      return;
    const data = doc.data();
    if (game.opponentUid === undefined && data.users[1]) {
      game.opponentUid = data.users[1];
    }
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
    console.log(data);
    game.docData = data;
  }

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

  deleteGame() {
    this.serverObserver();
  }
}