(function () {
  window.addEventListener('load', initApp);
  function initApp() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var uid = user.uid;
        user.getIdToken().then(function(accessToken) {;
          document.getElementById('account-details').textContent = JSON.stringify({
            uid: uid,
            accessToken: accessToken
          }, null, '  ');
        });
      } else {
        // User is signed out.
        document.getElementById('account-details').textContent = 'null';
      }
    }, function(error) {
      console.log(error);
    });
  };
})();