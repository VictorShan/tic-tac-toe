"use strict"

const express = require('express');
const app = express();
const multer = require('multer');
// const path = require('path');



// for application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module

// app.get('/game', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/game.html'))
// })

app.post('/enterLobby', (req, res) => {
  res.send("Will be implemented");
});

app.post('/clearBoard', () => {
  res.send("will be implemented")
});


app.use(express.static('public'));
const PORT = process.env.port || 8080;
app.listen(PORT);