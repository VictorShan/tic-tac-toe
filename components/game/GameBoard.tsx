import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Image from 'react-bootstrap/Image'
import styles from '../../styles/GameBoard.module.sass'

const EMPTY_BOARD = [
  ['','',''],
  ['','',''],
  ['','','']
]

type propsType = {
  boardData: string[][],
  onClick: (row: number, column: number) => void
}

export default function GameBoard({ boardData, onClick }: propsType) {
  const handleClick = (row: number): (col: number) => void => {
    return (column: number) => {
      onClick(row, column)
    }
  }
  return (
    <Container className={styles.board}>
      {generateRows(boardData, handleClick)}
    </Container>
  )
}

const generateRows = (boardData: string[][], handelClick: (row: number) => (col: number) => void) => {
  let content = []
  content.push(
    <Row className={styles.row} key={0}>
      {generateRow(boardData[0], handelClick(0))}
    </Row>
  )
  for (let i = 1; i < boardData.length; i++) {
    content.push(
      <div className={styles['hor-divider']} key={`divider-${i}`} />
    )
    content.push(
      <Row className={styles.row} key={i}>
        {generateRow(boardData[i], handelClick(i))}
      </Row>
    )
  }
  return content
}

const generateRow = (row: string[], handleClick: (column: number) => void) => {
  let newRow = []
  newRow.push(genTile(0, row, handleClick))
  for (let i = 1; i < row.length; i++) {
    newRow.push(
      <div className={styles['vert-divider']} key={`divider-${i}`} />
    )
    newRow.push(genTile(i, row, handleClick))
  }
  return newRow
}

const genTile = (colIdx: number, row: string[], handleClick: (column: number) => void) => {
  if (!row[colIdx]) {
    return (
      <Col className={styles.tile} key={colIdx}>
        <Image
          src={`/images/O.svg`}
          alt={row[colIdx]}
          onClick={() => handleClick(colIdx)}
          className={`${styles.placeholder} ${styles.img}`}/>
      </Col>
    )
  } else {
    return (
      <Col className={styles.tile} key={colIdx}>
        <Image src={`/images/${row[colIdx]}.svg`} alt={row[colIdx]} className={styles.img}/>
      </Col>
    )
  }
}

const calculateWin = (board: string[][], uid: string): string[][] => {
  const winBoard = EMPTY_BOARD
  for (let i = 0; i < board.length; i++) {
    // Horizontal and vertical
    if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
      winBoard[i][0] = winBoard[i][1] = winBoard[i][2] = uid === board[i][0] ? "green" : "red"
    } else if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
      winBoard[0][i] = winBoard[1][i] = winBoard[2][i] = uid === board[i][0] ? "green" : "red"
    }
    // If there was a horizontal or vertical line
    if (winBoard !== EMPTY_BOARD) {
      return winBoard
    }
  }

  // Diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    winBoard[0][0] = winBoard[1][1] = winBoard[2][2] = uid === board[0][0] ? "green" : "red"
  } else if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    winBoard[0][2] = winBoard[1][1] = winBoard[2][0] = uid === board[2][0] ? "green" : "red"
  }

  return winBoard
}