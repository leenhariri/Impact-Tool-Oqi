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
          <li><strong>Impact Indicator Matrix:</strong>  This matrix captures the anticipated long-, mid-and short-term impact of the quantum computing use case. Users are encouraged to carefully consider the assumptions underlying the anticipated impact, highlight possible risks and unintended consequences along with mitigation strategies, and list relevant stakeholders involved.
</li>
          <li><strong>Anticipated Impact Flowchart:</strong>  Based on the input of the Impact Indicator Matrix, this flowchart illustrates how different anticipated output and impact relate to each other. It helps to visualize potential correlations and causalities. </li>
          <li><strong>SDG Interlinkage Diagram:</strong>  In the form of a heat-map, this diagram helps uncover how the anticipated impact affects the SDGs. It highlights the degree to which impact on one SDG may be linked to another, while also drawing attention to areas where negative impacts may occur.
</li>
<li><strong>Stakeholder Matrix</strong>  ??
</li>
        </ul>

        <p>This structured framework is based on the <strong>Theory of Change (ToC)</strong> (See <a href="/resources"> Useful Resources</a> for more general details),    which outlines the logic flow, as a roadmap, of how a solution attains its ultimate impact. Below are defined the core components in the pathway of actions to intended long-term impact and how they are connected. </p>

        <h2 className="arvo-section">Long-term Impact</h2>
        <p>The long-term impact refers to the ultimate, lasting change that a quantum computing solution aims to achieve once deployed in the real-world. Considering the bigger picture, long-term impact reflects the societal transformation the solution contributes to–focusing on its effect on population, society, environment, economic, or global-level benefits that are anticipated to be achieved and would be attributed to the solution. The long-term impact should be aligned with the SDGs addressed by the quantum computing use case.
In completing the Impact Indicator Matrix, long-term impact should be expressed as a high-level statement describing what success would look like beyond five years.</p>

        <h2 className="arvo-section">Short-term and Mid-term impacts</h2>
        <p>Before reaching the long-term impact, short-term and mid-term impacts would be realized first. This stage is known as outcomes—the necessary preconditions that pave the way toward long-term impact. </p>
        <p><strong>Mid-term impacts (2-5 years)</strong> describe behavioral, institutional, or systemic changes that make the long-term impact achievable. They cover substantial shifts over time, triggering broader lasting transformation within society. This is a stage where probably societal systems would start shifting due to the quantum computing solution deployed in the real-world. In completing the Impact Indicator Matrix, identify 2-3 key changes in behaviors, policies, operations, resource use, etc that would demonstrate progress at this level.
</p>
        <p><strong>Short-term impacts (0-2 years)</strong> represent the early, tangible changes emerging soon after the solution would be deployed. They are often the early wins, offering evidence that a quantum computing solution is beginning to address the societal problem it targets. In completing the Impact Indicator Matrix, consider 2-3 key concrete changes in knowledge, behavior, conditions, etc. that could be observed in the early stages.</p>


        <h2 className="arvo-section">Deliverables</h2>
        <p>Deliverables are the immediate, tangible outputs or results (products or services delivered by the solution) that the quantum computing solution would produce, with clear casual links to impacts. </p>
        <h2 className="arvo-section">Risks</h2>
        <p>Although all use cases are designed with a positive impact on SDGs in mind, it is equally important to consider possible negative or unintended consequences and plan appropriate strategies to mitigate them.  
 <strong> Risks</strong> are external or internal threats or challenges that could deter the success of the change pathway either in achieving intended results or in deploying the solution. Each risk should be associated with a mitigation action.
</p>
<h2 className="arvo-section"> Assumptions & Actions</h2>
        <p><strong>5.1 Assumptions</strong> are external conditions that must be true for the pathway of change to succeed. They are the hidden enablers in the logic of change—if the assumptions break, the chain of change breaks as well. Consider the factors such as line of stakeholder’s behavior, data quality and availability, etc. </p>
        <p><strong>5.2 Actions</strong> On-the-ground core activities that would be carried out or implemented to initiate the change process and deploy the quantum computing solution to the real-world. 
