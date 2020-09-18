import { useRouter } from 'next/router'
import Head from 'next/head'
import Game from '../../components/game/Game'
import { useEffect } from 'react'
import { useState } from 'react'

export default function gameLobby() {
  const router = useRouter()
  const [lobbyId, setLobbyId] = useState('')

  useEffect(() => {
    const { lobby } = router.query
    if (lobby) {
      setLobbyId(typeof lobby === 'string' ? lobby : lobby[0])
    }
  }, [router.query])
 
  return (
    <>
      <Head>
        <title>Tic Tac Toe - Game</title>
        <meta name={"Description"} content={"A multiplayer game of tic tac toe."} />
      </Head>
      {lobbyId && <Game lobbyId={lobbyId} />}
    </>    
  )
}