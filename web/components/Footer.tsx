export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--footer-bg)",
        color: "#fff",
        padding: "40px 0 20px",
        textAlign: "center",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "20px" }}>
        <a
          href="https://open-quantum-institute.cern/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/images/oqi-logo.png"
            alt="OQI Logo"
            style={{ height: "80px", marginBottom: "12px", cursor: "pointer" }}
          />
        </a>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          marginTop: "12px",
          marginBottom: "40px",
        }}
      >
        {/* Contact Us Button */}
        <a
          href="mailto:oqi.info@cern.ch"
          style={{
            background: "#2a335c",
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
            background: "#ddd",
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

      {/* Partner Logos */}
      <div
        style={{
          display: "flex",
          gap: "32px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <img src="/images/cern-logo.png" alt="CERN" style={{ height: "28px" }} />
        <img src="/images/gesda-logo.png" alt="GESDA" style={{ height: "28px" }} />
        <img src="/images/ubs-logo.png" alt="UBS" style={{ height: "28px" }} />
        <img
          src="/images/quantum-logo.png"
          alt="Quantum Science"
          style={{ height: "28px" }}
        />
      </div>

      {/* Footer Text */}
      <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}>
        <p style={{ marginBottom: "6px", fontSize: "10px", opacity: 0.7 }}>
          © 2025 | Open Quantum Institute
        </p>
        <p style={{ marginBottom: "6px", fontSize: "12px", opacity: 0.7 }}>
          For media inquiries and access to our branding guidelines, please{" "}
          <a
            href="mailto:oqi.info@cern.ch"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            contact us
          </a>.
        </p>
        <a
          href="https://open-quantum-institute.cern/wp-content/uploads/2025/01/Open-Quantum-Institute-Privacy-Policy.docx-1.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#fff", textDecoration: "underline", fontSize: "12px" , opacity:0.7}}
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
