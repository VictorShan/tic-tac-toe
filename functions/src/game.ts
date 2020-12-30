import * as express from 'express'
import * as admin from 'firebase-admin'
import * as cors from 'cors'
import { hasWon, getArrs } from '../../components/ai/Agent'

const LOBBY_RECYCLE_HRS = 3
const CLEARED_BOARD = {
  0: ['','',''],
  1: ['','',''],
  2: ['','','']
}
// const INDEXES = ["0", "1", "2"]

admin.initializeApp()

const db = admin.firestore()

const app = express()

app.use(cors({ origin: true }))

app.use(express.urlencoded({ extended: true }))

app.use(express.json())

type resString = {
  status: number,
  message: string
}

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
    const displayName = req.body.displayName || "Anonymous"
    const doc = await db.collection('games').doc(req.body.lobbyId).get()
    let result
    if (doc.exists) {
      result = await enterLobby(req.body.uid, req.body.lobbyId, displayName, doc.data() || {})
    } else {
      result = await createLobby(req.body.uid, req.body.lobbyId, displayName)
    }
    res.status(result.status).send(result.message)
  }
})

async function createLobby(uid: string, lobbyId: string, displayName: string): Promise<resString> {
  const data = {
    players: [{uid: uid, displayName: displayName}],
    board: CLEARED_BOARD,
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

async function enterLobby(uid: string, lobbyId: string, displayName: string, data: FirebaseFirestore.DocumentData): Promise<resString> {
  const doc = db.collection('games').doc(lobbyId) 
  if (admin.firestore.Timestamp.now().seconds - data.lastMoveTime.seconds
              > LOBBY_RECYCLE_HRS * 60 * 60) {
    return createLobby(uid, lobbyId, displayName)
  } else if (data.players.map(player => player.uid).includes(uid)) {
    try {
      await doc.update({
        lastMoveTime: admin.firestore.FieldValue.serverTimestamp()
      })
      return { status: 202, message: `Revived lobby ${lobbyId}`}
    } catch (err) {
      return { status: 500, message: `Failed to re-enter lobby.`}
    }
  } else if (data.players.length === 2) {
    return { status: 304, message: `Lobby ${lobbyId} is full. Please use another lobby or try again later. Lobbies are` + 
                                    ` recycled after ${LOBBY_RECYCLE_HRS} hours of inactivity.`}
  } else {
    // Enter an existing lobby
    try {
      const newData = {
        players: [...data.players, {uid: uid, displayName: displayName}],
        lastMoveTime: admin.firestore.FieldValue.serverTimestamp(),
        [`score.${uid}`]: data.score[uid] || 0
      }
      await doc.update(newData)
      return { status: 202, message: `Joined lobby ${lobbyId}`}
    } catch (err) {
      return { status: 500, message: `Failed to join lobby ${lobbyId}: ${err.message}`}
    }
  }
}


// Make Move

app.post('/makeMove', async (req, res) => {
  if (!req.body || !req.body.uid || !req.body.lobbyId || !req.body.move ||
      typeof req.body.move.row !== 'number' || typeof req.body.move.col !== 'number') {
    res.status(400).send("Please provide a request body including the " + 
                          "{ uid: string, lobbyId string and move: {row: number, col: number}}." + 
                          "you gave " + JSON.stringify(req.body))
    return
  }
  const doc = await db.collection('games').doc(req.body.lobbyId).get()
  if (!doc.exists) {
    res.status(404).send(`Game at lobby ${req.body.lobbyId} not found.`)
    return
  }

  const data = doc.data() || {}
  if (data === {}) {
    res.status(500).send("Server Meltdown.") // Should never happen
    return
  }
    
  const playerUids = data.players.map((player: { uid: string, displayName: string }) => player.uid)
  if (!playerUids.includes(req.body.uid)) {
    res.status(401).send("Your are not a player!")
  } else if (data.gameStatus) {
    res.status(423).send("Invalid move. Game has ended.")
  } else if (data.turn !== req.body.uid) {
    res.status(401).send("Not your turn!")
  } else {
    // User has authorization to make a move
    const response = await makeMove(req.body.uid, req.body.lobbyId, req.body.move, data)
    res.status(response.status).send(response.message)
  }  
})

async function makeMove(uid: string, lobbyId: string,
                        move: { row: number, col: number},
                        data: FirebaseFirestore.DocumentData): Promise<resString> {
  const lobbyRef = db.collection('games').doc(lobbyId)
  const board = data.board
  if (board[move.row][move.col] !== '') {
    return { status: 406, message: "That is not a valid move."}
  } else {
    board[move.row][move.col] = uid
    try {
      const winner = hasWon(getArrs([board[0], board[1], board[2]]), data.players[0].uid, data.players[1].uid) //checkWin(data.board)
      const newData: object = { board }
      console.log("Winner?", winner)
      if (winner) {
        // Update Score?
        
        if (winner !== 'tie') {
          newData[`score.${winner}`] = data.score[winner] + 1
        }
        // Set winner
        newData['gameStatus'] = winner
      } else {
        // Switch Player Turn
        newData["turn"] = data.players[0].uid === uid ? data.players[1].uid : data.players[0].uid
      }
      newData["lastMoveTime"] = admin.firestore.FieldValue.serverTimestamp()
      await lobbyRef.update(newData)
      return { status: 202, message: `Move to ${move} made.`}
    } catch (err) {
      console.error(err);
      
      return { status: 500, message: "Server couldn't update."}
    }
    
  }
}

// function checkWin(board: { "0": string[], "1": string[], "2": string[] }): string | false {
//   for (let i of INDEXES) {
//     // Horizontal and vertical
//     if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
//       return board[i][0]
//     } else if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
//       return board[i][0]
//     }
//   }

//   // Diagonals
//   if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
//     return board[0][0]
//   } else if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
//     return board[0][2]
//   }
//   return checkDraw(board)
// }

// function checkDraw(board: { "0": string[], "1": string[], "2": string[] }) {
//   for (let rowIdx in board) {
//     for (let col of board[rowIdx]) {
//       if (!col) return false
//     }
//   }
//   return 'tie'
// }

// Clear Board
app.post('/clearBoard', async (req, res) => {
  if (!req.body || !req.body.lobbyId || !req.body.uid) {
    res.status(400).send("Please send both uid and lobbyId.")
    return
  }
  const docRef = db.collection('games').doc(req.body.lobbyId)
  // Check game state
  const doc = await docRef.get()
  if (!doc.exists) {
    res.status(404).send("Game lobby does not exist.")
    return
  }
  const data = doc.data()

  // Game is finished?
  if (!data.gameStatus) {
    res.status(412).send("Game has not ended so board cannot be cleared.")
    return
  }

  // Should clear board
  try {
    await docRef.update({
      turn: data.turn === data.players[0].uid ? data.players[1].uid : data.players[0].uid,
      board: CLEARED_BOARD,
      gameStatus: ''
    })
    res.status(200).send(`Lobby ${req.body.lobbyId}'s game board has been cleared.`)
    return
  } catch (err) {
    res.status(500).send(`Failed to clear game board for ${req.body.lobbyId}`)
    return
  }

})

export default app