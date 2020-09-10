import NavBar from './NavBar'
//import styles from '../styles/Layout.module.sass' className={styles.wholePage}

export default function Layout({ children }) {
  return (
    <div >
      <NavBar />
      {children}
    </div>
  )
}