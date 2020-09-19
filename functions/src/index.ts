import * as functions from 'firebase-functions';
import game from './game'

exports.game = functions.https.onRequest(game)