import Head from 'next/head'
import Link from 'next/link'
import Button from 'react-bootstrap/Button'
import styles from '../styles/index.module.sass'

export default function Home() {
  return (
    <>
      <Head>
        <title>Tic Tac Toe</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name={'description'} content={"A Tic Tac Toe where users can play against other players or against an AI"}/>
      </Head>
      <main className={styles.main}>
        <div className={styles.title} id={"Home"}>
          <h1>Tic Tac Toe</h1>
        </div>
        <div>
          <Link href={"/game"} passHref><Button variant='outline-primary' className={styles.button}>Multiplayer</Button></Link>
          <Button variant='outline-primary' className={styles.button} disabled>Play against AI</Button>
        </div>
      </main>
    </>
  )
}
