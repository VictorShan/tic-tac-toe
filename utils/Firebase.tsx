import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { useState, useEffect, useContext, createContext } from 'react'
import Cookies from 'js-cookie'

const COOKIE_SETTINGS = { expires: 7 }

if (firebase.apps.length == 0) {
  firebase.initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  })
}

// firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)

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
              Cookies.set("user", JSON.stringify(res.user), COOKIE_SETTINGS)
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
                .then(() => {setUser(res.user)})
              const user = { ...res.user, displayName: username }
              Cookies.set("user", JSON.stringify(res.user), COOKIE_SETTINGS)
              return user
            })
  }

  const signOut = () => {
    return firebase
            .auth()
            .signOut()
            .then(() => {
              Cookies.remove('user', COOKIE_SETTINGS)
              setUser(null)
            })
  }

  const signInWithGoogle = (): Promise<firebase.User | null> => {
    return firebase
            .auth()
            .signInWithPopup(new firebase.auth.GoogleAuthProvider())
            .then(res => {
              setUser(res.user)
              Cookies.set("user", JSON.stringify(res.user), COOKIE_SETTINGS)
              return res.user
            })
  }

  const signInAnonymously = () => {
    return firebase
            .auth()
            .signInAnonymously()
            .then(res => {
              setUser(res.user)
              Cookies.set("user", JSON.stringify(res.user), COOKIE_SETTINGS)
              return res.user
            })
  }

  const getGameDb = (lobbyId: string): firebase.firestore.DocumentReference => {
    return firebase
            .firestore()
            .collection(process.env.NEXT_PUBLIC_FIREBASE_COLLECTION)
            .doc(lobbyId)
  }

  const assignUser = (user:firebase.User) => { setUser(user) }

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
    assignUser,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInAnonymously,
    getGameDb
  }
}

type AuthType = {
  user: firebase.User,
  assignUser: (user:firebase.User) => void,
  signIn: (email: string, password: string) => Promise<firebase.User | null>,
  signUp: (username: string, email: string, password: string) => Promise<firebase.User | null>,
  signOut: () => Promise<void>,
  signInWithGoogle: () => Promise<firebase.User | null>,
  signInAnonymously: () => Promise<firebase.User | null>,
  getGameDb: (lobbyId: string) => firebase.firestore.DocumentReference
}

export type { AuthType }

export function ProvideAuth({ children }) {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

