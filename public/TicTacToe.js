class TicTacToe {
  constructor(db, height, width, uid, lobbyId) {
    this.height = height;
    this.width = width;
    this.playerIsX = true;
    this.db = db;
    this.dbDoc = {};
    this.lineWidth = 10;
    this.player1Moves = [];
    this.player2Moves = [];
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
      this.player1Moves.push(`${x},${y}`);
      this.drawXorO(x, y, this.playerIsX);
    } else if (this.opponentUid === uid) {
      this.player2Moves.push(`${x},${y}`);
      this.drawXorO(x, y, !this.playerIsX);
    } else {
      console.log(uid, "made a move but who is that?");
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
    if (this.winCondition(this.player1Moves)) {
      console.log("WIN");
      this.isYourTurn = false;
      this.displayWin();
    } else if (this.winCondition(this.player2Moves)) {
      this.isYourTurn = false;
      console.log("LOSS");
      this.displayLoss();
    } else {
      console.log("No winners yet!");
    }
  }

  winCondition(list) {
    if (list.includes('0,0') && list.includes('1,1') && list.includes('2,2')) {
      this.winningLine = [[0,0],[1,1], [2,2]];
      return true;
    } else if (list.includes('0,2') && list.includes('1,1') && list.includes('2,0')) {
      this.winningLine = [[0,2], [1,1], [2,0]];
      return true;
    }
    for (let i = 0; i < 3; i++) {
      if (list.includes(`0,${i}`) && list.includes(`1,${i}`) && list.includes(`2,${i}`)) {
        this.winningLine = [[0,i], [1,i],[2,i]];
        return true;
      } else if (list.includes(`${i},0`) && list.includes(`${i},1`) && list.includes(`${i},2`)) {
        this.winningLine = [[i,0], [i,1], [i,2]];
        return true;
      }
    }
    return false;
  }

  displayWin() {
    this.ctx.strokeStyle = 'green';
    this.drawWinningLine(this.ctx);
    console.log("You won!");
  }

  displayLoss() {
    console.log("Drawing loss");
    this.ctx.strokeStyle = 'red';
    this.drawWinningLine(this.ctx);
    console.log("You lost...");
  }

  drawWinningLine(ctx) {
    console.log("Drawing");
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.moveTo(this.width/3 * (this.winningLine[0][0] + 0.5),
              this.height/3 * (this.winningLine[0][1] + 0.5));
    ctx.lineTo(this.width/3 * (this.winningLine[2][0] + 0.5),
              this.height/3 * (this.winningLine[2][1] + 0.5));
    ctx.stroke();
  }

  clickTurn(canvas, e) {
    console.log("Clicked", this);
    let canvasPos = canvas.getBoundingClientRect();
    let xMousePos = e.clientX - canvasPos.left;
    let yMousePos = e.clientY - canvasPos.top; 
    if (this.isYourTurn) {
      let x = Math.floor(xMousePos / (this.width / 3));
      let y = Math.floor(yMousePos / (this.height / 3));
      console.log("Clicked:", x, y);
      if (this.player1Moves.includes(`${x},${y}`) || this.player2Moves.includes(`${x},${y}`)) {
        console.log("Already played here!");
        return;
      }
      this.makeMoveServer(x, y);
    }
  }

  async makeMoveServer(x, y) {
    console.log("Trying to go:", x, y);
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
    console.log("Setting up server");
    await this.drawCurrentGame();
    this.setupServerUpdates();
  }
  async drawCurrentGame() {
    console.log("Drawing current game");
    const doc = await this.db.collection('lobbies').doc(this.lobbyId).get();
    const data = doc.data();
    this.opponentUid = data.users[0] === this.uid ? data.users[1] : data.users[0];
    if (this.opponentUid === undefined) {
      this.isYourTurn = true;
      return;
    }
    console.log(this.uid, this.opponentUid);
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
    console.log("Point from string:", coords);
    this.drawTurn(coords[0], coords[1], uid);
  }

  setupServerUpdates() {
    console.log("Setting up server updates");
    console.log(this.lobbyId);
    this.serverObserver = this.db.collection('lobbies')
                                  .doc(this.lobbyId)
                                  .onSnapshot({
                                    includeMetadataChanges: true
                                  }, doc => {
                                    if (!doc.exists)
                                      return;
                                    console.log("Snapshot ran on ", this.lobbyId);
                                    const data = doc.data();
                                    if (this.opponentUid === undefined && data.users[1]) {
                                      this.opponentUid = data.users[1];
                                    }
                                    if (data.history.lastMove.uid === this.opponentUid) {
                                      console.log("Opponent moved");
                                      this.isYourTurn = true;
                                      this.drawTurn(data.history.lastMove.x,
                                                    data.history.lastMove.y,
                                                    data.history.lastMove.uid);
                                    }
                                    this.docData = doc;
                                  });
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