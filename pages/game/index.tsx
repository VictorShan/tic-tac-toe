import Head from 'next/head'
import Button from 'react-bootstrap/Button'
import styles from '../../styles/index.module.sass'

export default function gameIndex() {
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
        <div>
          <Button variant='outline-primary' className={styles.button}>Play In Private Lobby</Button>
          <Button variant='outline-primary' className={styles.button} disabled>Play against Random Player</Button>
        </div>
      </main>
    </>
  )
}