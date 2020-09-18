import styles from '../../styles/GameInfo.module.sass'
import { useAuth } from '../../utils/Firebase'
import Button from 'react-bootstrap/Button'

export type GameInfoType = {
  lobbyId: string
  player1: userInfo,
  player2: userInfo,
  turn: string,
  gameStatus?: string
}

export const DEFAULT_INFO_TYPE: GameInfoType = {
  lobbyId: "Unknown",
  player1: { displayName: "None", uid: "player1", score: 0 },
  player2: { displayName: "None", uid: "player2", score: 0 },
  turn: 'Unknown',
}

type userInfo = {
  displayName: string,
  uid: string,
  score: number
}

type propsType = {
  gameInfo: GameInfoType
}

export default function GameInfo({ gameInfo }: propsType) {
  const auth = useAuth()
  const user = auth.user || { uid: ''}
  return (
    <div className={styles['info-container']}>
      <h1>Lobby ID: {gameInfo.lobbyId}</h1>
      <h4>Player 1: {gameInfo.player1.displayName} {gameInfo.player1.uid === user.uid ? "(you)" : "" }</h4>
      <h4>Player 2: {gameInfo.player2.displayName} {gameInfo.player2.uid === user.uid ? "(you)" : "" }</h4>
      {showScores(gameInfo.player1, gameInfo.player2)}
      {processGameStatus(auth.user, gameInfo.gameStatus, gameInfo.turn)}
      {showResetButton(gameInfo.gameStatus, auth.user, gameInfo.lobbyId)}
    </div>
  )
}

const showScores = (player1: userInfo, player2: userInfo) => {
  return (
    <section>
      <h3>Score:</h3>
      <h5>{player1.displayName}: {player1.score}</h5>
      <h5>{player2.displayName}: {player2.score}</h5>
    </section>
  )
}

const processGameStatus = (user: firebase.User, gameStatus: string, turn: string) => {
  if (!user) {
    return <h2>User not currently signed in.</h2>
  } else if (!gameStatus) {
    return <h2>It's {user.uid === turn ? "your" : "your opponent's"} turn.</h2>
  } else {
    if (user.uid === gameStatus) {
      return <h2>You Won!</h2>
    } else if (gameStatus === 'tie') {
      return <h2>Its a tie!</h2>
    } else {
      return <h2>You Lost. Better luck next time.</h2>
    }
  }
}


const showResetButton = (showReset: any, user: firebase.User, lobbyId: string) => {
  const uid = user && user.uid || "Unknown"
  if (showReset) {
    return <Button onClick={() => clearBoard(uid, lobbyId)}>Reset Board</Button>
  }
}


const clearBoard = async (uid: string, lobbyId: string) => {
  try {
    const res = await fetch(
      'http://localhost:5001/tic-tac-toe-82af8/us-central1/game/clearBoard',
      {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ uid, lobbyId })
      }
    )
    if (!res.ok) {
      throw Error(await res.text())
    }
  } catch (err) {
    console.error(err)
  }
}