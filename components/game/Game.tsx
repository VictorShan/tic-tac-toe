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

  useEffect(() => {
    const unsubscribe = doc.onSnapshot({}, doc => updateData(doc))
    return unsubscribe
  }, [])

  return (
    <div className={styles.game}>
      <div className={styles['board-container']}>
        <GameBoard boardData={gameBoard} onClick={(row: number, col: number) => { console.log(row, col) }}/>
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
  for (let row in data.board) {
    let newRow = []
    for(let uid of data.board[row]) {
      if (uid === uidIsX) {
        newRow.push("X")
      } else if (data.players.includes(uid)) {
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
    gameWinner: data.gameStatus
  }
  setInfo(newData)
}

type propsType = {
  lobbyId: string,
}