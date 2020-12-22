import React, { useEffect, useState } from "react"
import GameBoard from '../game/GameBoard'
import Agent from "./Agent"

export default function AIGame() {
    // const boardData = [['','',''],['','',''],['','','']]
    const [boardData, setBoardData] = useState([['','',''],['','',''],['','','']])
    const [yourTurn, setYourTurn] = useState(true)
    const handleClick = (row: number, col: number) => {
        setBoardData(oldBoard => {
            if (!yourTurn || oldBoard[row][col]) {
                console.log("Can't move here", oldBoard);
                return oldBoard
            } else {
                oldBoard[row][col] = "X"
                setYourTurn(turn => !turn)
                setTimeout(aiMove, 1000)
                return oldBoard // use [...oldBoard] because this doesn't trigger refresh
            }
        })
    }

    const aiMove = () => {
        let move = Agent(boardData)
        console.log(move, boardData);
        if (move) {
            boardData[move[0]][move[1]] = "O"
            setYourTurn(turn => !turn)
        } else {
            console.log("no moves found!");
        }        
    }

    return (
        <div>
            <GameBoard boardData={boardData} onClick={handleClick}/>
        </div>
    )
}