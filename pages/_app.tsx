import 'bootstrap/dist/css/bootstrap.min.css'
import { AppProps } from 'next/dist/next-server/lib/router/router'
import Layout from '../components/Layout'
import firebase, { FirebaseCtx } from '../utils/Firebase'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <FirebaseCtx.Provider value={firebase()}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </FirebaseCtx.Provider>
  )
}

export default MyApp
