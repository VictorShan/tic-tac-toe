import * as express from 'express'
import * as admin from 'firebase-admin'
import * as cors from 'cors'

const LOBBY_RECYCLE_HRS = 3

admin.initializeApp()
console.log(admin);

const db = admin.firestore()

const app = express()

app.use(cors({ origin: true }))

app.use(express.urlencoded({ extended: true }))

app.use(express.json())

type resString = {
  status: number,
  message: string
}

// type resJson = {
//   status: number,
//   message: JSON
// }

app.get('/anything', (req, res) => res.send("Hello!"))

// Entering the lobby
app.post('/enterLobby', async (req, res) => {
  if (!req.body) {
    res.status(400).send("Invalid request! No post body!")
  } else if (req.body.uid === undefined) {
    res.status(400).send("Invalid request! No user id provided!")
  } else if (req.body.lobbyId === undefined) {
    res.status(400).send("Invalid request! No lobby id provided!")
  } else if (typeof req.body.uid !== "string" || typeof req.body.lobbyId !== "string") {
    res.status(400).send("Invalid request! Please send the lobbyId and uid as strings.")
  } else {
    const doc = await db.collection('games').doc(req.body.lobbyId).get()
    let result
    if (doc.exists) {
      result = await enterLobby(req.body.uid, req.body.lobbyId, doc.data() || {})
    } else {
      result = await createLobby(req.body.uid, req.body.lobbyId)
    }
    res.status(result.status).send(result.message)
  }
})

async function createLobby(uid: string, lobbyId: string): Promise<resString> {
  const row = { 0: "", 1: "", 2: ""}
  const data = {
    players: [uid],
    board: {
      0: row,
      1: row,
      2: row
    },
    turn: uid,
    lastMoveTime: admin.firestore.FieldValue.serverTimestamp(),
    gameStatus: '', // uid indicates winner, 'tie' = tie, '' = in progress
    score: {
      [uid]: 0
    }
  }
  try {
    await db.collection('games').doc(lobbyId).set(data)
    return { status: 201, message: `Lobby ${lobbyId} created`}
  } catch (err) {
    return { status: 500, message: `Failed to create lobby ${lobbyId}: ${err.message}`}
  }
}

async function enterLobby(uid: string, lobbyId: string, data: FirebaseFirestore.DocumentData): Promise<resString> {
  const doc = db.collection('games').doc(lobbyId)
  console.log(data)
  console.log(data.players, data.turn, data.lastMoveTime);
  
  if (data.players.includes(uid)) {
    try {
      await doc.update({ lastMoveTime: admin.firestore.FieldValue.serverTimestamp() })
      return { status: 202, message: `Revived lobby ${lobbyId}`}
    } catch (err) {
      return { status: 500, message: `Failed to re-enter lobby.`}
    }
  } else if (admin.firestore.Timestamp.now().seconds - data.lastMoveTime.seconds
              > LOBBY_RECYCLE_HRS * 60 * 60) {
    return createLobby(uid, lobbyId)
  } else if (data.players.length === 2) {
    return { status: 304, message: `Lobby ${lobbyId} is full. Please use another lobby or try again later. Lobbies are` + 
                                    ` recycled after ${LOBBY_RECYCLE_HRS} hours of inactivity.`}
  } else {
    try {
      const newData = {
        players: [...data.players, uid],
        lastMoveTime: admin.firestore.FieldValue.serverTimestamp(),
        [`score.${uid}`]: 0
      }
      await doc.update(newData)
      return { status: 202, message: `Joined lobby ${lobbyId}`}
    } catch (err) {
      return { status: 500, message: `Failed to join lobby ${lobbyId}: ${err.message}`}
    }
  }
}

export default app