import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [heroTranslateY, setHeroTranslateY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);   // ← NEW

  const router = useRouter();

  const isHome = router.pathname === "/";
  const isAbout = router.pathname === "/about";
  const isUserGuide = router.pathname === "/user-guide";
  const isResources = router.pathname === "/resources";

  const [heroExists, setHeroExists] = useState(false);

  useEffect(() => {
    setHeroExists(!!document.querySelector(".headline"));
  }, [router.asPath]);

  useEffect(() => {
    if (!heroExists) {
      setScrolled(true);
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
  }, [heroExists]);

  // useEffect(() => {
  //   fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`, { credentials: "include" })
  //     .then((res) => (res.ok ? res.json() : Promise.reject()))
  //     .then(() => setIsLoggedIn(true))
  //     .catch(() => setIsLoggedIn(false))
  //     .finally(() => setChecking(false));
  // }, [router.asPath]);
useEffect(() => {
  let cancelled = false;

  (async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!cancelled) setIsLoggedIn(res.ok);
    } catch {
      if (!cancelled) setIsLoggedIn(false);
    } finally {
      if (!cancelled) setChecking(false);
    }
  })();

  return () => {
    cancelled = true;
  };
}, []);

//   const handleLogout = async () => {
//     setMobileMenuOpen(false);
//     // await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/logout`, {
//     //   method: "POST",
//     //   credentials: "include",
//     // });
//     // setIsLoggedIn(false);
//     await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
// setIsLoggedIn(false);
// router.push("/");

//     window.location.href = "/";
//   };
const handleLogout = async () => {
  setMobileMenuOpen(false);

  try {
    // 1) logout your backend (optional but fine)
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {}

  // 2) logout oauth2-proxy session
  window.location.href =
  "https://oqi-impact-tool.app.cern.ch/oauth2/sign_out?rd=%2F";

};

  return (
    <>
      
      <nav className={`main-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          <Link href="/">
            <img src="/images/oqi-logo.png" alt="Logo" />
          </Link>
        </div>

      
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

      
        <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <ul>
            <li><Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link></li>
            <li><Link href="/user-guide" onClick={() => setMobileMenuOpen(false)}>User Guide</Link></li>
            <li><Link href="/resources" onClick={() => setMobileMenuOpen(false)}>Useful Resources</Link></li>

            {/* {!checking && isLoggedIn && (
              <>
                <li><Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Access Tool</Link></li>
                <li><button onClick={handleLogout}>Sign Out</button></li>
              </>
            )}

            {!checking && !isLoggedIn && (
              <li><Link href="/login" onClick={() => setMobileMenuOpen(false)}>Access Tool</Link></li>
            )} */}
            <li>
  {/* <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
    Access Tool
  </Link> */}

<a
  href="https://oqi-impact-tool.app.cern.ch/oauth2/start?rd=%2Fdashboard"
  onClick={() => setMobileMenuOpen(false)}
>
  Access Tool
</a>

</li>

{!checking && isLoggedIn && (
  <li><button onClick={handleLogout}>Sign Out</button></li>
)}

          </ul>
        </div>
      </nav>

      
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

      {isAbout && (
        <header className="headline">
          <div
            className="inner"
            style={{
              opacity: heroOpacity,
              transform: `translate(-50%, calc(-50% + ${heroTranslateY}px))`,
            }}
          >
            <h1>About the OQI Impact Tool</h1>
            <p>Understanding the mission, impact, and guidance behind this tool</p>
          </div>
        </header>
      )}

      {isUserGuide && (
        <header className="headline">
          <div
            className="inner"
            style={{
              opacity: heroOpacity,
              transform: `translate(-50%, calc(-50% + ${heroTranslateY}px))`,
            }}
          >
            <h1>User Guide</h1>
            <p>Step-by-step guidance to help you navigate, use, and make the most of the OQI Impact Tool.</p>
          </div>
        </header>
      )}

      {isResources && (
        <header className="headline">
          <div
            className="inner"
            style={{
              opacity: heroOpacity,
              transform: `translate(-50%, calc(-50% + ${heroTranslateY}px))`,
            }}
          >
            <h1>Useful Resources</h1>
            <p>Explore key references and tools to deepen your understanding of impact design, SDGs, and responsible innovation.</p>
          </div>
        </header>
      )}
    </>
  );
}
