import Head from 'next/head'
import Button from 'react-bootstrap/Button'
import { useState } from 'react'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Collapse from 'react-bootstrap/Collapse'
import indexStyles from '../../styles/index.module.sass'
import gameIndexStyles from '../../styles/gameIndex.module.sass'
import { useRouter } from 'next/router'
import { useAuth } from '../../utils/Firebase'
import ModialWarning from '../../components/ModialWarning'
import { getDisplayName } from 'next/dist/next-server/lib/utils'

const styles = {
  ...indexStyles,
  ...gameIndexStyles
}

export default function gameIndex() {
  const [lobbyId, setLobbyId] = useState('')
  const [showLobbyInput, setShowLobbyInput] = useState(false)
  const [validLobby, setValidLobby] = useState(true)
  const auth = useAuth()
  const [renderWarning, setRenderWarning] = useState<boolean | null>(auth.user === null || auth.user.isAnonymous)
  const router = useRouter()
  
  const tryEnterLobby = async () => {
    let user = auth.user
    if (user === null) {
      user = await auth.signInAnonymously()
    }
    if (await enterLobby(lobbyId, user.uid, user.displayName)) {
      router.push(`/game/${lobbyId}`)
    } else {
      setValidLobby(false)
    }
  }

  return (
    <>
      <Head>
        <title>Tic Tac Toe - Game</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.title}>
          <h1>Tic Tac Toe</h1>
          <h4>Sign in or continue anonymously</h4>
        </div>
        <div className={styles.buttonOptions}>
          <Button
            variant='outline-primary'
            className={styles.button}
            disabled={showLobbyInput}
            onClick={() => setShowLobbyInput(true)}>
              Play In Private Lobby
          </Button>
          <Button variant='outline-primary' className={styles.button} disabled>Play against Random Player</Button>
        </div>
        <Collapse in={showLobbyInput}>
          <InputGroup className={styles.inputLobby}>
            <FormControl
              formNoValidate
              isInvalid={!validLobby}
              placeholder="Lobby ID"
              aria-label="Lobby ID"
              aria-describedby="basic-addon2"
              value={lobbyId}
              required
              onChange={e => setLobbyId(e.target.value)}
            />
            <InputGroup.Append>
                <Button onClick={() => tryEnterLobby()} variant="outline-secondary">Play!</Button>
            </InputGroup.Append>
          </InputGroup>
        </Collapse>
      </main>
      <ModialWarning
        title={"Warning: Starting a game anonymously"}
        show={renderWarning}
        size={"lg"}
        message={"You are about to start a game anonymously. Please note that you will not able to" + 
                  " access this lobby session if you later sign in or refresh page."}
        primaryOptionText={"Sign In"}
        primaryOptionCallback={() => { router.push("/signIn") }}
        secondaryOptionText={"Continue Anonymously"}
        secondaryOptionCallback={() => { setRenderWarning(false) }}
        onHide={() => {setRenderWarning(false)}}
      />
    </>
  )
}

const enterLobby = async (lobbyId: string, uid: string, displayName: string): Promise<boolean> => {
  try {
    const response = fetch(
      'http://localhost:5001/tic-tac-toe-82af8/us-central1/game/enterLobby',
      {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ uid, lobbyId, displayName })
      }
    )
    let result = await response
    if (result.ok) {
      return true
    } else {
      console.log((await result.json()).message);
      return false
    }
  } catch (err) {
    console.log(err)
    return false
  }
}