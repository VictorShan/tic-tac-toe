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

const styles = {
  ...indexStyles,
  ...gameIndexStyles
}

export default function gameIndex() {
  const [lobbyId, setLobbyId] = useState('')
  const [showLobbyInput, setShowLobbyInput] = useState(false)
  const [validLobby, setValidLobby] = useState(true)
  const router = useRouter()
  const auth = useAuth()
  const tryEnterLobby = (lobbyId: string) => {
    if (enterLobby(lobbyId, auth.user)) {
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
                <Button onClick={() => tryEnterLobby(lobbyId)} variant="outline-secondary">Play!</Button>
            </InputGroup.Append>
          </InputGroup>
        </Collapse>
      </main>
    </>
  )
}

const enterLobby = (lobbyId: string, user: firebase.User): boolean => {
  return lobbyId === '123'
}