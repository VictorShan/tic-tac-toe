"use strict";
(function() {
  window.addEventListener("load", init);

  initFirebase();
  let game;

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

  function setupGame(uid, lobbyId, playerGoesFirst) {
    game = new TicTacToe(playerGoesFirst, 500, 500, uid, lobbyId, true);
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
      data.append("uid", firebase.auth().currentUser.uid);
      console.log("lobby", data.get("lobby"));
      let res;
      try {
        res = await fetch("/enterLobby", {method: "POST", body: data})
        checkStatus(res);
        res = await res.text();
        console.log(res);
      } catch (error) {
        console.error(error);
      }
      // TODO: REMOVE
      res = {
        lobbyId: 'hello',
        playerGoesFirst: true
      }
      setupGame(firebase.auth().currentUser.uid, res.lobbyId, res.playerGoesFirst);
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
  }

  function signInAnonymously() {
    firebase.auth().signInAnonymously().catch((error) => {
      let errorCode = error.code;
      let errorMessage = error.message;
      console.log(errorCode, errorMessage);
    })
  }
})();