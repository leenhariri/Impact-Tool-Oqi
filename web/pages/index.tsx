export default function Home() {
  return (
    <>
          <div className="hero-image">
        <div className="hero-text">
          <h1>Welcome to OQI Impact Tool</h1>
          <p>Explore projects, track progress, and collaborate</p>
        </div>
      </div>

    <section className="w3-container w3-padding-64 w3-center">
      <h2>Welcome!</h2>

    </section>
   {/* Partners + Access Tool */}
      <section className="w3-container w3-padding-32">
        <div className="partners-wrap">
          <hr />
          <h3 className="w3-center" style={{ margin: "12px 0 20px" }}>
            Our Partners
          </h3>

          <div className="partners-logos">
            <img
              src="/images/beyond-lab.png"
              alt="Beyona Lab"
              className="partner-logo"
            />
            <img
              src="/images/un-geneva.png"
              alt="United Nations Geneva"
              className="partner-logo"
            />
            <img
              src="/images/gesda.png"
              alt="GESDA"
              className="partner-logo"
            />
          </div>

          <hr />

          <div className="w3-center" style={{ marginTop: 24, marginBottom: 48 }}>
            <a href="/dashboard" className="w3-blue-grey access-btn">
              Access Tool
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
