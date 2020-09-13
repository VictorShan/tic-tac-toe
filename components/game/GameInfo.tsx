import styles from '../../styles/GameInfo.module.sass'
import { useAuth } from '../../utils/Firebase'

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
      <h3>Player 1: {gameInfo.player1.displayName} {gameInfo.player1.uid === user.uid ? "(you)" : "" }</h3>
      <h3>Player 2: {gameInfo.player2.displayName} {gameInfo.player2.uid === user.uid ? "(you)" : "" }</h3>
      {processGameStatus(auth.user, gameInfo.gameStatus)}
    </div>
  )
}

const processGameStatus = (user: firebase.User, gameStatus: string) => {
  if (!user || !gameStatus) {
    return
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