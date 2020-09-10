import Navbar from 'react-bootstrap/Navbar'

export default function NavBar() {
  return (
    <Navbar fixed='top' bg='light' expand='sm'>
      <Navbar.Brand href="#home">
        <img
          src="/vercel.svg"
          width="30"
          height="30"
          className="d-inline-block align-top"
          alt="React Bootstrap logo"
        />{' '}
        Navbar with text
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          Signed in as: <a href="#login">Mark Otto</a>
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  )
}