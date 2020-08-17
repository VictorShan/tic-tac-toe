"use strict"

const express = require('express');
const app = require("./functions/app");

app.use(express.static('public'));
const PORT = process.env.port || 8080;
app.listen(PORT);