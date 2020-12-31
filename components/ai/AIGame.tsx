import React, { useState } from "react"
import GameBoard from '../game/GameBoard'
import Agent, { hasWon } from "./Agent"
import AIGameInfo from "./AIGameInfo"
import styles from '../../styles/AIGame.module.sass'

export default function AIGame() {
    const [boardData, setBoardData] = useState<string[][]>([['','',''],['','',''],['','','']])
    const [yourTurn, setYourTurn] = useState<boolean>(true)
    const [gameStatus, setGameStatus] = useState<string>("Game not started.")
    const handleClick = (row: number, col: number) => {
        setBoardData(oldBoard => {
            
            if (!yourTurn || oldBoard[row][col]) {
                // can't move here
                return oldBoard
            } else {
                oldBoard[row][col] = "X"
                setYourTurn(turn => !turn)
                setTimeout(aiMove, 250)
                setGameStatus(getGameStatusText(boardData))
                return oldBoard // use [...oldBoard] because this doesn't trigger refresh
            }
        })
    }

    const clearBoard = () => {
        setBoardData([['','',''],['','',''],['','','']])
        setYourTurn(true)
        setGameStatus("Game not started.")
    }

    const aiMove = () => {
        let move = Agent(boardData)
        if (move) {
            boardData[move[0]][move[1]] = "O"
            setBoardData(old => [...boardData])
            let winner = hasWon(boardData, "O", "X")
            setGameStatus(getGameStatusText(boardData))
            if (!winner)
                setYourTurn(turn => !turn)
        } else {
            // No moves found!
        }        
    }

    return (
        <div className={styles.container}>
            <div className={styles.leftContainer}>
                <GameBoard boardData={boardData} onClick={handleClick}/>
            </div>
            <div className={styles.rightContainer}>
                <AIGameInfo
                    clearBoard={clearBoard}
                    gameStatus={gameStatus}/>
                <div className={styles.addSpace}></div>
            </div>
        </div>
    )
}

function getGameStatusText(boardData: string[][]) {
    let result = hasWon(boardData, "O", "X")
    if (result) {
        if (result === "tie") {
            return "You tied with the AI."
        } else if (result === "O") {
            return "Sorry, you lost."
        } else if (result === "X") {
            return "Congradulations! You won! You've solved tic-tac-toe."
        }
    } else {
        return "Game in progress..."
    }
}