</p>
        


        <h2 className="arvo-section">Resources</h2>
        <p>The resources are inputs that would be needed beforehand to carry out the actions. The resources could be human, financial, technical, material or infrastructural, etc. invested in the implementation of the quantum computing solution.</p>

        

        <h2 className="arvo-section">Stakeholders</h2>
        <p>Stakeholders are key people directly and indirectly involved or affected in the implementation or monitoring of the project/solution. 
For each component of the ToC, it’s useful to map the relevant stakeholders (people or organizations) and the level of implications (direct/indirect) and analyze their roles and influence, and thereafter devising strategies for engagement and to manage expectations.
</p>
<h2 className="arvo-section">Indicators</h2>
<p>Indicators are measurable variables used to track progress and show whether a change or result is happening. It signals if the quantum computing solution would be working as expected or not and determines how much change has occurred. Indicators can be both quantitative (e.g., % increase in access) or qualitative (e.g., user satisfaction). 
Each indicator is linked to a specific component in the ToC to ensure each result level is measurable, where means of measurement are a method, source or tool to assess change.
The table below provides examples of questions to guide defining indicators. 
</p>
<div className="table-container">
  <table className="indicators-table">
    <thead>
      <tr>
        <th rowSpan={2}>Policy Domain / Framework</th>
        <th rowSpan={2}>SDG Domain</th>
        <th colSpan={2} style={{ background: "#b22222", color: "#fff" }}>
          Local Level Measurement
          <br />
          (positive/negative)
          <br />
          (direct/indirect)
          <br />
          (short term/long term)
        </th>
        <th colSpan={2} style={{ background: "#a0522d", color: "#fff" }}>
          Global Projection
        </th>
      </tr>
      <tr>
        <th style={{ background: "#4682b4", color: "#fff" }}>
          Examples of qualitative/quantitative questions
        </th>
        <th style={{ background: "#228b22", color: "#fff" }}>
          Examples of Indicators
        </th>
        <th style={{ background: "#4682b4", color: "#fff" }}>
          Enabling factors for global projection
        </th>
        <th style={{ background: "#228b22", color: "#fff" }}>
          Example of qualitative question
        </th>
      </tr>
    </thead>

    <tbody>
      {/* Example row */}
      <tr>
                <td  rowSpan={6} style={{ backgroundColor: "#dceeff", fontWeight: "bold" }}>
  People
</td>
        <td>SDG</td>
        <td>
          How would the quantum computing solution affect people (based on
          current state)?
        </td>
        <td>
          # population impacted <br /> % of vulnerable or underserved populations
          benefiting from new solutions
        </td>
        <td>Transposability conditions</td>
        <td>
          What are other contexts (locations/environment/population) for which a
          similar solution could be applied? (provide facts/justifications)
        </td>
      </tr>

      <tr>
        <td>1</td>
        <td>
          How will the quantum computing solution reduce poverty rates in
          populations?
        </td>
        <td>
          % improvement of livelihoods amongst the population <br /> % increase
          in reliability or availability of essential services (e.g water,
          energy, etc)
        </td>
        <td></td>
        <td></td>
      </tr>

      <tr>

        <td>2</td>
        <td>How would the quantum computing solution affect employment, income, businesses(based on current state)?
How would quantum computing improve agricultural productivity and food security?
</td>
<td>% reduction in food waste
# Increase in agricultural production
# people with improved access to nutritious food
# Improved food security in households
</td>
<td>Technological Infrastructure</td>
<td>what would be the technological infrastructure that are required in a similar context for the transposability of the solution in another context?
How much investment is required to have the technological infrastructure in place for the operation of the use case if it is to be transposed in a another context?

</td>
      </tr>
      <tr>


        <td>3</td>
        <td>How would the quantum computing solution improve disease diagnosis and reduce incidences?
