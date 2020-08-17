const express = require('express');
const app = express();
const multer = require('multer');

const cors = require('cors');

const firebase = require('firebase');
const Firestore = require('firebase/firestore');
const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");

// Hours of inactivity until lobby is recycled
const LOBBY_RECYCLE_HRS = 3;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tic-tac-toe-82af8.firebaseio.com"
});

const db = admin.firestore();

// Cross origin requests
app.use(cors({ origin: true }));
// for application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module

app.post('/enterLobby', async (req, res) => {
  if (!req.body || req.body.uid === undefined || req.body.lobbyId === undefined) {
    res.status(400).send("Invalid Request")
  }
  const doc = await db.collection('lobbies').doc(req.body.lobbyId).get();
  let result;
  if (!doc.exists) {
    result = await createLobby(req.body.lobbyId, req.body.uid)
  } else {
    result = await enterLobby(doc.data(), req.body.lobbyId, req.body.uid);
  }
  result.lobbyId = req.body.lobbyId;
  res.status(result.status).json(result);
});

app.post('/clearBoard', (req, res) => {
  console.log("Clear Board");
  res.json({
    message: "Will be implemented",
    req: req.body
  })
});

app.post('/makeMove', async (req, res) => {
  try {
    const doc = await db.collection('lobbies').doc(req.body.lobbyId).get();
    if (!doc.exists)
      res.status(404).send("Lobby not found")
    let result = await newMove(req.body, doc.data());
    res.status(result.status).send(result.message);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
})

// Helper functions

/**
 * Create a new lobby that has never been used before. Fills out
 * the basic template and adds the user that created it to the game
 * @param {string} lobbyId New lobby name
 * @param {string} uid User id
 */
async function createLobby(lobbyId, uid) {
  const data = {
    gameOn: true,
    users: [uid],
    history: {
      [uid]: [],
      lastMove: {
        time: admin.firestore.FieldValue.serverTimestamp()
      },
      lastWinner: null
    },
    score: {
      [uid]: 0
    }    
  }
  try {
    await db.collection('lobbies').doc(lobbyId).set(data);
    return {
      status: 201,
      message: `Lobby ${lobbyId} created`
    }
  } catch (error) {
    console.error(error);
    return  {
      status: 500,
      message: "Server error"
    }
  }
}

/**
 * Enters a lobby by updating user information in the database.
 * Removes previous user if inactive for more than LOBBY_RECYCLE_HRS hours
 * @param {object} data The json data from the firebase document with game data
 * @param {string} lobbyId The lobby id
 * @param {string} uid The user id
 */
async function enterLobby(data, lobbyId, uid) {
  try {
    if (admin.firestore.Timestamp.now().seconds -
        data.history.lastMove.time.seconds > LOBBY_RECYCLE_HRS*60*60) {
      createLobby(lobbyId, uid);
    } else if (!data.users.includes(uid)) {
      if (data.users.length < 2) {
        data.users.push(uid);
        data.score[uid] = 0;
        data.history[uid] = [];
        data.score[uid] = 0;
        await db.collection('lobbies').doc(lobbyId).set(data);
      } else {
        return {
          status: 423,
          message: "Two player are already in this lobby! " +
                    "Lobby will open after " + LOBBY_RECYCLE_HRS + "hrs of idle time."
        }
      }
    } else {
      await db.collection('lobbies').doc(lobbyId).update({
        "history.lastMove.time": admin.firestore.FieldValue.serverTimestamp()
      });
    }
    return {
      status: 200,
      message: "Successfully joined lobby " + lobbyId
    }
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: "Server error"
    }
  }
}

/**
 * Make a new move
 * @param {object} reqBody The request body
 * @param {object} data The last turn's game data
 * @returns {object} An object with status and message attributes
 */
async function newMove(reqBody, data) {
  if (!data.users.includes(reqBody.uid) || data.history.lastMove.uid === reqBody.uid)
    return { status: 406, message: "Not your turn"};
  if (!data.gameOn) {
    return { status: 423, message: "Game has ended"};
  }
  data.history[reqBody.uid] = [...data.history[reqBody.uid], `${reqBody.x},${reqBody.y}`];
  let [winner, path] = determineWinner(data);
  let updateData = {
    [`history.${reqBody.uid}`]: data.history[reqBody.uid],
    'history.lastMove': {
      time:admin.firestore.FieldValue.serverTimestamp(),
      uid: reqBody.uid,
      x: reqBody.x,
      y: reqBody.y
    }
  }

  let message = {};
  if (winner === null) {
    // Do nothing, game in progress
  } else if (winner === false) {
    // Tie situation
    updateData[`history.lastWinner`] = {
      path: JSON.stringify([]),
      uid: false
    }
    updateData.gameOn = false;
    message.winner = false;
    message.path = [];
  } else if (winner === data.users[0]) {
    newWinner(data, updateData, data.users[0], path);
    message.winner = winner;
    message.path = path;
  } else if (winner === data.users[1]) {
    newWinner(data, updateData, data.users[1], path);
    message.winner = winner;
    message.path = path;
  } else {
    throw Error("Invalid state");
  }
  await db.collection('lobbies').doc(reqBody.lobbyId).update(updateData);
  return { status: 200, message: message };  
}

/**
 * Check whether or not someone has won
 * @param {object} docData The game data
 */
function determineWinner(docData) {
  // path is the winning path for that user if it exists, otherwise false
  let path0 = winCondition(docData.history[docData.users[0]]);
  let path1 = winCondition(docData.history[docData.users[1]]);
  if (path0) {
    return [docData.users[0], path0];
  } else if (path1) {
    return [docData.users[1], path1];
  } else if (docData.history[docData.users[0]].length + docData.history[docData.users[1]].length === 9) {
    return [false, null];
  }
  console.assert(docData.history[docData.users[0]].length + docData.history[docData.users[1]].length < 9,
    "There are, impossibly, more or equal to nine moves, without tie, in a tic tac toe game.");
  return [null, null];
}

/**
 * Checks a list of string coordinates for possible wins
 * @param {string[]} list List of string coordinates in the form "x,y"
 */
function winCondition(list) {
  if (list.includes('0,0') && list.includes('1,1') && list.includes('2,2')) {
    return [[0,0],[1,1],[2,2]];
  } else if (list.includes('0,2') && list.includes('1,1') && list.includes('2,0')) {
    return [[0,2], [1,1], [2,0]];
  }
  for (let i = 0; i < 3; i++) {
    if (list.includes(`0,${i}`) && list.includes(`1,${i}`) && list.includes(`2,${i}`)) {
      return [[0,i], [1,i],[2,i]];
    } else if (list.includes(`${i},0`) && list.includes(`${i},1`) && list.includes(`${i},2`)) {
      return [[i,0], [i,1], [i,2]];
    }
  }
  return false;
}

/**
 * Formats the new update query for a new winner
 * @param {object} docData Previous game data updated to last move
 * @param {object} updateData Data that will be updated
 * @param {string} uid The uid of the winner
 * @param {number[][]} path A list of coordinates that describe the winning line
 */
function newWinner(docData, updateData, uid, path) {
  updateData[`score.${uid}`] = docData.score[uid] + 1;
  updateData.gameOn = false;
  updateData[`history.lastWinner`] = {
    path: JSON.stringify(path),
    uid: uid
  }
}

module.exports = app;