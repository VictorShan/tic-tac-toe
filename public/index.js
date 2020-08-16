"use strict";
(function() {
  window.addEventListener("load", init);

  // Global vars

  let game;
  let db;


  initFirebase();

  function init() {
    addEventListeners();
    displayInstructions();
  }

  function addEventListeners() {
    document.getElementById("reset-id").addEventListener('click', e => {
      firebase.auth().signOut();
      signInAnonymously();
      game = null;
    });
    document.getElementById("submit-lobby").addEventListener("click", enterLobby);
  }

  function setupGame(uid, lobbyId) {
    game = new TicTacToe(db.collection('lobbies').doc(lobbyId), 500, 500, uid, lobbyId);    
    let main = document.querySelector("main");
    let oldBoard = document.getElementById("game-board");
    if (oldBoard) {
      main.removeChild(oldBoard);
    }
    let gameBoard = game.gameBoard;
    gameBoard.id = "game-board";
    main.appendChild(gameBoard);
  }

  async function enterLobby() {
    let lobbyId = document.getElementById("lobby-id").value;
    let uid = firebase.auth().currentUser.uid;
    // TODO: display message here
    if (!lobbyId || !uid) return;
    let data = {
      lobbyId: lobbyId,
      uid: uid
    }
    let res;
    try {
      res = await fetch("/enterLobby", { method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data) });
      checkStatus(res);
      res = await res.json();
      setupGame(uid, res.lobbyId);
    } catch (error) {
      console.error(error);
    }
  }

  function checkStatus(res) {
    if (res.ok) {
      return res;
    } else {
      throw Error(res.statusText);
    }
  }

  function initFirebase() {
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyD7pmPno2KyfM1hf5l667yek2MwcFeIhjo",
      authDomain: "tic-tac-toe-82af8.firebaseapp.com",
      databaseURL: "https://tic-tac-toe-82af8.firebaseio.com",
      projectId: "tic-tac-toe-82af8",
      storageBucket: "tic-tac-toe-82af8.appspot.com",
      messagingSenderId: "852004267914",
      appId: "1:852004267914:web:9531e4eb0e6d19a1e44a73",
      measurementId: "G-B2DW0S1R5E"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
    db = firebase.firestore();
    signInAnonymously();
  }

  function signInAnonymously() {
    firebase.auth().signInAnonymously().catch((error) => {
      let errorCode = error.code;
      let errorMessage = error.message;
      console.error(errorCode, errorMessage);
    })
  }

  /**
   * Displays the instructions from firebase /public/instructions
   */
  async function displayInstructions() {
    let doc = await db.collection('public').doc('instructions').get();
    if (doc.exists) {
      let instructions = doc.data();
      document.getElementById('instructions-text').textContent = instructions["instructions-text"];
    } else {
      document.getElementById('instructions-text').textContent = "No instructions found. Do your best!";
    }
  }
})();