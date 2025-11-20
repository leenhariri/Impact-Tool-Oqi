import '../styles/globals.css';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.8/css/line.css" />

      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
