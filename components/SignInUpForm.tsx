import { firebaseType, withFirebase } from "../utils/Firebase";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styles from '../styles/SignInUpForm.module.sass'
import { useEffect, useState } from "react";

type propsType = {
  firebase: firebaseType
  isSignIn: boolean
}

const SignInUpForm = ({ firebase, isSignIn }: propsType) => {
  const purpose = isSignIn ? "SignIn" : "SignUp"
  const auth = firebase.auth
  const [password, setPassword] = useState('')
  const [verifyPass, setVerifyPass] = useState('')
  const [validated, setValidated] = useState(false)
  console.log(validated, password, verifyPass)

  const handleSubmit = (event) => {
    event.preventDefault()
    setValidated(true)
    if (password !== verifyPass) {
      setVerifyPass('')
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
          <Form.Control type="text" placeholder="Enter Username" required/>
          <Form.Control.Feedback type="invalid">Please enter a username!</Form.Control.Feedback>
        </Form.Group>}

        <Form.Group controlId={`form${purpose}Email`}>
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" placeholder="Enter email" required/>
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

export default withFirebase(SignInUpForm)