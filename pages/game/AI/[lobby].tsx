import { useRouter } from "next/router"


export default function gameLobby() {
  const router = useRouter()
  const { lobby } = router.query
  return (
    <h1>The Lobby ID is: {lobby}</h1>
  )
}