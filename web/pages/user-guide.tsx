// pages/user-guide.tsx
import React from "react";
import Head from "next/head";

export default function UserGuide() {
  return (
    <>
      <Head>
        <title>User Guide</title>
        <link href="https://fonts.googleapis.com/css2?family=Arvo&display=swap" rel="stylesheet" />
      </Head>

      <div className="hero">
        <div className="hero-text">
          <h1 className="arvo-title">User Guide</h1>
          <p className="arvo-subtext">Step-by-step guidance to help you navigate, use, and make the most of the OQI Impact Tool.</p>
        </div>
      </div>

      <div className="user-guide-container">
        <p><strong>The Impact User Guide</strong> consists of the following elements:</p>

        <ul>
          <li><strong>Impact Indicator Matrix:</strong> This matrix captures the anticipated long-, mid-and short-term impact of the quantum computing use case...</li>
          <li><strong>Anticipated Impact Flowchart:</strong> Based on the input of the Impact Indicator Matrix, this flowchart illustrates how different anticipated output and impact relate to each other...</li>
          <li><strong>SDG Interlinkage Diagram:</strong> In the form of a heat-map, this diagram helps uncover how the anticipated impact affects the SDGs...</li>
        </ul>

        <p>This structured framework is based on the <strong>Theory of Change (ToC)</strong> (See Useful References...), which outlines the logic flow...</p>

        <h2 className="arvo-section">Long-term Impact</h2>
        <p>The long-term impact refers to the ultimate, lasting change that a quantum computing solution aims to achieve...</p>

        <h2 className="arvo-section">Short-term and Mid-term impacts</h2>
        <p><strong>Mid-term impacts (2-5 years)</strong> describe behavioral, institutional, or systemic changes...</p>
        <p><strong>Short-term impacts (0-2 years)</strong> represent the early, tangible changes emerging soon after the solution would be deployed...</p>

        <h2 className="arvo-section">Unintended Negative Consequences / Risks / Spillovers</h2>
        <p>Although all use cases are designed with a positive impact in mind, it is equally important to consider possible negative or unintended consequences...</p>

        <h2 className="arvo-section">Deliverables</h2>
        <p>Deliverables are the immediate, tangible outputs or results...</p>

        <h2 className="arvo-section">Actions</h2>
        <p>On-the-ground core activities that would be carried out to initiate the change process...</p>

        <h2 className="arvo-section">Resources</h2>
        <p>The resources are inputs that would be needed beforehand to carry out the actions...</p>

        <h2 className="arvo-section">Assumptions & Risks</h2>
        <p><strong>7.1 Assumptions:</strong> External conditions that must be true for the pathway of change to succeed...</p>
        <p><strong>7.2 Risks:</strong> Threats or challenges that could deter the success of the change pathway...</p>

        <h2 className="arvo-section">Stakeholders</h2>
        <p>Stakeholders are key people directly and indirectly involved or affected in the implementation...</p>

        <h2 className="arvo-section">Indicators</h2>
        <p>Indicators are measurable variables used to track progress...</p>

        <h3 className="arvo-section" style={{ fontSize: "20px" }}>Examples of qualitative/quantitative questions / indicators</h3>
        <ul>
          <li>How would the quantum computing solution affect people?</li>
          <li>How will it reduce poverty rates?</li>
          <li>How would it improve disease diagnosis?</li>
          <li>How would it help reduce CO2 emissions?</li>
          <li>How would it improve biodiversity conservation?</li>
          <li>How would it improve urban planning?</li>
        </ul>

        <h2 className="arvo-section">Baseline</h2>
        <p>Baseline defines what the current situation is today. Based on this reference, change can be measured over time.</p>

        <h2 className="arvo-section">Summary of the ToC framework</h2>
        <p>Once each component has been assessed, the next step is to connect the dots using the “If…then...” logic...</p>

        <ul>
          <li>What change does the solution hope to create?</li>
          <li>What must happen right before that?</li>
          <li>What are the expected immediate results?</li>
          <li>What actions and resources drive these results?</li>
          <li>What assumptions must be true?</li>
          <li>What are the risks?</li>
        </ul>

        <h2 id="sdg-interlinkage" className="arvo-section">SDG Interlinkage</h2>
        <p>The potential influence of a quantum computing use case on both system-wide SDG interactions and individual SDG targets...</p>

        <p><strong>Interaction Scale:</strong></p>
        <ul>
          <li>+3, Strongly promoting (dark green)</li>
          <li>+2, Clear positive influence (green)</li>
          <li>+1, Weakly promoting (light green)</li>
          <li>0, Neutral (light yellow)</li>
          <li>-1, Weakly restricting (yellow)</li>
          <li>-2, Moderately restricting (orange)</li>
          <li>-3, Strongly restricting (red)</li>
        </ul>
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
    margin-bottom: **4px**; /* reduced to tighten space */
  }

  .user-guide-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    line-height: 1.6;
  }

  .user-guide-container p {
    margin-top: **4px**; /* tighten paragraph's top space */
    margin-bottom: 16px;
  }

  ul {
    padding-left: 20px;
    margin-top: 4px;
    margin-bottom: 16px;
  }

  a {
    color: #0070f3;
    text-decoration: underline;
  }
`}</style>

    </>
  );
}
