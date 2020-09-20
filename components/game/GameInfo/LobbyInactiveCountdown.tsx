import { useEffect, useState } from "react"
import styles from '../../../styles/LobbyInactiveCountdown.module.sass'

type propsType = {
  lastMoveDate: Date,
  callBack?: () => void
}

const UPDATE_TIMER_SPEED = 200 // ms
const MAX_INACTIVE_SECONDS = parseInt(process.env.NEXT_PUBLIC_MAX_LOBBY_INACTIVITY_HOURS) * 60 * 60

export default function LobbyInactiveCountdown({ lastMoveDate, callBack }: propsType) {
  const [seconds, setSeconds] = useState(0)
  const countdown = (intervalId) => {
    setSeconds(old => {
      if (old > 0) {
        return old - 1
      } else {
        clearInterval(intervalId)
        callBack()
        return 0
      }
    })
  }

  useEffect(() => {
    const timer = setInterval(() => countdown(timer), 1000)
    if (lastMoveDate.getTime() === 0) {
      setSeconds(0)
    } else if (Date.now() - lastMoveDate.getTime() > 0) {
      const secLeft = Math.floor(MAX_INACTIVE_SECONDS - (Date.now() - lastMoveDate.getTime()) / 1000)
      if (secLeft <= MAX_INACTIVE_SECONDS) {
        setSeconds(secLeft)
      } else {
        setSeconds(0)
      }
    }
    return () => { clearInterval(timer) }
  }, [lastMoveDate])

  return (
    <div className={styles.timer}>
      <h6>Inactivity Timer</h6>
      <p>Lobby will close in approximately {translateSeconds(seconds)} due to inactivity.</p>
    </div>
  )
}

function translateSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 60 / 60)
  const minutes = Math.floor(seconds / 60 - hours * 60)
  seconds = seconds - hours * 60 * 60 - minutes * 60
  return `${addZero(hours)}:${addZero(minutes)}:${addZero(seconds)}s`
}

// Adds a zero in front if number less than 10
function addZero(num: number): string {
  if (num < 10) {
    return `0${num}`
  } else {
    return `${num}`
  }
}