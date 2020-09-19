import styles from '../../styles/GameInfo.module.sass'
import { AuthType, useAuth } from '../../utils/Firebase'
import Button from 'react-bootstrap/Button'
import { useState } from 'react'

export type GameInfoType = {
  lobbyId: string
  player1?: userInfo,
  player2?: userInfo,
  turn: string,
  gameStatus?: string
}

export const DEFAULT_INFO_TYPE: GameInfoType = {
  lobbyId: "Unknown",
  turn: 'Unknown'
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
  const [showWarning, setShowWarning] = useState(false)
  return (
    <div className={styles['info-container']}>
      <h1>Lobby ID: {gameInfo.lobbyId}</h1>
      <h4>Player 1: {gameInfo.player1?.displayName} {gameInfo.player1?.uid === user.uid ? "(you)" : "" }</h4>
      <h4>Player 2: {gameInfo.player2?.displayName} {gameInfo.player2?.uid === user.uid ? "(you)" : "" }</h4>
      {showScores(gameInfo.player1, gameInfo.player2)}
      {processGameStatus(auth.user, gameInfo)}
      {showResetButton(gameInfo.gameStatus, auth.user, gameInfo.lobbyId)}
    </div>
  )
}

const showScores = (player1: userInfo, player2: userInfo) => {
  return (
    <>
    <hr />
    <section>
      <h3>Score:</h3>
      <h5>{player1?.displayName || "Player 1"}: {player1?.score || 0}</h5>
      <h5>{player2?.displayName || "Player 2"}: {player2?.score || 0}</h5>
    </section>
    </>
  )
}

const processGameStatus = (user: firebase.User, gameInfo: GameInfoType) => {
  
  let gameStatusText: string
  if (!user) {
    gameStatusText = "User not currently signed in."
  } else if (![gameInfo.player1?.uid, gameInfo.player2?.uid].includes(user.uid)) {
    gameStatusText = "Not participating in match."
  } else if (!gameInfo.player1 || !gameInfo.player2) {
    gameStatusText = "Not enough players to start game."
  } else if (!gameInfo.gameStatus) {
    gameStatusText = `It's ${user.uid === (gameInfo.turn || "No valid uid") ? "your" : "your opponent's"} turn.`
  } else {
    if (user.uid === gameInfo.gameStatus) {
      gameStatusText =  "You Won!"
    } else if (gameInfo.gameStatus === 'tie') {
      gameStatusText = "Its a tie!"
    } else {
      gameStatusText = "You Lost. Better luck next time."
    }
  }
  return <h6><i>{gameStatusText}</i></h6>
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
        `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_API}/clearBoard`,
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


const handleJoinGame = (user: firebase.User, gameInfo: GameInfoType,
                        setWarning: (show: boolean) => void) => {
  if (!user) {
    return setWarning(true)
  }
  enterLobby(gameInfo.lobbyId, user.uid, user.displayName || "Anonymous")
}

const enterLobby = async (lobbyId: string, uid: string, displayName: string): Promise<boolean> => {
  try {
    const result = await fetch(
      `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_API}/enterLobby`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ uid, lobbyId, displayName })
      }
    )
    if (result.ok) {
      return true
    } else {
      console.log(await result.text())
      return false
    }
  } catch (err) {
    console.log(err)
    return false
  }
}