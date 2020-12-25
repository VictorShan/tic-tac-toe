const INFINITY = Math.pow(10, 1000)

export default function Agent(boardData: string[][]) {   
    return hasWon(boardData) ? null : alphaBeta(boardData, -INFINITY, INFINITY, -1,  true)[0]
}

function alphaBeta(boardData, alpha, beta, depth, isOMove) {
    // console.log(depth);
    
    if (depth === 0 || hasWon(boardData)) {
        // console.log("reached bottom", boardData);
        // console.log([null, staticEval(boardData)]) 
        return [null, staticEval(boardData)]
    }
    let bestScore = isOMove ? -INFINITY : INFINITY
    let bestMove = null
    for (let move of getMoves(boardData)) {
        let newBoard = copyBoard(boardData)
        if (isOMove) {
            newBoard[move[0]][move[1]] = "O"
            let [tmp, newScore] = alphaBeta(newBoard, alpha, beta, depth - 1, false)
            if (newScore > bestScore) {
                bestScore = newScore
                bestMove = move
                if (bestScore > alpha) {
                    alpha = bestScore
                    if (alpha >= beta) {
                        break
                    }
                }
            }
        } else {
            newBoard[move[0]][move[1]] = "X"
            let [tmp, newScore] = alphaBeta(newBoard, alpha, beta, depth - 1, true)
            if (newScore < bestScore) {
                bestScore = newScore
                bestMove = move
                if (bestScore < beta) {
                    beta = bestScore
                    if (beta <= alpha) {
                        break
                    }
                }
            }
        }
    }       
    return [bestMove, bestScore]
}

function copyBoard(boardData) {
    let newBoard = []
    for (let row of boardData) {
        newBoard.push([...row])
    }
    return newBoard
}

function getMoves(boardData: string[][]) {
    let moves = []
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (!boardData[i][j]) {
                moves.push([i,j])
            }
        }
    }
    return moves
}

// maximize O, minimize X
function staticEval(boardData: string[][]) {
    return evaluateArr(getArrs(boardData))
}

function getArrs(boardData: string[][]) {
    let lrDiagonal = [boardData[0][0], boardData[1][1], boardData[2][2]]
    let rlDiagonal = [boardData[0][2], boardData[1][1], boardData[2][1]]
    let columns = []
    for (let col = 0; col < 3; col++) {
        columns.push([boardData[0][col], boardData[1][col], boardData[2][col]])
    }
    return [...boardData, lrDiagonal, rlDiagonal, ...columns]
}

function hasWon(boardData: string[][]) {
    let arrs = getArrs(boardData)
    let mustTie = true
    for (let arr of arrs) {
        let Os = arr.filter(e => e === "O").length
        let Xs = arr.filter(e => e === "X").length
        if (Os === 3) {
            return "O"
        }
        if (Xs === 3) {
            return "X"
        }
        if (!Os || !Xs) {
            mustTie = false
        }
    }
    return mustTie
}

function evaluateArr(arrs) {
    let score = 0
    for (let arr of arrs) {
        let Os = arr.filter(e => e === 'O').length
        let Xs = arr.filter(e => e === 'X').length
        if (Xs === 0) {
            if (Os === 3) {
                score += 100
            } else if (Os === 2) {
                score += 10
            } else if (Os === 1) {
                score += 1
            }
        }
        if (Os === 0) {
            if (Xs === 3) {
                score -= 100
            } else if (Xs === 2) {
                score -= 10
            } else if (Xs === 1) {
                score -= 1
            }
        }
    }
    return score
}