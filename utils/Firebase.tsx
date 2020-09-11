import { Firestore } from '@google-cloud/firestore'
import * as app from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import React from 'react'

const firebaseConfig = {
  apiKey: "AIzaSyD7pmPno2KyfM1hf5l667yek2MwcFeIhjo",
  authDomain: "tic-tac-toe-82af8.firebaseapp.com",
  databaseURL: "https://tic-tac-toe-82af8.firebaseio.com",
  projectId: "tic-tac-toe-82af8",
  storageBucket: "tic-tac-toe-82af8.appspot.com",
  messagingSenderId: "852004267914",
  appId: "1:852004267914:web:9531e4eb0e6d19a1e44a73",
  measurementId: "G-B2DW0S1R5E"
}

const FirebaseCtx = React.createContext(null)

const withFirebase = Component => props => (
  <FirebaseCtx.Consumer>
    {firebase => <Component {...props} firebase={firebase}/> }
  </FirebaseCtx.Consumer>
)

type firebaseType = Firebase
// {
//   auth: firebase.auth.Auth,
//   db: firebase.firestore.CollectionReference,
//   user: firebase.User | undefined,
//   updateUser: () => {}
// }

export default class Firebase {

  auth: firebase.auth.Auth
  db: firebase.firestore.CollectionReference
  user: firebase.User | undefined
  google: firebase.auth.GoogleAuthProvider_Instance
  constructor() {
    if (app.apps.length == 0) {
      app.initializeApp(firebaseConfig)
    }
    this.auth = app.auth()
    this.db = app.firestore().collection('games')
    this.user = app.auth().currentUser
    this.google = new app.auth.GoogleAuthProvider()
  }

  async signIn(email: string, password: string) {
    let user = await this.auth.signInWithEmailAndPassword(email, password)
    this.user = user.user
  }

  async signUp(username: string, email: string, password: string) {
    let user = await this.auth.createUserWithEmailAndPassword(email, password)
    await user.user.updateProfile({ displayName: username })
    this.user = user.user
  }

  async signOut() {
    this.auth.signOut()
    this.user = undefined
  }

  async signInWithGoogle() {
    this.user = (await this.auth.signInWithPopup(this.google)).user
  }
}

export { FirebaseCtx, withFirebase }
export type { firebaseType }
