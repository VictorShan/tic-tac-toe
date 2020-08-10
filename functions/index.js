const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const express = require('express');
const app = express();
const multer = require('multer');

const firebase = require('firebase');
const Firestore = require('firebase/firestore');
const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");
const { restart } = require('nodemon');
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

// for application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module

app.post('/enterLobby', async (req, res) => {
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

app.post('/clearBoard', () => {
  res.send("will be implemented")
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

exports.serverFunction = functions.https.onRequest(app);
// app.use(express.static('public'));
// const PORT = process.env.port || 8080;
// app.listen(PORT);


// Helper functions

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

async function enterLobby(data, lobbyId, uid) {
  try {
    if (admin.firestore.Timestamp.now().seconds -
        data.history.lastMove.time.seconds > 1*60*60) { // Last move was more than 3hrs ago
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
                    "Lobby will open after 1hr of idle time."
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

  if (winner === null) {
    // Do nothing
  } else if (winner === false) {
    updateData.gameOn = false;
  } else if (winner === data.users[0]) {
    newWinner(data, updateData, data.users[0], path);
  } else if (winner === data.users[1]) {
    newWinner(data, updateData, data.users[1], path);
  } else {
    throw Error("Invalid state");
  }
  await db.collection('lobbies').doc(reqBody.lobbyId).update(updateData);
  return { status: 200 }  
}

function determineWinner(docData) {
  // path is getting assigned in the if statement and then its value is tested
  let path;
  // eslint-disable-next-line no-cond-assign
  if (path = winCondition(docData.history[docData.users[0]])) {
    return [docData.users[0], path];
  // eslint-disable-next-line no-cond-assign
  } else if (path = winCondition(docData.history[docData.users[1]])) {
    return [docData.users[1], path];
  } else if (docData.history[docData.users[0]].length + docData.history[docData.users[1]].length === 9) {
    return [false, null];
  }
  console.log(docData.history);
  console.log(docData.history[docData.users[0]].length + docData.history[docData.users[1]].length);
  console.assert(docData.history[docData.users[0]].length + docData.history[docData.users[1]].length < 9,
    "There are, impossibly, more or equal to nine moves in a tic tac toe game.");
  return [null, null];
}

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

function newWinner(docData, updateData, uid, path) {
  updateData[`score.${uid}`] = docData.score[uid] + 1;
  updateData.gameOn = false;
  updateData[`history.lastWinner`] = {
    path: JSON.stringify(path),
    uid: uid
  }
}
