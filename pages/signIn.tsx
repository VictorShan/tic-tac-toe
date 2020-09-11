import styles from '../styles/signIn.module.sass'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import SignInUpForm from '../components/SignInUpForm'
import Head from 'next/head'

export default function signIn() {
  return (
    <>
    <Head>
      <title>Tic Tac Toe - Sign In</title>
      <meta name={"description"} content={"This is the sigin in page for Victor Shan's Tic Tac Toe game."} />
    </Head>
    <div className={styles.container}>
      <main className={styles.main}>
        <Tabs defaultActiveKey={"sign-in"} id={"uncontrolled-tab-example"} className={styles.tabs}>
          <Tab eventKey={"sign-in"} title={<h3>Sign In</h3>} className={styles.tab}>
            <SignInUpForm isSignIn={true} />
          </Tab>
          <Tab eventKey={"sign-up"} title={<h3>Sign Up</h3>} className={styles.tab}>
            <SignInUpForm isSignIn={false} />
          </Tab>
        </Tabs>
      </main>
    </div>
    </>
  )
}