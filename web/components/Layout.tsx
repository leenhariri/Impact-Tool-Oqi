import Header from './Navbar';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '64px' }}>{children}</main>
      <Footer />
    </>
  );
}
