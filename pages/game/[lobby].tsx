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

// export const getStaticPaths:GetStaticProps = async (context:GetStaticPropsContext) => {
//   return {
//     props: {
//       lobbyId: context.params.lobby
//     }
//   }
// }

// export async function getServerSideProps(ctx) {
//   const { user } = nextCookies(ctx)
//   const lobbyId = ctx.params.lobby
//   console.log(typeof user, user);
  
//   if (!user) {
//     if (ctx.req || ctx.res) {
//       // In server
//       ctx.res?.writeHead(302, { Location: '/signIn'})
//       ctx.res?.end()
//     } else {
//       // On client

//       Router.push('/signIn')
//     }
//   }
//   return {
//     props: {
//       user,
//       lobbyId
//     }
//   }
// }