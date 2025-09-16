import React from "react";
import Link from "next/link";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | OQI Impact Tool</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Arvo&family=Inter&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Hero Section */}
      <section className="hero">
        <div>
          <h1 className="arvo-title">OQI Impact Tool</h1>
          <p className="arvo-subtext">
            Assess, collaborate, and accelerate quantum-for-impact projects.
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="home-container">
        <p>
          This user guide has been created for the Open Quantum Institute (OQI), in
          partnership with the UN Beyond Lab and GESDA, in order to support the
          exploration of quantum computing use cases and anticipate their impact once
          deployed in the real-world on the United Nations Sustainable Development Goals
          (SDGs) and beyond.
        </p>
      </section>

      {/* Partners Section */}
      <section className="home-container">
        <hr />
        <h2 className="arvo-section w3-center" style={{ marginBottom: 24 }}>
          Our Partners
        </h2>
<div className="partners-logos">
  <a
    href="https://www.thebeyondlab.org/"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img src="/images/beyond-lab.png" className="partner-logo" alt="Beyond Lab" />
  </a>

  <a
    href="https://www.ungeneva.org/en/visit"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img src="/images/un-geneva.png" className="partner-logo" alt="United Nations Geneva" />
  </a>

  <a
    href="https://www.gesda.global/"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img src="/images/gesda.png" className="partner-logo" alt="GESDA" />
  </a>
</div>

        <hr />
        <div className="w3-center" style={{ marginTop: 32 }}>
          <Link href="/dashboard" className="btn-pill">
            Access Tool
          </Link>
        </div>
      </section>

      <style jsx>{`
        .arvo-title {
          font-family: 'Arvo', serif;
          font-size: 32px;
          font-weight: bold;
          margin-top: 40px;
          margin-bottom: 10px;
          text-align: center;
        }

        .arvo-subtext {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .arvo-section {
          font-family: 'Arvo', serif;
          font-size: 22px;
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 4px;
        }

        .home-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          text-align: center;
        }

        .partners-logos {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
          margin-top: 16px;
          margin-bottom: 32px;
        }

        .partner-logo {
          max-height: 80px;
          object-fit: contain;
        }

        .btn-pill {
          display: inline-block;
          padding: 12px 24px;
          background-color: #1a1a1a;
          color: white;
          border-radius: 999px;
          font-size: 16px;
          font-family: 'Inter', sans-serif;
          text-decoration: none;
          transition: background 0.2s ease-in-out;
        }

        .btn-pill:hover {
          background-color: #333;
        }

        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 32px 0;
        }
      `}</style>
    </>
  );
}
