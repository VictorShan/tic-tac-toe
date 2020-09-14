import Image from 'react-bootstrap/Image'
import styles from '../../styles/Tile.module.sass'
import XorO from './XorO'

type propsType ={
  symbol?: string,
  onClick?: () => void,
  green?: boolean // Undefined for black
  red?: boolean
}

export default function Tile({ symbol, green, red, onClick }: propsType) {
  if (symbol) {
    if (green) {
      return (
        <XorO symbol={symbol} className={`${styles.tile} ${styles.win}`}/>
      )
    } else if (red) {
      return (
        <XorO symbol={symbol} className={`${styles.tile} ${styles.lose}`}/>
      )
    } else {
      return (
        <XorO symbol={symbol} className={styles.tile} />
      )
    }
  } else {
    const handleClick = onClick || function() {}
    return (
      <div className={styles.tile} onClick={handleClick} />
    )
  }
}