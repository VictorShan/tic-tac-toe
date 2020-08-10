"use strict";
(function() {
  window.addEventListener("load", init);

  // Global vars

  let game;
  let db;


  initFirebase();

  function init() {
    addEventListeners();
    signInAnonymously();
  }

  function addEventListeners() {
    document.getElementById("reset-id").addEventListener('click', e => {
      firebase.auth().signOut();
      signInAnonymously();
      game = null;
    });
    document.getElementById("enter-lobby").addEventListener("submit", enterLobby);
  }

  function setupGame(uid, lobbyId) {
    game = new TicTacToe(db, 500, 500, uid, lobbyId, true);
    console.log(game);
    let gameBoard = game.gameBoard;
    //gameBoard.classList.add("hidden");
    //document.getElementById("enter-lobby").classList.add("hidden");
    let main = document.querySelector("main");
    main.appendChild(gameBoard);
  }

  async function enterLobby(e) {
      e.preventDefault();
      let data = new FormData(document.getElementById("enter-lobby"));
      let uid = firebase.auth().currentUser.uid;
      data.append("uid", uid);
      console.log("lobbyId", data.get("lobby"));
      let res;
      try {
        res = await fetch("/enterLobby", {method: "POST", body: data})
        checkStatus(res);
        res = await res.json();
        console.log(res);
      } catch (error) {
        console.error(error);
      }
      // TODO: REMOVE
      setupGame(uid, res.lobbyId);
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
  }

  function signInAnonymously() {
    firebase.auth().signInAnonymously().catch((error) => {
      let errorCode = error.code;
      let errorMessage = error.message;
      console.log(errorCode, errorMessage);
    })
  }
})();