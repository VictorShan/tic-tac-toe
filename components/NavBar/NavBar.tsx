import Navbar from 'react-bootstrap/Navbar'
import SignInOptions from './SignInOptions'

export default function NavBar() {
  return (
    <Navbar sticky='top' bg='light' expand='sm'>
      <Navbar.Brand href="#home">
        <img
          src="/vercel.svg"
          width="30"
          height="30"
          className="d-inline-block align-top"
          alt="React Bootstrap logo"
        />{' '}
        Tic Tac Toe
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <SignInOptions />
      </Navbar.Collapse>
    </Navbar>
  )
}