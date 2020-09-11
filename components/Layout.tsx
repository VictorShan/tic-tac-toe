import NavBar from './NavBar/NavBar'
import { FirebaseCtx } from '../utils/Firebase'
export default function Layout({ children }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  )
}