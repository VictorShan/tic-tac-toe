"use strict"

const express = require('express');
const app = express();
const multer = require('multer');

// for application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module

app.post('/enterLobby', (req, res) => {
  console.log("Enter lobby request:",req.body);
  res.send("Will be implemented");
});

app.post('/clearBoard', () => {
  res.send("will be implemented")
});


app.use(express.static('public'));
const PORT = process.env.port || 8080;
app.listen(PORT);