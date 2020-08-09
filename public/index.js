"use strict";
(function() {
  window.addEventListener("load", init);

  initFirebase();
  let game = new TicTacToe(true, 500, 500, () => {});

  function init() {
    addEventListeners();
    signInAnonymously();
    setupGame();
  }

  function addEventListeners() {
    document.getElementById("reset-id").addEventListener('click', e => {
      firebase.auth().signOut();
      signInAnonymously();
    });
    document.getElementById("enter-lobby").addEventListener("submit", enterLobby);
  }

  function setupGame() {
    console.log(game);
    let gameBoard = game.gameBoard;
    //gameBoard.classList.add("hidden");
    document.getElementById("enter-lobby").classList.add("hidden");
    document.querySelector("main").appendChild(gameBoard);
  }

  async function enterLobby(e) {
      e.preventDefault();
      let data = new FormData(document.getElementById("enter-lobby"));
      console.log("lobby ", data.get("lobby"));
      try {
        let res = await fetch("/enterLobby", {method: "POST", body: data})
        checkStatus(res);
        res = await res.text();
        console.log(res);
        enterGameMode();
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
  }

  function signInAnonymously() {
    firebase.auth().signInAnonymously().catch((error) => {
      let errorCode = error.code;
      let errorMessage = error.message;
      console.log(errorCode, errorMessage);
    })
  }
})();