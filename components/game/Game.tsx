import { useEffect, useState } from "react"
import GameBoard from './GameBoard'
import GameInfo, { GameInfoType, DEFAULT_INFO_TYPE } from './GameInfo'
import { useAuth } from "../../utils/Firebase"
import styles from '../../styles/Game.module.sass'


export default function Game({ lobbyId }: propsType) {
  const auth = useAuth()
  const doc = auth.getGameDb(lobbyId)
  const [info, setInfo] = useState<GameInfoType>(DEFAULT_INFO_TYPE)
  const [gameBoard, setGameBoard] = useState([['','',''],['','',''],['','','']])
  const [uidIsX, setUidIsX] = useState('')

  const updateData = (doc: firebase.firestore.DocumentSnapshot) => {
    processDoc(doc, lobbyId, setInfo, setGameBoard, uidIsX, setUidIsX)
  }

  const handleMove = (row: number, col: number) => makeMove(auth.user.uid, lobbyId, row, col)

  useEffect(() => {
    const unsubscribe = doc.onSnapshot({}, doc => updateData(doc))
    return unsubscribe
  }, [])

  return (
    <div className={styles.game}>
      <div className={styles['board-container']}>
        <GameBoard boardData={gameBoard} onClick={handleMove}/>
      </div>
      <GameInfo gameInfo={info} />
    </div>
  )
}

const processDoc = (doc: firebase.firestore.DocumentSnapshot,
                    lobbyId: string,
                    setInfo: (info: GameInfoType) => void,
                    setGameBoard: (gameBoard: string[][]) => void,
                    uidIsX: string,
                    setUidIsX: (uid: string) => void) => {
 
  if (!doc.exists) {
    setInfo(DEFAULT_INFO_TYPE)
    setGameBoard([['','',''],['','',''],['','','']])
    return
  }
  const data = doc.data()
  updateInfo(data, lobbyId, setInfo)
  if (!uidIsX) {
    setUidIsX(data.players[0].uid)
    setGameBoard(formatBoard(data, data.players[0].uid))
  } else {
    setGameBoard(formatBoard(data, uidIsX))
  }
}

const formatBoard = (data: firebase.firestore.DocumentData, uidIsX): string[][] => {
  let newBoard = []
  const playerUids = data.players.map(player => player.uid)
  for (let row in data.board) {
    let newRow = []
    for(let uid of data.board[row]) {
      if (uid === uidIsX) {
        newRow.push("X")
      } else if (playerUids.includes(uid)) {
        newRow.push("O")
      } else {
        newRow.push("")
      }
    }
    newBoard.push(newRow)
  }
  return newBoard
}

const updateInfo = (data: firebase.firestore.DocumentData, lobbyId: string, setInfo: (info: GameInfoType) => void) => {
  const player1 = data.players[0] ? { ...data.players[0], score: data.score[data.players[0].uid]} : DEFAULT_INFO_TYPE.player1
  const player2 = data.players[1] ? { ...data.players[1], score: data.score[data.players[1].uid]} : DEFAULT_INFO_TYPE.player2
  const newData = {
    lobbyId,
    player1,
    player2,
    turn: data.turn || DEFAULT_INFO_TYPE.turn,
    gameStatus: data.gameStatus
  }
  setInfo(newData)
}

const makeMove = async(uid: string, lobbyId: string, row: number, col: number) => {
  try {
    const res = await fetch(
      'http://localhost:5001/tic-tac-toe-82af8/us-central1/game/makeMove',
      {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ uid, lobbyId, move: { row, col } })
      }
    )
    console.log(res);
    
    if (!res.ok) {
      throw Error(await res.text())
    }
  } catch (err) {
    console.log("Failed to make move:", err.message);
  }
}

type propsType = {
  lobbyId: string,
}