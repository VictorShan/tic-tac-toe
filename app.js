"use strict"

const express = require('express');
const app = express();
const multer = require('multer');

const firebase = require('firebase');
const Firestore = require('firebase/firestore');
const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");
const { restart } = require('nodemon');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tic-tac-toe-82af8.firebaseio.com"
});

const db = admin.firestore();

// for application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module

app.post('/enterLobby', async (req, res) => {
  console.log("Enter lobby request:",req.body);
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
  res.send("will be implemented");
})


app.use(express.static('public'));
const PORT = process.env.port || 8080;
app.listen(PORT);


// Helper functions

async function createLobby(lobbyId, uid) {
  const data = {
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