export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--footer-bg)",
        color: "#fff",
        padding: "40px 0",
        textAlign: "center",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "20px" }}>
        <img
          src="/images/oqi-logo.png"
          alt="OQI Logo"
          style={{ height: "80px", marginBottom: "12px" }}
        />
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          marginTop: "12px",
        }}
      >
        {/* Contact Us Button */}
        <a
          href="mailto:oqi.info@cern.ch"
          style={{
            background: "#2a335c", // lighter than footer bg
            padding: "6px 16px",
            borderRadius: "25px",
            color: "#fff",
            fontWeight: "500",
            fontSize: "13px",
            textDecoration: "none",
            transition: "background 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#3a467a")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#2a335c")}
        >
          Contact Us
        </a>

        {/* LinkedIn Button */}
        <a
          href="https://www.linkedin.com/company/open-quantum-institute/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "#ddd", // light grey circle
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#bbb")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#ddd")}
        >
          <i
            className="fa fa-linkedin"
            style={{ color: "var(--footer-bg)", fontSize: "18px" }}
          ></i>
        </a>
      </div>
    </footer>
  );
}
