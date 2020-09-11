import { useAuth, AuthType } from "../utils/Firebase";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styles from '../styles/SignInUpForm.module.sass'
import { useState } from "react";
import { useRouter } from "next/router";

type propsType = {
  isSignIn: boolean
}

export default function SignInUpForm({ isSignIn }: propsType) {
  const purpose = isSignIn ? "SignIn" : "SignUp"
  const auth = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verifyPass, setVerifyPass] = useState('')
  const [validated, setValidated] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setValidated(true)
    if (!isSignIn && password !== verifyPass) {
      setVerifyPass('')
    } else {
      try {
        isSignIn ? await auth.signIn(email, password) :
                    await auth.signUp(username, email, password)
      } catch (err) {
        console.log(err)
      }
      router.back()
    }
  }
  
  return (
    <Form
      className={styles.form}
      onSubmit={event => handleSubmit(event)}
      validated={validated}
      noValidate
      >

        {!isSignIn && <Form.Group controlId="formSignUpUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter Username" required/>
          <Form.Control.Feedback type="invalid">Please enter a username!</Form.Control.Feedback>
        </Form.Group>}

        <Form.Group controlId={`form${purpose}Email`}>
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter email" required/>
          <Form.Control.Feedback type="invalid">Please enter a valid email!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId={`form${purpose}Password`}>
          <Form.Label>Password</Form.Label>
          <Form.Control
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}/>
          <Form.Control.Feedback type="invalid">Please enter a password!</Form.Control.Feedback>
        </Form.Group>

        {!isSignIn && <Form.Group controlId="formSignUpPasswordVerify">
          <Form.Label>Verify Password</Form.Label>
          <Form.Control
            key={"verify"}
            required
            isInvalid={password && verifyPass && password !== verifyPass}
            type="password"
            placeholder="Verify Password"
            value={verifyPass}
            onChange={e => setVerifyPass(e.target.value)}
            />
          <Form.Control.Feedback type="invalid">Please verify the passwords are the same.</Form.Control.Feedback>
        </Form.Group>}
        <Button variant="primary" type="submit">
          Submit
        </Button>
    </Form>
  )
}