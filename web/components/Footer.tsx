export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--footer-bg)", color: "#fff", padding: "40px 0", textAlign: "center" }}>
      <h4>Follow Us</h4>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "16px" }}>
        <a className="w3-button w3-large w3-teal" href="#"><i className="fa fa-facebook"></i></a>
        <a className="w3-button w3-large w3-teal" href="#"><i className="fa fa-twitter"></i></a>
        <a className="w3-button w3-large w3-teal" href="#"><i className="fa fa-instagram"></i></a>
      </div>
      <p>Powered by <a href="https://www.w3schools.com/w3css/" target="_blank" rel="noreferrer">w3.css</a></p>
    </footer>
  );
}
