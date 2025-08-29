import { useState } from 'react';

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = true; // change to `false` for testing

  return (
    <>
      {/* Sidebar */}
      {sidebarOpen && (
        <nav className="w3-sidebar w3-bar-block w3-white w3-card w3-animate-left w3-xxlarge" style={{ zIndex: 2 }}>
          <a onClick={() => setSidebarOpen(false)} className="w3-bar-item w3-button w3-display-topright w3-text-teal">
            Close <i className="fa fa-remove"></i>
          </a>
          <a href="/" className="w3-bar-item w3-button">Home</a>
          {isLoggedIn && <a href="/dashboard" className="w3-bar-item w3-button">My Projects</a>}
          {/* {isLoggedIn && <a href="/tool" className="w3-bar-item w3-button">Access Tool</a>} */}
          <a href="/about" className="w3-bar-item w3-button">About</a>
          <a href="/guide" className="w3-bar-item w3-button">User Guide</a>
          {isLoggedIn
            ? <a href="/logout" className="w3-bar-item w3-button">Sign Out</a>
            : <a href="/login" className="w3-bar-item w3-button">Login</a>
          }
        </nav>
      )}

      {/* Top Navbar */}
      <div className="w3-top">
        <div className="w3-bar w3-theme-d2 w3-left-align">
          <button className="w3-bar-item w3-button w3-hide-medium w3-hide-large w3-right w3-hover-white" onClick={() => setMobileMenuOpen(prev => !prev)}>
            <i className="fa fa-bars"></i>
          </button>
          <a href="/" className="w3-bar-item w3-button w3-theme"><i className="fa fa-home w3-margin-right"></i>OQI</a>
          <a href="/about" className="w3-bar-item w3-button w3-hide-small w3-hover-white">About</a>
          <a href="/guide" className="w3-bar-item w3-button w3-hide-small w3-hover-white">User Guide</a>
          {isLoggedIn && <a href="/dashboard" className="w3-bar-item w3-button w3-hide-small w3-hover-white">My Projects</a>}
          {/* {isLoggedIn && <a href="/tool" className="w3-bar-item w3-button w3-hide-small w3-hover-white">Access Tool</a>} */}
          {isLoggedIn
            ? <a href="/logout" className="w3-bar-item w3-button w3-hide-small w3-hover-white">Sign Out</a>
            : <a href="/login" className="w3-bar-item w3-button w3-hide-small w3-hover-white">Login</a>}
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="w3-bar-block w3-theme-d2 w3-hide-large w3-hide-medium">
            <a href="/about" className="w3-bar-item w3-button">About</a>
            <a href="/guide" className="w3-bar-item w3-button">User Guide</a>
            {isLoggedIn && <a href="/dashboard" className="w3-bar-item w3-button">My Projects</a>}
            {/* {isLoggedIn && <a href="/tool" className="w3-bar-item w3-button">Access Tool</a>} */}
            {isLoggedIn
              ? <a href="/logout" className="w3-bar-item w3-button">Sign Out</a>
              : <a href="/login" className="w3-bar-item w3-button">Login</a>}
          </div>
        )}
      </div>
    </>
  );
}
