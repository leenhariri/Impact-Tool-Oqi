// pages/user-guide.tsx

import React from "react";

import Head from 'next/head'

export default function UserGuide() {
  return (
    <>
      <div className="hero">
        <div className="hero-text">
          <h1>User Guide</h1>
          <p>Step-by-step guidance to help you navigate, use, and make the most of the OQI Impact Tool.</p>
        </div>
      </div>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', lineHeight: '1.7', fontFamily: 'Inter, sans-serif' }}>
        
        <p><strong>The Impact User Guide</strong> consists of the following elements:</p>

        <ul>
          <li><strong>Impact Indicator Matrix:</strong> This matrix captures the anticipated long-, mid-and short-term impact of the quantum computing use case. Users are encouraged to carefully consider the assumptions underlying the anticipated impact, highlight possible risks and unintended consequences along with mitigation strategies, and list relevant stakeholders involved.</li>
          <li><strong>Anticipated Impact Flowchart:</strong> Based on the input of the Impact Indicator Matrix, this flowchart illustrates how different anticipated output and impact relate to each other. It helps to visualize potential correlations and causalities.</li>
          <li><strong>SDG Interlinkage Diagram:</strong> In the form of a heat-map, this diagram helps uncover how the anticipated impact affects the SDGs. It highlights the degree to which impact on one SDG may be linked to another, while also drawing attention to areas where negative impacts may occur.</li>
        </ul>

        <p>This structured framework is based on the <strong>Theory of Change (ToC)</strong> (See Useful References for more general details), which outlines the logic flow, as a roadmap, of how a solution attains its ultimate impact. Below are defined the core components in the pathway of actions to intended long-term impact and how they are connected.</p>

        <h2>Long-term Impact</h2>
        <p>The long-term impact refers to the ultimate, lasting change that a quantum computing solution aims to achieve once deployed in the real-world. Considering the bigger picture, long-term impact reflects the societal transformation the solution contributes to–focusing on its effect on population, society, environment, economic, or global-level benefits that are anticipated to be achieved and would be attributed to the solution. The long-term impact should be aligned with the SDGs addressed by the quantum computing use case. In completing the Impact Indicator Matrix (link), long-term impact should be expressed as a high-level statement describing what success would look like beyond five years.</p>

        <h2>Short-term and Mid-term impacts</h2>
        <p>Before reaching the long-term impact, short-term and mid-term impacts would be realized first. This stage is known as outcomes—the necessary preconditions that pave the way toward long-term impact.</p>
        <p><strong>Mid-term impacts (2-5 years)</strong> describe behavioral, institutional, or systemic changes that make the long-term impact achievable. They cover substantial shifts over time, triggering broader lasting transformation within society. This is a stage where probably societal systems would start shifting due to the quantum computing solution deployed in the real-world. In completing the Impact Indicator Matrix (link), identify 2-3 key changes in behaviors, policies, operations, resource use, etc that would demonstrate progress at this level.</p>
        <p><strong>Short-term impacts (0-2 years)</strong> represent the early, tangible changes emerging soon after the solution would be deployed. They are often the early wins, offering evidence that a quantum computing solution is beginning to address the societal problem it targets. In completing the Impact Indicator Matrix (link), consider 2-3 key concrete changes in knowledge, behavior, conditions, etc. that could be observed in the early stages.</p>

        <h2>Unintended Negative Consequences / Risks / Spillovers</h2>
        <p>Although all use cases are designed with a positive impact on SDGs in mind, it is equally important to consider possible negative or unintended consequences and plan appropriate strategies to mitigate them.</p>

        <h2>Deliverables</h2>
        <p>Deliverables are the immediate, tangible outputs or results (products or services delivered by the solution) that the quantum computing solution would produce, with clear causal links to impacts.</p>

        <h2>Actions</h2>
        <p>On-the-ground core activities that would be carried out or implemented to initiate the change process and deploy the quantum computing solution to the real-world.</p>

        <h2>Resources</h2>
        <p>The resources are inputs that would be needed beforehand to carry out the actions. The resources could be human, financial, technical, material or infrastructural, etc. invested in the implementation of the quantum computing solution.</p>

        <h2>Assumptions & Risks</h2>
        <p><strong>7.1 Assumptions</strong> are external conditions that must be true for the pathway of change to succeed. They are the hidden enablers in the logic of change—if the assumptions break, the chain of change breaks as well. Consider the factors such as line of stakeholder’s behavior, data quality and availability, etc.</p>
        <p><strong>7.2 Risks</strong> are external or internal threats or challenges that could deter the success of the change pathway either in achieving intended results or in deploying the solution. Each risk should be associated with a mitigation action.</p>

        <h2>Stakeholders</h2>
        <p>Stakeholders are key people directly and indirectly involved or affected in the implementation or monitoring of the project/solution. For each component of the ToC, it’s useful to map the relevant stakeholders (people or organizations) and the level of implications (direct/indirect) and analyze their roles and influence, and thereafter devising strategies for engagement and to manage expectations.</p>

        <h2>Indicators</h2>
        <p>Indicators are measurable variables used to track progress and show whether a change or result is happening. It signals if the quantum computing solution would be working as expected or not and determines how much change has occurred. Indicators can be both quantitative (e.g., % increase in access) or qualitative (e.g., user satisfaction). Each indicator is linked to a specific component in the ToC to ensure each result level is measurable, where means of measurement are a method, source or tool to assess change. The table below provides examples of questions to guide defining indicators.</p>

        <h3>Examples of qualitative/quantitative questions / indicators</h3>
        <ul>
          <li>How would the quantum computing solution affect people (based on current state)?</li>
          <li>What are other contexts for which a similar solution could be applied?</li>
          <li>How will the quantum computing solution reduce poverty rates in populations?</li>
          <li>How would the quantum computing solution affect employment, income, businesses?</li>
          <li>How would quantum computing improve agricultural productivity and food security?</li>
          <li>How would the quantum computing solution improve disease diagnosis and reduce incidences?</li>
          <li>How would quantum computing improve healthcare systems and outcomes?</li>
          <li>How would the quantum computing solution improve access to technological skills and knowledge?</li>
          <li>How would quantum computing reduce gender inequality?</li>
          <li>How would quantum computing help to reduce water loss and improve access?</li>
          <li>How would the quantum computing solution help save energy?</li>
          <li>How would the quantum computing solution improve production and responsible consumption?</li>
          <li>How would the quantum computing solution help to reduce CO2 emissions?</li>
          <li>How would the quantum computing solution improve the monitoring and restoration of ocean biodiversity?</li>
          <li>How would the quantum computing solution impact land use and improve biodiversity conservation?</li>
          <li>How would the quantum computing solution increase employment amongst the population?</li>
          <li>How would quantum computing impact innovation?</li>
          <li>How would quantum computing improve technological access?</li>
          <li>How would the quantum computing solution improve urban planning?</li>
        </ul>

        <h2>Baseline</h2>
        <p>Baseline defines what the current situation is today. Based on this reference, change can be measured over time.</p>

        <h2>Summary of the ToC framework</h2>
        <p>Once each component of the Theory of Change has been assessed, the next step is to cross check if the dots connect using the “If…then...” logic and see if it clearly expresses the cause-effect relationships between the actions, deliverables, short-term and mid-term impacts and long-term impact. Whenever needed, steps could at this point be adjusted to fill any logical gaps.</p>
        <p>For each quantum computing use case, when anticipating the impact of the deployed solution, in line with addressing the societal problem it is geared towards addressing, these questions should be answered:</p>
        <ul>
          <li>What change does the solution hope to create (long-term impact)?</li>
          <li>What must happen right before that (mid-term impact)?</li>
          <li>What are the expected immediate results (short-term impact)?</li>
          <li>What actions and resources drive these results (actions + inputs)?</li>
          <li>What assumptions must be true?</li>
          <li>What are the risks that would deter the solution?</li>
        </ul>

       <h2 id="sdg-interlinkage">SDG Interlinkage</h2>

        <p>The potential influence of a quantum computing use case on both system-wide SDG interactions and individual SDG targets can be assessed using the SDG cross-impact matrix and the related target influences...</p>
        <p>In completing the SDG Interlinkage Diagram (link), self-select SDG targets based on the primary SDG tackled by the quantum computing solution. Effective self-assessment requires a good understanding of the problem analysis addressed by the quantum computing solution outlined in the ToC framework - prior completion of the Impact Indicator Matrix (link) is thus needed. Please use the SDG targets and indicator global framework for reference.</p>

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
    </>
  )
}
