import { useEffect, useState } from "react"
import firebase from 'firebase/app'
import GameBoard from './GameBoard'
import GameInfo, { GameInfoType, DEFAULT_INFO } from './GameInfo/GameInfo'
import { useAuth } from "../../utils/Firebase"
import styles from '../../styles/Game.module.sass'
import AlertContainer from "../Alerts/AlertContainer"
import { AlertPropsType } from '../Alerts/AlertTimed'

const FUNCTIONS_URL = process.env.NEXT_PUBLIC_TESTING === 'true' ? 
    process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_API_TEST :
    process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_API

export default function Game({ lobbyId }: propsType) {
  const auth = useAuth()
  const doc = auth.getGameDb(lobbyId)
  const [info, setInfo] = useState<GameInfoType>({ ...DEFAULT_INFO, lobbyId })
  const [gameBoard, setGameBoard] = useState([['','',''],['','',''],['','','']])
  const [uidIsX, setUidIsX] = useState('')
  const [alertData, setAlertData] = useState([])

  const updateData = (doc: firebase.firestore.DocumentSnapshot) => {
    processDoc(doc, lobbyId, setInfo, setGameBoard, uidIsX, setUidIsX)
  }

  const handleMove = (row: number, col: number) => makeMove(auth.user?.uid, lobbyId, row, col, setAlertData)

  useEffect(() => {
    const unsubscribe = doc.onSnapshot({}, doc => updateData(doc))
    return unsubscribe
  }, [lobbyId])

  return (
    <div className={styles['game-container']}>
      <div className={styles.game}>
        <div className={styles['board-container']}>
          <GameBoard boardData={gameBoard} onClick={handleMove}/>
        </div>
        <GameInfo gameInfo={info} />
      </div>
      <AlertContainer alertData={alertData} />
    </div>
  )
}

const MAX_LOBBY_INACTIVE_SECONDS = parseInt(process.env.NEXT_PUBLIC_MAX_LOBBY_INACTIVITY_HOURS) * 60 * 60

const processDoc = (doc: firebase.firestore.DocumentSnapshot,
                    lobbyId: string,
                    setInfo: (info: GameInfoType) => void,
                    setGameBoard: (gameBoard: string[][]) => void,
                    uidIsX: string,
                    setUidIsX: (uid: string) => void) => {
  if (!doc.exists
        || MAX_LOBBY_INACTIVE_SECONDS - doc.data().lastMoveTime.seconds
            > MAX_LOBBY_INACTIVE_SECONDS) {
    setInfo({ ...DEFAULT_INFO, lobbyId })
    setGameBoard([['','',''],['','',''],['','','']])
    console.log("No doc", lobbyId);
    
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
  const player1 = data.players[0] ? { ...data.players[0], score: data.score[data.players[0].uid]} : DEFAULT_INFO.player1
  const player2 = data.players[1] ? { ...data.players[1], score: data.score[data.players[1].uid]} : DEFAULT_INFO.player2
  
  const newData = {
    lobbyId,
    player1,
    player2,
    turn: data.turn || DEFAULT_INFO.turn,
    lastMoveDate: data.lastMoveTime.toDate(),
    gameStatus: data.gameStatus
  }
  setInfo(newData)
}

const makeMove = async(uid: string, lobbyId: string, row: number, col: number,
                    setAlertData: (callback?: (oldData: AlertPropsType[]) => AlertPropsType[] | AlertPropsType[]) => void) => {
  try {
    const res = await fetch(
      `${FUNCTIONS_URL}/makeMove`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ uid, lobbyId, move: { row, col } })
      }
    )    
    if (!res.ok) {
      throw Error(await res.text())
    }
  } catch (err) {
    const newAlert: AlertPropsType = {
      variant: "danger",
      message: err.message,
      duration: 3000
    }
    setAlertData(oldData => ([...oldData, newAlert]))    
  }
}

type propsType = {
  lobbyId: string,
}