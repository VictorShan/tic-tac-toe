import { useAuth } from "../../utils/Firebase"
import styles from '../../styles/GameInfo.module.sass'

export type GameInfoType = {
  lobbyId: string
  player1: userInfo,
  player2: userInfo,
  turn: string,
  gameWinner?: string
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
  return (
    <div className={styles['info-container']}>
      <h1>Lobby ID: {gameInfo.lobbyId}</h1>
      <h3>Player 1: {gameInfo.player1.displayName} {gameInfo.player1.uid === auth.user.uid ? "(you)" : "" }</h3>
      <h3>Player 2: {gameInfo.player2.displayName} {gameInfo.player2.uid === auth.user.uid ? "(you)" : "" }</h3>
    </div>
  )
}