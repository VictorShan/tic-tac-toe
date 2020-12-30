import React, { useState } from "react"
import GameBoard from '../game/GameBoard'
import Agent, { hasWon } from "./Agent"
import AIGameInfo from "./AIGameInfo"
import styles from '../../styles/AIGame.module.sass'

export default function AIGame() {
    const [boardData, setBoardData] = useState([['','',''],['','',''],['','','']])
    const [yourTurn, setYourTurn] = useState(true)
    const handleClick = (row: number, col: number) => {
        setBoardData(oldBoard => {
            if (!yourTurn || oldBoard[row][col]) {
                // can't move here
                return oldBoard
            } else {
                oldBoard[row][col] = "X"
                setYourTurn(turn => !turn)
                setTimeout(aiMove, 500)
                return oldBoard // use [...oldBoard] because this doesn't trigger refresh
            }
        })
    }

    const clearBoard = () => {
        setBoardData([['','',''],['','',''],['','','']])
        setYourTurn(true)
    }

    const aiMove = () => {
        let move = Agent(boardData)
        if (move) {
            boardData[move[0]][move[1]] = "O"
            setBoardData(old => [...boardData])
            if (!hasWon(boardData, "O", "X"))
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
                <AIGameInfo clearBoard={clearBoard} />
                <div className={styles.addSpace}></div>
            </div>
        </div>
    )
}