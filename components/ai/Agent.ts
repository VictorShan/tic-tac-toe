const INFINITY = Math.pow(10, 1000)

export default function Agent(boardData: string[][]) {
    return getMoves(boardData)[0] || null
}

function alphaBeta(boardData, alpha, beta, depth) {

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
    let lrDiagonal = [boardData[0][0], boardData[1][1], boardData[2][2]]
    let rlDiagonal = [boardData[0][2], boardData[1][1], boardData[2][1]]
    let columns = []
    for (let col = 0; col < 3; col++) {
        columns.push([boardData[0][col], boardData[1][col], boardData[2][col]])
    }
    let checkArr = [...boardData, lrDiagonal, rlDiagonal, ...columns]
    return evaluateArr(checkArr)
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