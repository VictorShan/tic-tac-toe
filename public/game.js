class TicTacToeBoard {
  constructor(isPlayerX, height, width, updateServerMove) {
    this.height = height;
    this.width = width;
    this.isPlayerX = isPlayerX;
    this.isYourTurn = true;
    this.lineWidth = 10;
    this.player1Moves = [];
    this.player2Moves = [];
    this.updateServerMove = updateServerMove;
    this.ctx;
    this.createGameBoard();
    this.drawGameBoardLines();
  }

  setYourTurn(isYourTurn) {
    this.isYourTurn = isYourTurn;
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
  }

  drawTurn(x, y) {
    if (this.isYourTurn) {
      this.player1Moves.push(`${x},${y}`);
      console.log(this.player1Moves);
      this.drawX(x, y);
    } else {
      this.player2Moves.push(`${x},${y}`);
      console.log(this.player2Moves);
      this.drawO(x, y);
    }
    this.checkWin();
  }

  calculateCoordinates(x, y) {
    x = x * this.width / 3 + this.lineWidth;
    y = y * this.height / 3 + this.lineWidth;
    let width = this.width / 3 - 2 * this.lineWidth;
    let height = this.height / 3 - 2 * this.lineWidth;
    return [x, y, width, height]
  }

  drawX(x1, y1) {
    let [x, y, width, height] = this.calculateCoordinates(x1, y1);
    //this.updateServerMove(x, y);
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
    let canvasPos = canvas.getBoundingClientRect();
    let xMousePos = e.clientX - canvasPos.left;
    let yMousePos = e.clientY - canvasPos.top; 
    if (this.isYourTurn || true) {
      let x = Math.floor(xMousePos / (this.width / 3));
      let y = Math.floor(yMousePos / (this.height / 3));
      console.log("Clicked:", x, y);
      if (this.player1Moves.includes(`${x},${y}`) || this.player2Moves.includes(`${x},${y}`)) {
        console.log("Already played here!");
        return;
      }
      this.drawTurn(x, y);
      this.isYourTurn = !this.isYourTurn;
    }
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
}