import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // becomes solid after scrolling ~60px
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLoggedIn = false; // TODO: replace with real auth state

  return (
    <header className={`navbar ${solid ? "solid" : ""}`}>
      <div className="nav-inner">
        <div className="nav-left">
          <Link href="/" className="nav-logo">
            {/* optional logo image */}
            <img src="/images/oqi-logo.png" alt="OQI" />
            <span>Open Quantum Institute</span>
          </Link>

          {/* Desktop links */}
          <nav className="nav-desktop">
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/guide" className="nav-link">User Guide</Link>
            <Link href="/resources" className="nav-link">Useful Resources</Link>
            {isLoggedIn && <Link href="/dashboard" className="nav-link">My Projects</Link>}
            <Link href="/glossary" className="nav-link">Glossary</Link>
            {isLoggedIn && <Link href="/dashboard" className="nav-link">Access Tool</Link>}
            {isLoggedIn
              ? <Link href="/logout" className="nav-link">Sign Out</Link>
              : <Link href="/login" className="nav-link">Sign In</Link>}
          </nav>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile nav-link"
          aria-label="Menu"
          onClick={() => setMobileOpen(v => !v)}
        >
          &#9776;
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="mobile-menu">
          <Link href="/about" className="nav-link" onClick={() => setMobileOpen(false)}>About</Link>
          <Link href="/guide" className="nav-link" onClick={() => setMobileOpen(false)}>User Guide</Link>
          <Link href="/resources" className="nav-link" onClick={() => setMobileOpen(false)}>Useful Resources</Link>
          {isLoggedIn && <Link href="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>My Projects</Link>}
          <Link href="/glossary" className="nav-link" onClick={() => setMobileOpen(false)}>Glossary</Link>
          {isLoggedIn && <Link href="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Access Tool</Link>}
          {isLoggedIn
            ? <Link href="/logout" className="nav-link" onClick={() => setMobileOpen(false)}>Sign Out</Link>
            : <Link href="/login" className="nav-link" onClick={() => setMobileOpen(false)}>Sign In</Link>}
        </div>
      )}
    </header>
  );
}
