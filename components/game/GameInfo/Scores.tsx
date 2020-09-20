import { userInfo } from './GameInfo'

type propsType = {
  player1: userInfo,
  player2: userInfo
}

export default function Scores({ player1, player2 }: propsType) {
  return (
    <section>
      <h3>Score:</h3>
      <h5>{player1?.displayName || "Player 1"}: {player1?.score || 0}</h5>
      <h5>{player2?.displayName || "Player 2"}: {player2?.score || 0}</h5>
    </section>
  )
}