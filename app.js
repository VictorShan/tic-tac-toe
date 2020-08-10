"use strict"

const express = require('express');
const app = express();
const multer = require('multer');

const firebase = require('firebase');
const Firestore = require('firebase/firestore');
const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");
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
  let doc = await db.collection('lobbies').doc(req.body.lobby).get();
  if (!doc.exists) {
    await createLobby(req.body.lobby, req.body.uid)
    doc = await db.collection('lobbies').doc(req.body.lobby).get();
    console.log("Created Lobby:", doc.data());
  } else {
    console.log("Document data:", doc.data());
    await enterLobby(doc.data(), req.body.lobby, req.body.uid);
  } 
  res.send("Will be implemented");
});

app.post('/clearBoard', () => {
  res.send("will be implemented")
});

app.post('/makeMove', (req, res) => {
  res.send("will be implemented");
})


app.use(express.static('public'));
const PORT = process.env.port || 8080;
app.listen(PORT);


// Helper functions

async function createLobby(lobbyId, uid) {
  const data = {
    users: [uid],
    moves: {
      [uid]: [],
      lastMove: {
        time: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    score: {
      [uid]: 0
    }
  }
  await db.collection('lobbies').doc(lobbyId).set(data);
}

async function enterLobby(data, lobbyId, uid) {
  if (admin.firestore.Timestamp.now().seconds -
      data.moves.lastMove.time.seconds > 24*60*60) { // Last move was more than 24hrs ago
    createLobby(lobbyId, uid);
  } else {
    data.users.push(uid);
    data.score[uid] = 0;
    data.moves[uid] = [];
    data.score[uid] = 0;
    await db.collection('lobbies').doc(lobbyId).set(data);
  }
}