import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Transparent-over-hero header sits above this */}
      <section className="hero">
        <div>
          <h1>OQI Impact Tool</h1>
          <p>Assess, collaborate, and accelerate quantum-for-impact projects.</p>
        </div>
      </section>

      {/* Your content */}
      <section className="section w3-container w3-center">
        <h2>add content here</h2>
        
      </section>

      {/* Partners + Access Tool (from your earlier request) */}
      <section className="w3-container w3-padding-32">
        <div className="partners-wrap">
          <hr />
          <h3 className="w3-center" style={{ margin: "12px 0 20px" }}>Our Partners</h3>
          <div className="partners-logos">
            <img src="/images/beyond-lab.png" className="partner-logo" alt="Beyona Lab" />
            <img src="/images/un-geneva.png" className="partner-logo" alt="United Nations Geneva" />
            <img src="/images/gesda.png" className="partner-logo" alt="GESDA" />
          </div>
          <hr />
          <div className="w3-center" style={{ marginTop: 24, marginBottom: 48 }}>
            <Link href="/dashboard" className="btn-pill">Access Tool</Link>
          </div>
        </div>
      </section>
    </>
  );
}
