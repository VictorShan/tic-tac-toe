import * as functions from 'firebase-functions';
import game from './game'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.game = functions.https.onRequest(game)