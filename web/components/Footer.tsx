export default function Footer() {
  return (
    <>
    
      <div style={{ position: "relative", background: "var(--page-bg)" }}>

<svg
  viewBox="0 0 1440 320"
  preserveAspectRatio="none"
  style={{
    display: "block",
    width: "100%",
    height: "80px",
    marginBottom: "-1px",
  }}
>
  <path
    fill="var(--footer-bg)"
    d="M0,300 C360,-120 1080,520 1440,180 L1440,320 L0,320 Z"
  />
</svg>



        
        <footer style={{ backgroundColor: "var(--footer-bg)", color: "#fff" }}>
          {/* Main Footer Content */}
          <div style={{ padding: "40px 0 20px", textAlign: "center" }}>
            {/* Logo */}
            <div style={{ marginBottom: "16px" }}>
              <a
                href="https://open-quantum-institute.cern/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/oqi-logo.png"
                  alt="OQI Logo"
                  style={{ height: "80px", cursor: "pointer" }}
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
                marginBottom: "28px",
              }}
            >
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
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#3a467a")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#2a335c")
                }
              >
                Contact Us
              </a>

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
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#bbb")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#ddd")
                }
              >
                <i
                  className="fa fa-linkedin"
                  style={{ color: "var(--footer-bg)", fontSize: "18px" }}
                ></i>
              </a>
            </div>
          </div>

       
          <div
            style={{
              backgroundColor: "#0e1129",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              padding: "16px 40px",
              fontSize: "11px",
              opacity: 0.8,
            }}
          >
           
            <div style={{ minWidth: "200px", marginBottom: "8px" }}>
              © 2025 | Open Quantum Institute
            </div>

           
            <div
              style={{
                display: "flex",
                gap: "32px",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: "8px",
                flex: "1",
              }}
            >
              <img
                src="/images/cern-logo.png"
                alt="CERN"
                style={{ height: "35px" }}
              />
              <img
                src="/images/gesda-logo.png"
                alt="GESDA"
                style={{ height: "55px" }}
              />
              <img
                src="/images/ubs-logo.png"
                alt="UBS"
                style={{ height: "30px" }}
              />
              <img
                src="/images/quantum-logo.png"
                alt="Quantum Science"
                style={{ height: "35px" }}
              />
            </div>

            {/* Right Text */}
            <div
              style={{
                minWidth: "200px",
                textAlign: "right",
                marginBottom: "8px",
              }}
            >
              <div style={{ marginBottom: "4px" }}>
                <a
                  href="https://open-quantum-institute.cern/wp-content/uploads/2025/01/Open-Quantum-Institute-Privacy-Policy.docx-1.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#fff", textDecoration: "underline" }}
                >
                  Privacy Policy
                </a>
              </div>
              {/* <div>
                For inquiries & access to our guidelines,&nbsp;
                <a
                  href="mailto:oqi.info@cern.ch"
                  style={{ color: "#fff", textDecoration: "underline" }}
                >
                  contact us
                </a>
                .
              </div> */}
              <div
  style={{
    display: "flex",
    justifyContent: "flex-end",   
    alignItems: "center",
    gap: "10px",
    fontSize: "11px",
    opacity: 1,
  }}
>
  <img
    src="/images/Cc_by-sa_(1).svg"
    alt="Creative Commons BY-SA 4.0"
    style={{ height: "20px" }}
  />
  <a
    href="https://creativecommons.org/licenses/by-sa/4.0/"
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "#fff", textDecoration: "underline" }}
  >
    CC BY-SA 4.0
  </a>
</div>

            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
