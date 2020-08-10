(function () {
  window.addEventListener('load', initApp);
  function initApp() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var uid = user.uid;
        user.getIdToken().then(function(accessToken) {;
          document.getElementById('uid').textContent = "User ID:" + uid;
        });
      } else {
        // User is signed out.
        document.getElementById('uid').textContent = 'null';
      }
    }, function(error) {
      console.log(error);
    });
  };
})();