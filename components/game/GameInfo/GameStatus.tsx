import { GameInfoType } from './GameInfo'


type propsType = {
  gameInfo: GameInfoType,
  user: firebase.User
}

export default function GameStatus({ gameInfo, user }: propsType) {
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