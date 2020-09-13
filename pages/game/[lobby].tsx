import { useRouter } from 'next/router'
import Head from 'next/head'
import Game from '../../components/game/Game'


export default function gameLobby() {
  const router = useRouter()
  const { lobby } = router.query  
  let lobbyId = typeof lobby === "string" ? lobby : ''
  if (lobbyId === '') {
    const path = router.pathname.split('/')
    lobbyId = path[path.length - 1]
  }
  return (
    <>
      <Head>
        <title>Tic Tac Toe - Game</title>
        <meta name={"Description"} content={"A multiplayer game of tic tac toe."} />
      </Head>
      <Game lobbyId={lobbyId} />
    </>    
  )
}