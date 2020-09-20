import { useEffect, useState } from "react"


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
    let timer
    if (lastMoveDate.getTime() === 0) {
      console.log("No timer needed");
      setSeconds(0)
    } else if (Date.now() - lastMoveDate.getTime() > 0) {
      timer = setInterval(() => {
        setSeconds(old => {
          const secLeft = Math.floor(
            MAX_INACTIVE_SECONDS
            - (Date.now() - lastMoveDate.getTime()) / 1000
          )
          if (old == secLeft) {
            clearInterval(timer)
            const normalCountDown = setInterval(() => countdown(normalCountDown), 1000)
            return secLeft
          } else if (Math.abs(secLeft) > MAX_INACTIVE_SECONDS) {
            return 0
          } else if (old > secLeft) {
            return old - Math.max(1, Math.floor(Math.abs(old - secLeft) * .1))
          } else {
            return old + Math.max(1, Math.floor(Math.abs(old - secLeft) * .1))
          }
        })
      }, UPDATE_TIMER_SPEED)
    }
    return () => { clearInterval(timer) }
  }, [lastMoveDate])

  return (
    <div>
      <h6>Timer</h6>
      <p>Approximate lobby time left: {translateSeconds(seconds)}</p>
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