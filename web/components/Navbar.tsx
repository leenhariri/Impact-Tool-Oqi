import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [heroTranslateY, setHeroTranslateY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  const isHome = router.pathname === "/";

  useEffect(() => {
    // Only add scroll logic on the homepage
    if (!isHome) {
      setScrolled(true); // Navbar is always solid on other pages
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const navHeight = 64;
      const heroHeight = 400;

      const newOpacity = 1 - scrollY / (heroHeight - navHeight);
      setHeroOpacity(Math.max(0, newOpacity));
      setHeroTranslateY(scrollY * 0.4);
      setScrolled(scrollY > (heroHeight - navHeight));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setChecking(false));
  }, [router.asPath]);

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <>
      {/* Navbar */}
      <nav className={`main-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          <Link href="/">
            <img src="/images/oqi-logo.png" alt="Logo" />
          </Link>
        </div>
        <ul>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/user-guide">User Guide</Link></li>
          <li><Link href="/resources">Useful Resources</Link></li>
          {!checking && isLoggedIn && (
            <>
              <li><Link href="/dashboard">Access Tool</Link></li>
              <li><button onClick={handleLogout}>Sign Out</button></li>
            </>
          )}
          {!checking && !isLoggedIn && (
            <li><Link href="/login">Access Tool</Link></li>
          )}
        </ul>
      </nav>

      {/* Hero only on homepage */}
      {isHome && (
        <header className="headline">
          <div
            className="inner"
            style={{
              opacity: heroOpacity,
              transform: `translate(-50%, calc(-50% + ${heroTranslateY}px))`,
            }}
          >
            <h1>OQI Impact Tool</h1>
            <p>Assess, collaborate, and accelerate quantum-for-impact projects.</p>
          </div>
        </header>
      )}
    </>
  );
}
