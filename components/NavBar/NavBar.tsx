import Navbar from 'react-bootstrap/Navbar'
import SignInOptions from './SignInOptions'
import Link from 'next/link'

export default function NavBar() {
  return (
    <Navbar sticky='top' bg='light' expand='sm'>
      <Link href='/#home' passHref>
        <Navbar.Brand href="/#home">
          <img
            src="/vercel.svg"
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="React Bootstrap logo"
          />{' '}
          Tic Tac Toe
      </Navbar.Brand>
      </Link>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <SignInOptions />
      </Navbar.Collapse>
    </Navbar>
  )
}