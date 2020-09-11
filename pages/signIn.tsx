import styles from '../styles/signIn.module.sass'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import SignInUpForm from '../components/SignInUpForm'

export default function signIn() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Tabs defaultActiveKey={"sign-in"} id={"uncontrolled-tab-example"} className={styles.tabs}>
          <Tab eventKey={"sign-in"} title={<h3>Sign In</h3>} className={styles.tab}>
            <SignInUpForm isSignIn />
          </Tab>
          <Tab eventKey={"sign-up"} title={<h3>Sign Up</h3>} className={styles.tab}>
            <SignInUpForm />
          </Tab>
        </Tabs>
      </main>
    </div>
  )
}