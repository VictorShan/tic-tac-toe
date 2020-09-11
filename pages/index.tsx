import Head from 'next/head'
import Button from 'react-bootstrap/Button'
import styles from '../styles/Home.module.sass'

export default function Home() {
  return (
    <>
      <Head>
        <title>Tic Tac Toe</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.title}>
          <h1>Tic Tac Toe</h1>
          <h4>Sign in or continue anonymously</h4>
        </div>
        <div>
          <Button variant='outline-primary' className={styles.button}>Multiplayer</Button>
          <Button variant='outline-primary' className={styles.button} disabled>Play against AI</Button>
        </div>
      </main>
    </>
  )
}
