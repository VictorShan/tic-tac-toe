import 'bootstrap/dist/css/bootstrap.min.css'
import { AppProps } from 'next/dist/next-server/lib/router/router'
import Layout from '../components/Layout'
import { ProvideAuth } from '../utils/Firebase'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ProvideAuth>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ProvideAuth>
  )
}

export default MyApp
