import { NextRouter, useRouter } from 'next/router'
import Button from 'react-bootstrap/Button'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { useAuth, AuthType } from '../../utils/Firebase'
import cookie from 'js-cookie'
import { useEffect } from 'react'
import firebase from 'firebase/app'

export default function SignInOptions() {
  const router = useRouter()
  const auth = useAuth()
  let user = auth.user
  const userCookie = cookie.get('user')
  useEffect(() => {
    if (!user && userCookie) {
      auth.assignUser(JSON.parse(userCookie))
    }
  }, []);
  
  return user ? signedInOptions(auth, user) : notSignedInOptions(router)
}

const notSignedInOptions = (router: NextRouter) => {
  if (router.pathname === '/signIn') {
    return <Button onClick={() => router.back()} variant={'outline-dark'} >Back</Button>
  } else {
    const goToSignIn = () => router.push('/signIn')
    return <Button onClick={goToSignIn} variant={'outline-dark'}>Sign In</Button>
  } 
}

// if (router.pathname.match(/\/game\/.+/g)) {
//   return <Button variant={'outline-dark'} disabled={true}>Sign In</Button>
// } else 

const signedInOptions = (auth: AuthType, user?: firebase.User) => {
  user = auth.user || user
  const name = user.displayName || user.email || "Anonymous"
  return (
    <NavDropdown title={`Welcome ${name} `} id={'user-options-dropdown'}>
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={() => auth.signOut()}>Sign Out</NavDropdown.Item>
    </NavDropdown>
  )
}