How would quantum computing improve healthcare systems and outcomes?
</td>
<td># Number of medical cases improved.
% increase in early disease diagnosis
# User satisfaction with health care technological solution
# Number of lives saved
# Reduction in disease incidence and mortality rate
</td>
<td>Political Willingness</td>
<td>Is there political support and will to take in the new solution into solving societal problems in their context?
Would the government be willing to invest into the application of the solution into their context?
What would be the conditions to deploy a similar solution in other contexts? (e.g. kind of datasets available)
</td>
      </tr>
      <tr>
       
        <td>4</td>
        <td>How would the quantum computing solution improve access to technological skills and knowledge</td>
        <td># Number of educational trainings on Quantum solutions</td>
        <td>Technological Literacy</td>
        <td>Are there technological knowledge and skills required to operationalize proposed use case in a particular context?</td>
      </tr>
      <tr>
        
        <td>5</td>
        <td>How would quantum computing reduce gender inequality?</td>
        <td># Reduction in gender inequality rate
# Improved equal access to the technology
</td>
<td>Technological Literacy</td>
<td>Are there technological knowledge and skills required to operationalize proposed use case in a particular context?</td>
      </tr>
      <tr>
        <td rowSpan={6} style={{ backgroundColor: "#dff0d8", fontWeight: "bold" }}>
  Planet <br/>(environment, energy)
</td>

        <td>6</td>
        <td>How would quantum computing help to reduce water loss and improve access?</td>
        <td># litres of water saved through optimization
% increase in households with reliable water supply
# Water access increase
# Reduced water loss
</td>
<td>Financial resource (Public + Private)</td>
<td>Are there available financial resources from both the public and private sector to support the adoption of the proposed use case solution in a particular context</td>

      </tr>
      <tr>
        
        <td>7</td>
        <td>How would the quantum computing solution help save energy?</td>
        <td>% reduction in grid losses
% reduction in energy consumption
# Energy consumption to run the case study
</td>
<td>Financial resource (Public + Private)</td>
<td>Are there available financial resources from both the public and private sector to support the adoption of the proposed use case solution in a particular context</td>
      </tr>
      <tr>
        
        <td>12</td>
        <td>How would the quantum computing solution improve production and responsible consumption?</td>
        <td>% decrease in material use
# adoption rate of sustainable consumption practices
# Increase in production
# Reduction in operational costs
</td>
<td></td>
<td></td>
      </tr>
      <tr>
        
        <td>13</td>
        <td>How would the quantum computing solution help to reduce C02 emissions?</td>
        <td># Reduction in CO2 foot prints
# perceived climate resilience among affected communities
# tons of CO2 avoided
</td>
<td>
</td>
<td></td>
      </tr>
      <tr>
        
        <td> 14</td>
        <td> How would the quantum computing solution improve the monitoring and restoration of ocean biodiversity?</td>
        <td>% Increase in ocean biodiversity restoration</td>
<td></td>
<td></td>
      </tr>
      <tr>
        
        <td> 15</td>
        <td> How would the quantum computing solution impact land use and improve biodiversity conservation?</td>
        <td>#Improvement in restoration of ecosystem and habitat</td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td rowSpan={4} style={{ backgroundColor: "#fae5dc", fontWeight: "bold" }}>
  Prosperity <br />(financial &amp; economic)
</td>

        <td>8</td>
        <td>How would the quantum computing solution increase employment amongst the population?
How would it influence financial stability and growth opportunities for the population?
</td>
<td># Employment increase
# perceived financial growth and stability
</td>
<td>
</td>
<td></td>
      </tr>
      <tr>
        
        <td>9</td>
        <td>How would quantum computing impact innovation?</td>
        <td># Increase in innovation
# Number of scalable solutions developed for broader adoption
</td>
<td></td>
<td></td>
      </tr>
      <tr>
      <td> 10</td>
      <td>How would quantum computing improve technological access?</td>
      <td># Level of equal access to knowledge and use</td>
      <td></td>
      <td></td>
      </tr>
      <tr>
       
        <td>11</td>
        <td>How would the quantum computing solution improve urban planning ?</td>
        <td># of quantum computing employed in urban planning</td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </table>
