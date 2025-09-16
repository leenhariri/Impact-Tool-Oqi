import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true); // ✅ to prevent flicker
  const router = useRouter();

  // Detect scroll to make navbar solid
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check auth session on load AND route change
  useEffect(() => {
    fetch("http://localhost:4000/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setChecking(false)); // ✅ done checking
  }, [router.asPath]); // ✅ recheck when route changes

  const handleLogout = async () => {
    await fetch("http://localhost:4000/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <header className={`navbar ${solid ? "solid" : ""}`}>
      <div className="nav-inner">
        <div className="nav-left">
          <Link href="/" className="nav-logo">
            <img src="/images/oqi-logo.png" alt="OQI" />
          </Link>

          {/* Desktop Nav */}
          <nav className="nav-desktop">
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/user-guide" className="nav-link">User Guide</Link>
            <Link href="/resources" className="nav-link">Useful Resources</Link>

            {!checking && isLoggedIn && (
              <>
                <Link href="/dashboard" className="nav-link">My Projects</Link>
                <Link href="/dashboard" className="nav-link">Access Tool</Link>
              </>
            )}
            {!checking && !isLoggedIn && (
              <Link href="/login" className="nav-link">Access Tool</Link>
            )}

            {!checking && isLoggedIn && (
              <button
                onClick={handleLogout}
                className="nav-link"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="nav-mobile nav-link"
          aria-label="Menu"
          onClick={() => setMobileOpen(v => !v)}
        >
          &#9776;
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <Link href="/about" className="nav-link" onClick={() => setMobileOpen(false)}>About</Link>
          <Link href="/user-guide" className="nav-link" onClick={() => setMobileOpen(false)}>User Guide</Link>
          <Link href="/resources" className="nav-link" onClick={() => setMobileOpen(false)}>Useful Resources</Link>
          <Link href="/glossary" className="nav-link" onClick={() => setMobileOpen(false)}>Glossary</Link>

          {!checking && isLoggedIn && (
            <>
              <Link href="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>My Projects</Link>
              <Link href="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Access Tool</Link>
            </>
          )}
          {!checking && !isLoggedIn && (
            <Link href="/login" className="nav-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
          )}
          {!checking && isLoggedIn && (
            <button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="nav-link"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
