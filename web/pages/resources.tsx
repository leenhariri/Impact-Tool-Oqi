import Head from 'next/head'
import React from "react";

export default function UsefulResources() {
  return (
    <>
      <Head>
        <title>Useful Resources</title>
        <link href="https://fonts.googleapis.com/css2?family=Arvo&display=swap" rel="stylesheet" />
      </Head>

      <div className="hero">
        <div className="hero-text">
          <h1 className="arvo-title">Useful Resources</h1>
          <p className="arvo-subtext">Explore key references and tools to deepen your understanding of impact design, SDGs, and responsible innovation.</p>
        </div>
      </div>

      <div className="resources-container">
        <h2 className="arvo-section">Resources on Measuring Impact</h2>
        <ul>
          <li>
            United Nations Sustainable Development Group. (2017). <em>Theory of change: UNDAF companion guidance</em>.
            <br /><a href="https://unsdg.un.org/resources/theory-change-undaf-companion-guidance" target="_blank">https://unsdg.un.org/resources/theory-change-undaf-companion-guidance</a>
          </li>
          <li>
            OECD/European Union (2024), <em>Measure, Manage and Maximise Your Impact: A Guide for the Social Economy</em>, Local Economic and Employment Development (LEED), OECD Publishing, Paris.
            <br /><a href="https://doi.org/10.1787/2238c1f1-en" target="_blank">https://doi.org/10.1787/2238c1f1-en</a>
          </li>
          <li>
            Peer Support Group (PSG) & UNDG LAC Secretariat. (2016). <em>Guidance on theory of change</em>. United Nations Sustainable Development Group.
            <br /><a href="https://unsdg.un.org/sites/default/files/16.-2016-10-18-Guidance-on-ToC-PSG-LAC.pdf" target="_blank">https://unsdg.un.org/sites/default/files/16.-2016-10-18-Guidance-on-ToC-PSG-LAC.pdf</a>
          </li>
          <li>
            Rogers, P. (2014). <em>Theory of change (Methodological Briefs: Impact Evaluation No. 2)</em>. UNICEF Office of Research.
            <br /><a href="https://www.betterevaluation.org/sites/default/files/Theory_of_Change_ENG.pdf" target="_blank">https://www.betterevaluation.org/sites/default/files/Theory_of_Change_ENG.pdf</a>
          </li>
          <li>
            Sopact. (n.d.). <em>Theory of change authoritative guide</em>.
            <br /><a href="https://www.sopact.com/guides/theory-of-change" target="_blank">https://www.sopact.com/guides/theory-of-change</a>
          </li>
          <li>
            Taplin, D. H., & Clark, H. (2012). <em>Theory of change basics: A primer on theory of change</em>. ActKnowledge.
            <br /><a href="https://www.theoryofchange.org/wp-content/uploads/toco_library/pdf/ToCBasics.pdf" target="_blank">https://www.theoryofchange.org/wp-content/uploads/toco_library/pdf/ToCBasics.pdf</a>
          </li>
          <li>
            Sopact. (n.d.). <em>Understanding impact</em>.
            <br /><a href="https://npproduction.wpenginepowered.com/wp-content/uploads/2020/02/Understanding-Impact-.pdf" target="_blank">https://npproduction.wpenginepowered.com/wp-content/uploads/2020/02/Understanding-Impact-.pdf</a>
          </li>
          <li>
            Valters, C. (2015). <em>Understanding impact: Theories of change and impact evaluation</em>. Overseas Development Institute.
            <br /><a href="https://media.odi.org/documents/10352.pdf" target="_blank">https://media.odi.org/documents/10352.pdf</a>
          </li>
        </ul>

        <h2 className="arvo-section">SDG Interlinkages</h2>
        <ul>
          <li>
            United Nations. (n.d.). <em>The 17 goals</em>. United Nations Sustainable Development Goals.
            <br /><a href="https://sdgs.un.org/goals" target="_blank">https://sdgs.un.org/goals</a>
          </li>
          <li>
            United Nations Statistics Division. (n.d.). <em>Global indicator framework...</em>
            <br /><a href="https://unstats.un.org/sdgs/indicators/Global-Indicator-Framework-after-2025-review-English.pdf" target="_blank">https://unstats.un.org/sdgs/indicators/Global-Indicator-Framework-after-2025-review-English.pdf</a>
          </li>
          <li>
            United Nations Statistics Division. (n.d.). <em>UNSD publications catalogue</em>.
            <br /><a href="https://unstats.un.org/UNSDWebsite/Publications/PublicationsCatalogue/" target="_blank">https://unstats.un.org/UNSDWebsite/Publications/PublicationsCatalogue/</a>
          </li>
          <li>
            Weitz, N., et al. (2018). <em>Towards systemic and contextual priority setting...</em>
            <br /><a href="https://doi.org/10.1007/s11625-017-0470-0" target="_blank">https://doi.org/10.1007/s11625-017-0470-0</a>
          </li>
          <li>
            Luttikhuis, N., & Wiebe, K. S. (2023). <em>Analyzing SDG interlinkages...</em>
            <br /><a href="https://doi.org/10.1007/s11625-023-01336-x" target="_blank">https://doi.org/10.1007/s11625-023-01336-x</a>
          </li>
          <li>
            European Commission, JRC. (n.d.). <em>EnablingSDGs. KnowSDGs Platform</em>.
            <br /><a href="https://knowsdgs.jrc.ec.europa.eu/enablingsdgs" target="_blank">https://knowsdgs.jrc.ec.europa.eu/enablingsdgs</a>
          </li>
          <li>
            <a href="https://knowsdgs.jrc.ec.europa.eu/interlinkages/goals" target="_blank">https://knowsdgs.jrc.ec.europa.eu/interlinkages/goals</a>
          </li>
        </ul>

        <h2 className="arvo-section">Other Relevant References</h2>
        <ul>
          <li>
            UNFCCC CDM Tools:
            <br /><a href="https://cdm.unfccc.int/Reference/tools/index.html" target="_blank">https://cdm.unfccc.int/Reference/tools/index.html</a>
          </li>
          <li>
            UNFCCC CDM Methodologies:
            <br /><a href="https://cdm.unfccc.int/methodologies/index.html" target="_blank">https://cdm.unfccc.int/methodologies/index.html</a>
          </li>
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
          margin-bottom: 10px;
        }

        .resources-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          line-height: 1.8;
        }

        ul {
          padding-left: 20px;
        }

        a {
          color: #0070f3;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
