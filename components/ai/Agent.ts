const INFINITY = Math.pow(10, 1000)

export default function Agent(boardData: string[][]) {   
    return hasWon(boardData, "O", "X") ? null : alphaBeta(boardData, -INFINITY, INFINITY, -1,  true)[0]
}

function alphaBeta(boardData, alpha, beta, depth, isOMove) {
    if (depth === 0 || hasWon(boardData, "O", "X")) {
        return [null, staticEval(boardData)]
    }
    let bestScore = isOMove ? -INFINITY : INFINITY
    let bestMove = null
    for (let move of getMoves(boardData)) {
        let newBoard = copyBoard(boardData)
        if (isOMove) {
            newBoard[move[0]][move[1]] = "O"
            let [_tmp, newScore] = alphaBeta(newBoard, alpha, beta, depth - 1, false)
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
            let [_tmp, newScore] = alphaBeta(newBoard, alpha, beta, depth - 1, true)
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
export function staticEval(boardData: string[][]) {
    return evaluateArr(getArrs(boardData), "O", "X")
}

export function getArrs(boardData: string[][]) {
    let lrDiagonal = [boardData[0][0], boardData[1][1], boardData[2][2]]
    let rlDiagonal = [boardData[0][2], boardData[1][1], boardData[2][0]]
    let columns = []
    for (let col = 0; col < 3; col++) {
        columns.push([boardData[0][col], boardData[1][col], boardData[2][col]])
    }
    return [...boardData, lrDiagonal, rlDiagonal, ...columns]
}

export function hasWon(boardData: string[][], uid1: string, uid2: string): string | "tie" | false {
    let arrs = getArrs(boardData)
    let mustTie: "tie" | false = "tie"
    for (let arr of arrs) {
        let uid1s = arr.filter(e => e === uid1).length
        let uid2s = arr.filter(e => e === uid2).length
        if (uid1s === 3) {
            return uid1
        }
        if (uid2s === 3) {
            return "X"
        }
        if (!uid1s || !uid2s) {
            mustTie = false
        }
    }
    return mustTie
}

export function evaluateArr(arrs: string[][], uid1: string, uid2: string) {
    let score = 0
    for (let arr of arrs) {
        let uid1s = arr.filter(e => e === uid1).length
        let uid2s = arr.filter(e => e === uid2).length
        if (uid2s === 0) {
            if (uid1s === 3) {
                score += 100
            } else if (uid1s === 2) {
                score += 10
            } else if (uid1s === 1) {
                score += 1
            }
        }
        if (uid1s === 0) {
            if (uid2s === 3) {
                score -= 100
            } else if (uid2s === 2) {
                score -= 10
            } else if (uid2s === 1) {
                score -= 1
            }
        }
    }
    return score
}