import { NextRouter, useRouter } from 'next/router'
import { withFirebase } from '../../utils/Firebase'
import { firebaseType } from '../../utils/Firebase'
import Button from 'react-bootstrap/Button'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { useEffect } from 'react'


type propsType = {
  firebase: firebaseType
}


const SignInOptions = ({ firebase }: propsType) => {
  const router = useRouter()
  useEffect(() => {
    console.log(firebase.user);
  }, [firebase.user])
  return firebase.user ? signedInOptions(firebase.auth, router) : notSignedInOptions(router)
}

const notSignedInOptions = (router: NextRouter) => {
  const goToSignIn = () => router.push('/signIn')
  return <Button onClick={goToSignIn} variant={'outlined-dark'}>Sign In</Button>
}

const signedInOptions = (auth: firebase.auth.Auth, router: NextRouter) => {
  const user = auth.currentUser
  const name = user.displayName || user.email || "Anonymous"
  return (
    <NavDropdown title={`Welcome ${name} `} id={'user-options-dropdown'}>
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={() => {auth.signOut(); console.log("Signed out");
      }}>Sign Out</NavDropdown.Item>
    </NavDropdown>
  )
}

export default withFirebase(SignInOptions)