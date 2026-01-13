// pages/about.tsx
import React from "react";
import Head from "next/head";

export default function About() {
  return (
    <>
      <Head>
        <title>About | OQI Impact Tool</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Arvo&family=Inter&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Hero Section */}
{/* <header className="headline">
  <div className="inner">
    <h1>About the OQI Impact Tool</h1>
    <p>Understanding the mission, impact, and guidance behind this tool</p>
  </div>
</header> */}


     
      <div className="about-container">
<section>
  <h2 className="arvo-section">About the OQI</h2>
  <p>
    As part of its mission, <a href="https://open-quantum-institute.cern/" target="_blank" rel="noopener noreferrer">one of OQI’s four main activities</a> is focusing on
    accelerating applications for humanity. While quantum computing is still in
    its early stage of development and computational resources remain scarce,
    there is an opportunity today to foster a global effort to explore potential
    applications of the technology that will positively impact our society and
    our planet.
  </p>
  <p>
    OQI aims to fully harness the potential of quantum computing by accelerating
    the development of use cases that contribute to the achievement of the SDGs
    and beyond. Through the support of OQI, quantum and subject matter experts
    from around the world have been collaborating with UN agencies and large NGOs
    to explore the potential of quantum computing to address global challenges.
  </p>
</section>


        <section>
          <h2 className="arvo-section">About Impact</h2>
          <p>
            Impact is the measurable changes, whether social, economic, environmental,
            etc., both positive and negative, that can be attributed to a
            solution/intervention. Impact goes beyond what a solution delivers, but
            rather how it transforms systems, behaviors, or well-being of a given
            context.
          </p>
          <p>
            Impact design involves identifying and understanding comprehensively the
            societal problem that the solution intends to address, clearly assessing
            which population or systems are affected by the identified problem,
            anticipating changes over time (short, mid, and long term) – whether positive
            or negative – and mapping the interlinkages across multiple SDGs, including
            any trade-offs or unintended consequences.
          </p>
        </section>

        <section>
          <h2 className="arvo-section">About the Impact User Guide</h2>
          <p>
            This Impact User Guide has been customized for OQI. It is not a generic guide
            but a fit-for-purpose framework and language adapted specifically to support
            quantum computing use case developers in enabling them to comprehensively
            craft their use case impact design and measurement planning.
          </p>
          <p>It contains three main parts:</p>
          <ul>
            <li>Impact Indicator Matrix</li>
            <li>Anticipated Impact Flow Chart</li>
            <li>SDG Interlinkage Heat Map</li>
          </ul>
          <p>
            The user is invited to go through these three parts to fully explore the
            potential impact of their quantum computing use cases once deployed in the
            real world and reflect on it, embedding impact thinking and design from the
            start of the use case ideation to not only contribute to technological
            advancement but also to a purpose-driven innovation ensuring alignment with
            societal transformation.
          </p>
        </section>
      </div>

      <style jsx>{`
        .arvo-title {
          font-family: 'Arvo', serif;
          font-size: 28px;
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

        .about-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          line-height: 1.6;
        }

        .about-container p {
          margin-top: 4px;
          margin-bottom: 16px;
        }

        ul {
          padding-left: 20px;
          margin-top: 4px;
          margin-bottom: 16px;
        }
      `}</style>
    </>
  );
}
