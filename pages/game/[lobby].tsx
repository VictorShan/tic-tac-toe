import Router, { useRouter } from 'next/router'
import Head from 'next/head'
import Game from '../../components/game/Game'
import nextCookies from 'next-cookies'

export default function gameLobby({ user, lobbyId }) {
 
  return (
    <>
      <Head>
        <title>Tic Tac Toe - Game</title>
        <meta name={"Description"} content={"A multiplayer game of tic tac toe."} />
      </Head>
      <Game lobbyId={lobbyId} user={user} />
    </>    
  )
}

export async function getServerSideProps(ctx) {
  const { user } = nextCookies(ctx)
  const lobbyId = ctx.params.lobby
  console.log(typeof user, user);
  
  if (!user) {
    if (ctx.req || ctx.res) {
      // In server
      ctx.res?.writeHead(302, { Location: '/signIn'})
      ctx.res?.end()
    } else {
      // On client

      Router.push('/signIn')
    }
  }
  return {
    props: {
      user,
      lobbyId
    }
  }
}