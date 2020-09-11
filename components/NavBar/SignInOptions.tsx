import { NextRouter, useRouter } from 'next/router'
import Button from 'react-bootstrap/Button'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { useAuth, AuthType } from '../../utils/Firebase'


export default function SignInOptions() {
  const router = useRouter()
  const auth = useAuth()
  return auth.user ? signedInOptions(auth, router) : notSignedInOptions(router)
}

const notSignedInOptions = (router: NextRouter) => {
  const goToSignIn = () => router.push('/signIn')
  return <Button onClick={goToSignIn} variant={'outline-dark'}>Sign In</Button>
}

const signedInOptions = (auth: AuthType, router: NextRouter) => {
  const user = auth.user
  const name = user.displayName || user.email || "Anonymous"
  return (
    <NavDropdown title={`Welcome ${name} `} id={'user-options-dropdown'}>
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={() => auth.signOut()}>Sign Out</NavDropdown.Item>
    </NavDropdown>
  )
}