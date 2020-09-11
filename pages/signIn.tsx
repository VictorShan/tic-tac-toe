import { firebaseType } from "../utils/Firebase";

type propsType = {
  firebase: firebaseType
}

export default function signIn({ firebase }: propsType) {
  const auth = firebase.auth
}