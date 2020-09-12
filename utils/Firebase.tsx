import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { useState, useEffect, useContext, createContext } from 'react'

if (firebase.apps.length == 0) {
  firebase.initializeApp({
    apiKey: "AIzaSyD7pmPno2KyfM1hf5l667yek2MwcFeIhjo",
    authDomain: "tic-tac-toe-82af8.firebaseapp.com",
    databaseURL: "https://tic-tac-toe-82af8.firebaseio.com",
    projectId: "tic-tac-toe-82af8",
    storageBucket: "tic-tac-toe-82af8.appspot.com",
    messagingSenderId: "852004267914",
    appId: "1:852004267914:web:9531e4eb0e6d19a1e44a73",
    measurementId: "G-B2DW0S1R5E"
  })
}

const authContext = createContext<AuthType | null>(null)

export const useAuth = () => {
  return useContext(authContext)
}

function useProvideAuth(): AuthType {
  const [user, setUser] = useState(null)
  
  const signIn = (email: string, password: string): Promise<firebase.User | null> => {
    return firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(res => {
              setUser(res.user)
              return res.user
            })
  }

  const signUp = (username: string,
                  email: string,
                  password: string): Promise<firebase.User | null> => {
    return firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then(res => {
              res.user.updateProfile({ displayName: username })
                .then(() => setUser(firebase.auth().currentUser))
              return res.user
            })
  }

  const signOut = () => {
    return firebase
            .auth()
            .signOut()
            .then(() => {
              setUser(null)
            })
  }

  const signInWithGoogle = (): Promise<firebase.User | null> => {
    return firebase
            .auth()
            .signInWithPopup(new firebase.auth.GoogleAuthProvider())
            .then(res => {
              setUser(res.user)
              return res.user
            })
  }

  const signInAnonymously = () => {
    return firebase
            .auth()
            .signInAnonymously()
            .then(res => {
              setUser(res.user)
              console.log("Anonymous User:", res.user)
              console.log("Name:", res.user.displayName)
              return res.user
            })
  }

  const getGameDb = (lobbyId: string): firebase.firestore.DocumentReference => {
    return firebase
            .firestore()
            .collection('games')
            .doc(lobbyId)
  }

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })
    return unsubscribe()
  }, [])


  return {
    user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInAnonymously,
    
  }
}

type AuthType = {
  user: firebase.User,
  signIn: (email: string, password: string) => Promise<firebase.User | null>,
  signUp: (username: string, email: string, password: string) => Promise<firebase.User | null>,
  signOut: () => Promise<void>,
  signInWithGoogle: () => Promise<firebase.User | null>,
  signInAnonymously: () => Promise<firebase.User | null>,
}

export type { AuthType }

export function ProvideAuth({ children }) {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

