import styles from '../../../styles/GameInfo.module.sass'
import { useAuth } from '../../../utils/Firebase'
import Button from 'react-bootstrap/Button'
import { useState } from 'react'
import ModalWarning from '../../ModalWarning'
import { useRouter } from 'next/router'
import { useAlert } from '../../../utils/Alert'
import Scores from './Scores'
import GameStatus from './GameStatus'
import { AlertPropsType } from '../../Alerts/AlertTimed'
import LobbyInactiveCountdown from './LobbyInactiveCountdown'
import firebase from 'firebase'

const FUNCTIONS_URL = process.env.NEXT_PUBLIC_TESTING === 'true' ? 
    process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_API_TEST :
    process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_API

export type GameInfoType = {
  lobbyId: string
  player1?: userInfo,
  player2?: userInfo,
  lastMoveDate: Date,
  turn: string,
  gameStatus?: string
}

export const DEFAULT_INFO: GameInfoType = {
  lobbyId: "Unknown",
  lastMoveDate: new Date(0),
  turn: 'Unknown'
}

export type userInfo = {
  displayName: string,
  uid: string,
  score: number
}

type propsType = {
  gameInfo: GameInfoType
}

export default function GameInfo({ gameInfo }: propsType) {
  const router = useRouter()
  const addAlert = useAlert()
  const auth = useAuth()
  const user = auth.user || { uid: ''}
  const [showWarning, setShowWarning] = useState(false)

  const anonymousJoinGame = async () => {
    let user = auth.user
    if (!user) {
      user = await auth.signInAnonymously()
    }
    enterLobby(gameInfo.lobbyId, user.uid, user.displayName || "Anonymous", addAlert)
  }

  return (
    <div className={styles['info-container']}>
      <h1>Lobby ID: {gameInfo.lobbyId}</h1>
      <h4>Player 1: {gameInfo.player1?.displayName} {gameInfo.player1?.uid === user.uid ? "(you)" : "" }</h4>
      <h4>Player 2: {gameInfo.player2?.displayName} {gameInfo.player2?.uid === user.uid ? "(you)" : "" }</h4>
      <hr className={styles.divider} />
      <Scores player1={gameInfo.player1} player2={gameInfo.player2} />
      <GameStatus gameInfo={gameInfo} user={auth.user} />
      {showResetButton(gameInfo, auth.user, gameInfo.lobbyId)}
      {showJoinGame(auth.user, gameInfo, setShowWarning, addAlert)}
      <LobbyInactiveCountdown lastMoveDate={gameInfo.lastMoveDate} callBack={() => { setShowWarning(old => old) }}/>
      <ModalWarning
        title={"Warning: Starting a game anonymously"}
        show={showWarning}
        size={"lg"}
        message={"You are about to start a game anonymously. Please note that you will not able to" + 
                  " access this lobby session if you sign in later."}
        primaryOptionText={"Sign In"}
        primaryOptionCallback={() => { router.push("/signIn") }}
        secondaryOptionText={"Continue Anonymously"}
        secondaryOptionCallback={() => { anonymousJoinGame() }}
        onHide={() => { setShowWarning(false)}}
      />
    </div>
  )
}


const showResetButton = (gameInfo: GameInfoType, user: firebase.User, lobbyId: string) => {
  const uid = user && user.uid || "Unknown"
  if (gameInfo.gameStatus
      && user
      && [gameInfo.player1?.uid, gameInfo.player2?.uid].includes(user.uid)) {
    return (
      <Button
        variant={'outline-dark'}
        className={styles.button}
        onClick={() => clearBoard(uid, lobbyId)}>
          Reset Board
      </Button>
    )
  }
}


const clearBoard = async (uid: string, lobbyId: string) => {
  try {
    if (!uid) {
      throw Error("Not signed in.")
    }
    const res = await fetch(
        `${FUNCTIONS_URL}/clearBoard`,
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


const showJoinGame = (user: firebase.User, gameInfo: GameInfoType,
                      setWarning: (show: boolean) => void,
                      addAlert: (data: AlertPropsType) => void) => {
  const withinTime = Date.now() - gameInfo.lastMoveDate.getTime()
                        < parseInt(process.env.NEXT_PUBLIC_MAX_LOBBY_INACTIVITY_HOURS) * 60 * 60 * 1000
  if (!withinTime || !gameInfo.player1 || !gameInfo.player2
        && (!user
        || (user?.uid !== gameInfo.player1?.uid
        && user?.uid !== gameInfo.player2?.uid))) {
    return (
      <Button
        variant={'outline-dark'}
        className={styles.button}
        onClick={() => handleJoinGame(user, gameInfo, setWarning, addAlert)}>
          Enter Game
      </Button>
    )
  }
}

const handleJoinGame = (user: firebase.User, gameInfo: GameInfoType,
                        setWarning: (show: boolean) => void,
                        addAlert: (data: AlertPropsType) => void) => {
  const willWarn = !user || !!user.isAnonymous
  willWarn ?
    setWarning(willWarn) : 
    enterLobby(gameInfo.lobbyId, user.uid, user.displayName || "Anonymous", addAlert)
}

const enterLobby = async (lobbyId: string, uid: string, displayName: string,
                          addAlert: (data: AlertPropsType) => void): Promise<boolean> => {
  try {
    const result = await fetch(
      `${FUNCTIONS_URL}/enterLobby`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ uid, lobbyId, displayName })
      }
    )
    if (result.ok) {
      return true
    } else {
      throw Error(await result.text())
    }
  } catch (err) {
    addAlert({
      message: err.message,
      variant: "danger",
      heading: "Could not join game",
      duration: 5000
    })
    return false
  }
}