</div>


        <h2 className="arvo-section">Baseline</h2>
        <p>Baseline defines what the current situation is today. Based on this reference, change can be measured over time. </p>

        <h2 className="arvo-section">Summary of the ToC framework</h2>
        <p>Once each component of the Theory of Change has been assessed, the next step is to cross check if the dots connect using the <strong>“If…then...” logic </strong>and see if it clearly expresses the <strong>cause-effect relationships between the actions, deliverables, short-term and mid-term impacts and long-term impact.</strong> Whenever needed, steps could at this point be adjusted to fill any logical gaps.</p>
        <p>For each quantum computing use case, when anticipating the impact of the deployed solution, in line with addressing the societal problem it is geared towards addressing, these questions should be answered:</p>
        <ul>
          <li>What change does the solution hope to create (long-term impact)?
</li>
          <li>What must happen right before that (mid-term impact)?
</li>
          <li>What are the expected immediate results (short-term impact)?
</li>
          <li>What actions and resources drive these results (actions + inputs)?</li>
          <li>What assumptions must be true? What are the risks that would deter the solution?
</li>
          
        </ul>

        <h2 id="sdg-interlinkage" className="arvo-section">SDG Interlinkage</h2>
        <p>The potential influence of a quantum computing use case on both system-wide SDG interactions and individual SDG targets can be assessed using the SDG cross-impact matrix and the related target influences. The matrix helps uncover synergies, dependencies, and trade-offs, providing valuable insights to guide implementation, evaluation, and decision-making and be used to refine strategy, prioritize targets, and identify potential risks or bottlenecks while designing the quantum computing use case. It reveals whether the solution has broad systemic value, assesses potential scalability or fragility and informs positive and negative externalities. At a macro-Level and global projection, this analysis helps compare use cases by systemic impact potential, and informs policy-level decisions on solution selection and scaling.

In completing the SDG Interlinkage Diagram, self-select SDG targets based on the primary SDG tackled by the quantum computing solution. Effective self-assessment requires a good understanding of the problem analysis addressed by the quantum computing solution outlined in the ToC framework - prior completion of the Impact Indicator Matrix is thus needed. Please use the SDG targets and indicator global framework for reference.</p>
<li>Each row represents an influencing SDG target (how that target affects others). A higher sum at the end of a row means: That target has a broad positive influence on many others. For instance, target 6.5 has the highest row sum (26), suggesting that improving water management would have widespread benefits across other targets. </li>
<li>Each column shows how much a specific target is influenced by others. A higher sum at the bottom of a column means: That target depends on improvements in many other areas. It may be harder to achieve on its own and may need supportive conditions elsewhere. </li>
        <p><strong>Interaction Scale:</strong></p>
        <ul>
          <li><strong>+3, Strongly promoting </strong>(colour coded dark green); significant positive influence; progress in one target powerfully accelerates another. </li>
          <li><strong>+2, Clear positive influence </strong>(colour coded green); one target's progress benefits another in a meaningful way.</li>
          <li><strong>+1, Weakly promoting</strong> (colour coded light green); minor or direct positive influence. helpful but not a key driver.</li>
          <li><strong>0, Neutral</strong> (colour coded white); achieving one target does not affect the progress of the other in either ways.</li>
          <li><strong>-1, Weakly restricting</strong> (colour coded yellow ); minor hindrance, some barriers or trade-off may arise with the interaction within the targets. 
</li>
          <li><strong>-2, Moderately restricting</strong>(colour coded orange); notably negative influence, progress in one target can obstruct or compete with the another.</li>
          <li><strong>-3, Strongly restricting </strong> (colour coded red); this indicates a major trade-off or conflict within the targets. Achieving one target significantly limits or undermines the other. </li>
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
