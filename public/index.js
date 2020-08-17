"use strict";
(function() {
  window.addEventListener("load", init);

  // Global vars

  let game;
  let db;
  let notificationTimeout;


  initFirebase();

  function init() {
    addEventListeners();
  }

  function addEventListeners() {
    document.getElementById("reset-id").addEventListener('click', e => {
      firebase.auth().signOut();
      signInAnonymously();
      game = null;
    });
    document.getElementById("lobby-form").addEventListener("submit", enterLobby);
  }

  /**
   * Creates a new tic tac toe game by first removing the old one (if exists)
   * @param {string} uid User ID from firebase
   * @param {string} lobbyId Lobby ID
   */
  function setupGame(uid, lobbyId) {
    game = new TicTacToe(db.collection('lobbies').doc(lobbyId), 500, 500, uid, lobbyId);   
    let gameContainer = document.getElementById("game");
    let gameInfo = document.getElementById("game-info");
    let oldBoard = document.getElementById("game-board");
    if (oldBoard)
      oldBoard.remove();
    if (gameInfo)
      gameInfo.remove();

    // Make into method?
    let gameBoard = game.gameBoard;
    gameBoard.id = "game-board";
    gameContainer.appendChild(gameBoard);

    gameInfo = document.createElement("section");
    gameInfo.id = "game-info";
    gameContainer.appendChild(gameInfo);
    game.setInfoElement(gameInfo);
  }

  /**
   * Stop default form submission and try to create a new
   * tic tac toe game by calling server.
   * @param {Event} e The event of form submission
   */
  async function enterLobby(e) {
    e.preventDefault();
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
      res = await fetch("/enterLobby",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }
      );
      checkStatus(res);
      res = await res.json();
      showTemporaryAlert(res.message, true)
      setupGame(uid, res.lobbyId);
    } catch (error) {
      res = await res.json()
      showTemporaryAlert("Unable to join lobby: " + res.message, false);
    }
  }

  /**
   * Check is promise from server is OK
   * @param {promise} res A promise from server
   */
  function checkStatus(res) {
    if (res.ok) {
      return res;
    } else {
      throw Error(res.statusText);
    }
  }

  /**
   * Initialize firebase auth, firestore, and analytics. Signs in anonymously
   */
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

  /**
   * Signs in anonymously using firebase
   */
  function signInAnonymously() {
    firebase.auth().signInAnonymously().catch((error) => {
      let errorCode = error.code;
      let errorMessage = error.message;
      console.error(errorCode, errorMessage);
    })
  }

  /**
   * Displays message in notification bar for 10 seconds. Stores timer in
   * global variable notificationTimeout
   * @param {string} message Message displayed in the text
   * @param {boolean} isGood Whether it is a good or bad message
   */
  function showTemporaryAlert(message, isGood) {
    document.getElementById("notification-text").textContent = message;
    let notification = document.getElementById("notification");
    if (isGood) {
      notification.classList.remove("notification-bad");
      notification.classList.add("notification-good");
    } else {
      notification.classList.add("notification-bad");
      notification.classList.remove("notification-good");
    }
    notification.classList.remove("invisible");
    
    // Reset timeout
    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
      notification.classList.add("invisible");
    }, 10000);
  }

})();