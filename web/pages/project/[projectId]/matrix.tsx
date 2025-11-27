import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from '../../../styles/matrix.module.css';

interface SDGTarget {
  id: string;
  code: string;
  title: string;
  sdgId: number;
  sdg: {
    code: string;
    name: string;
    colorHex?: string;
  };
}

interface MatrixEntry {
  sourceSdgTargetId: string;
  targetSdgTargetId: string;
   score: number | null;
  rationale?: string;
}

const scoreColors: { [key: number]: string } = {
  [-3]: '#C7422A',   // Cancelling
  [-2]: '#E6914A',   // Counteracting
  [-1]: '#F1C120',   // Constraining
   [0]: '#E6D720',   // NEW → "No influence" yellow
   [1]: '#9CCF6C',   // Enabling
   [2]: '#61AD4A',   // Reinforcing
   [3]: '#185C29',   // Indivisible
};

export default function MatrixPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const matrixRef = useRef<HTMLDivElement>(null);

  const [targets, setTargets] = useState<SDGTarget[]>([]);
  const [matrix, setMatrix] = useState<{ [key: string]: MatrixEntry }>({});
// 🔥 Dynamically scale matrix cells based on number of targets
useEffect(() => {
  if (targets.length > 0) {
    document.documentElement.style.setProperty(
      "--matrix-size",
      targets.length.toString()
    );

    // compute cell sizes
    const cellSize = Math.max(22, Math.min(60, 420 / targets.length));

    document.documentElement.style.setProperty(
      "--matrix-cell-size",
      `${cellSize}px`
    );
  }
}, [targets]);

  const [loading, setLoading] = useState(true);
    // 🔥 Dynamically scale matrix cells based on number of targets



const [showInstructions, setShowInstructions] = useState(true); // 👈 new
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<{
    source: SDGTarget;
    target: SDGTarget;
    currentScore: number;
    rationale?: string;
  } | null>(null);
  const [tempScore, setTempScore] = useState<number>(0);
  const [tempRationale, setTempRationale] = useState<string>("");
const [showStats, setShowStats] = useState(false);
const [showScale, setShowScale] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_BASE) {
  // console.error("API base URL is not defined.");
  return;
}

    if (!projectId || typeof projectId !== 'string') return;


const fetchTargets = async () => {
  try {
    const res = await axios.get<SDGTarget[]>(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/project/${projectId}/sdg-targets`, { withCredentials: true } 
    );
    setTargets(res.data);
    return res;
  } catch (error) {
    // console.error("Failed to fetch SDG targets:", error);
    alert("Something went wrong while loading targets. Please refresh or try again.");

  }
};


const fetchMatrix = async () => {
  try {
    const res = await axios.get<MatrixEntry[]>(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/project/${projectId}/matrix`, { withCredentials: true } 
    );
    const entries: { [key: string]: MatrixEntry } = {};
    res.data.forEach((entry) => {
      const key = `${entry.sourceSdgTargetId}_${entry.targetSdgTargetId}`;
      entries[key] = entry;
    });
    setMatrix(entries);
    
    return res;
  } catch (error) {
    // console.error("Failed to fetch matrix data:", error);
    alert("Failed to load SDG matrix.");
  }
};


    Promise.all([fetchTargets(), fetchMatrix()]).then(([targetsRes, matrixRes]) => {
      const sortedTargets = targetsRes.data.sort((a, b) => {
        const [aMajor, aMinor] = a.code.split('.').map(Number);
        const [bMajor, bMinor] = b.code.split('.').map(Number);
        return aMajor !== bMajor ? aMajor - bMajor : aMinor - bMinor;
      });
      setTargets(sortedTargets);
    }).finally(() => setLoading(false));
  }, [projectId]);
// 🔥 Remove stale matrix entries for deleted SDG targets
useEffect(() => {
  if (targets.length === 0 || Object.keys(matrix).length === 0) return;

  const validIds = new Set(targets.map(t => t.id));

  const cleanedMatrix = Object.fromEntries(
    Object.entries(matrix).filter(([key, entry]) =>
      validIds.has(entry.sourceSdgTargetId) &&
      validIds.has(entry.targetSdgTargetId)
    )
  );

  if (Object.keys(cleanedMatrix).length !== Object.keys(matrix).length) {
    setMatrix(cleanedMatrix);
  }
}, [targets]);

const updateEntry = async (sourceId: string, targetId: string, score: number, rationale?: string) => {
  const key = `${sourceId}_${targetId}`;
  const updated = {
    ...matrix,
    [key]: { sourceSdgTargetId: sourceId, targetSdgTargetId: targetId, score, rationale }
  };
  setMatrix(updated);

try {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/project/${projectId}/matrix`,
{ 
  projectId,
  sourceSdgTargetId: sourceId,
  targetSdgTargetId: targetId,
  score: score,           // null allowed
  rationale
},
    { withCredentials: true }
  );
  // console.log("🟢 Matrix entry saved:", res.data);
} catch (error: any) {
  // console.error("🔴 Matrix entry save failed:", error.response?.data || error.message);
}


};


  const openModal = (source: SDGTarget, target: SDGTarget, current: MatrixEntry) => {
    setSelectedPair({
      source,
      target,
      currentScore: current?.score ?? 0,
      rationale: current?.rationale ?? ""
    });
    setTempScore(current?.score ?? 0);
    setTempRationale(current?.rationale ?? "");
    setModalOpen(true);
  };

const handleModalSave = async () => {
  // console.log("💾 Save button clicked");
  if (!projectId || typeof projectId !== "string") {
    // console.warn("⚠️ No projectId, skipping save");
    return;
  }

  if (!selectedPair) {
    // console.warn("⚠️ No selected pair, skipping save");
    return;
  }

  // console.log("📤 Proceeding to save", {
  //   source: selectedPair.source.id,
  //   target: selectedPair.target.id,
  //   score: tempScore,
  //   rationale: tempRationale,
  // });

await updateEntry(
  selectedPair.source.id,
  selectedPair.target.id,
  tempScore,                 // can be null now
  tempRationale?.trim() || ""
);



  setModalOpen(false);
};


const exportMatrixAsPDF = async () => {
  const input = document.getElementById('matrix-table-wrapper');
  if (!input) {
    alert("Matrix element not found.");
    return;
  }

  try {
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvasAspectRatio = canvas.width / canvas.height;
    const maxWidth = pageWidth - 20;
    const maxHeight = pageHeight - 20;

    let imgWidth = maxWidth;
    let imgHeight = imgWidth / canvasAspectRatio;

    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = imgHeight * canvasAspectRatio;
    }

    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save('sdg-matrix.pdf');
  } catch (error) {
    // console.error("Failed to export PDF:", error);
    alert("Could not export PDF. Please try again.");
  }
};


  if (loading) return <div className="p-6 font-medium">Loading matrix...</div>;

  const rowSums = targets.map((source) =>
    targets.reduce((sum, target) => sum + (matrix[`${source.id}_${target.id}`]?.score ?? 0), 0)
  );

  const colSums = targets.map((target) =>
    targets.reduce((sum, source) => sum + (matrix[`${source.id}_${target.id}`]?.score ?? 0), 0)
  );
  // --- STATISTICS COMPUTATION (CORRECTED) ---

// All entries that have been saved (score is not null or undefined)
const allEntries = Object.values(matrix).filter(
  (e) => e.score !== null && e.score !== undefined
);

// Colored cells only (scores !== 0)
const coloredEntries = allEntries.filter((e) => e.score !== 0);

// Denominator should be number of colored cells
const totalColored = coloredEntries.length;

// Stats per category
const stats = {
  indivisible: coloredEntries.filter((e) => e.score === 3).length,
  reinforcing: coloredEntries.filter((e) => e.score === 2).length,
  enabling: coloredEntries.filter((e) => e.score === 1).length,
  constraining: coloredEntries.filter((e) => e.score === -1).length,
  counteracting: coloredEntries.filter((e) => e.score === -2).length,
  cancelling: coloredEntries.filter((e) => e.score === -3).length,

  // Score 0 shown separately (NOT included in denominator)
  noInfluence: allEntries.filter((e) => e.score === 0).length,
};





  return (
  <div className={styles.container}>
    {/* <div className={styles.instructions}>
      <h2 className="font-bold text-lg mb-2">Instructions</h2>
      <ol className="list-decimal list-inside text-sm">
        <li>Click a cell to select interaction score and rationale.</li>
        <li>Save the chosen score and explanation.</li>
        <li>Option to export as pdf.</li>
      </ol>
    </div> */}
    <div className={styles.instructionsWrapper}>
  <button
    type="button"
    className={styles.instructionsHeader}
    onClick={() => setShowInstructions((prev) => !prev)}
  >
    <div className={styles.instructionsHeaderText}>
      <span className={styles.instructionsTitle}>Instructions</span>
      <span className={styles.instructionsSubtitle}>
        Quick steps to use this page
      </span>
    </div>
    <span className={styles.instructionsChevron} aria-hidden="true">
      {showInstructions ? '▾' : '▸'}
    </span>
  </button>

  {showInstructions && (
    <div className={styles.instructions}>
      <ol>
        <li>
Click a cell to select interaction score and rationale.
        </li>
        <li>Save the chosen score and explanation.</li>
        <li>Option to export as pdf.</li>

      </ol>
    </div>
  )}
</div>
<h3 className={styles.sectionTitle}>
  <a
    href="/user-guide#sdg-interlinkage"
    target="_blank"
    rel="noopener noreferrer"
    className={styles.noUnderline}
  >
    SDG Interlinkage Matrix
  </a>
</h3>


<p className={styles.note}>
 The SDG Interlinkage Matrix visualizes interactions, both positive and negative, across the SDGs.
Assess how your Quantum solution's SDG targets (rows) influence or are influenced by other targets (columns). For each intersection, assess the level of impact using the provided rating scale and make sure to justify your ratings.

Refer to the <a href="/user-guide" target="_blank" rel="noopener noreferrer">
     User Guide 
  </a>  for further details and guidance on how to conduct this assessment.

</p>

    <div className={styles.flexRow}>
      <div id="matrix-table-wrapper" className="w-full flex justify-center">
        <table className={styles.matrixTable}>
          <thead>
            <tr>
              <th className="bg-gray-200 p-2 font-semibold border text-sm">Influencing Targets</th>
{targets.map((target) => (
<th key={target.id} className={styles.headerCell}>
  <div
    className={`${styles.tooltip} ${styles.tooltipBottom}`}
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    }}
  >
    <span>{target.code}</span>
    <div className={styles.tooltipText}>{target.title}</div>
  </div>
</th>



))}



              <th className="bg-purple-200 p-2 font-semibold border text-sm">Outsum</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((source, rowIndex) => (
              <tr key={source.id}>
<td className={styles.headerCell}>
  <div
    className={`${styles.tooltip} ${styles.tooltipTop}`}
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    }}
  >
    <span>{source.code}</span>
    <div className={styles.tooltipText}>{source.title}</div>
  </div>
</td>




                {targets.map((target) => {
                  const key = `${source.id}_${target.id}`;
                  const entry = matrix[key];
                  const score = entry ? entry.score : null;

                  const isDiagonal = source.id === target.id;

                  return (
<td
  key={target.id}
  className="border p-1 text-center"
  style={{
    backgroundColor: isDiagonal
  ? '#F5F5F5'
  : score === null
      ? '#FFFFFF'     // empty – untouched
      : scoreColors[score],

    pointerEvents: isDiagonal ? 'none' : 'auto',
    opacity: isDiagonal ? 0.6 : 1,
    position: "relative",
    cursor: isDiagonal ? "default" : "pointer",
  }}

  onMouseEnter={(e) => {
    if (isDiagonal) return;

    const popup = document.getElementById("hoverPopup");
    if (!popup) return;

    popup.innerHTML = `
      <h3 style="margin-top:0; font-size:1.1rem; color:white;">
        How is target ${source.code} affecting target ${target.code}?
      </h3>

      <div style="margin-bottom:10px;">
        <strong style="color:#facc15;">Target ${source.code}</strong><br/>
        ${source.title}
      </div>

      <div style="margin-bottom:10px;">
        <strong style="color:#facc15;">Target ${target.code}</strong><br/>
        ${target.title}
      </div>

      <div style="
        background:white;
        padding:8px;
        border-radius:6px;
        color:#374151;
        font-weight:600;
      ">
        ${score === 0 ? "No value assigned" : score}
      </div>
    `;

    popup.classList.add(styles.showPopup);

    // const rect = e.currentTarget.getBoundingClientRect();
    // popup.style.top = rect.top + window.scrollY + "px";
    // popup.style.left = rect.right + 15 + "px";
  }}

  onMouseLeave={() => {
    const popup = document.getElementById("hoverPopup");
    if (popup) popup.classList.remove(styles.showPopup);
  }}

  onClick={() =>
    !isDiagonal &&
    openModal(source, target, entry || {
      sourceSdgTargetId: source.id,
      targetSdgTargetId: target.id,
      score: 0,
      rationale: '',
    })
  }
>
  <div style={{ visibility: "hidden" }}>{score}</div>

</td>

                  );
                })}
                <td className="bg-purple-200 p-2 font-semibold border text-center text-sm">{rowSums[rowIndex]}</td>
              </tr>
            ))}
            <tr>
              <td className="bg-purple-200 p-2 font-semibold border text-sm">Insum</td>
              {colSums.map((sum, colIdx) => (
                <td key={colIdx} className="bg-purple-200 p-2 border text-center font-semibold text-sm">{sum}</td>
              ))}
              <td className="bg-gray-100 border"></td>
            </tr>
          </tbody>
        </table>
        <div id="hoverPopup" className={styles.hoverPopup}></div>
      </div>

{/* --- RIGHT PANEL (Interaction Scale + Statistics stacked vertically) --- */}
<div className={styles.rightPanel}>

  {/* --- INTERACTION SCALE (NON-COLLAPSIBLE) --- */}
  <div className={styles.scaleBox}>
    <button
      className={styles.scaleHeader}
      onClick={() => setShowScale(prev => !prev)}
    >
      <div className={styles.scaleHeaderLeft}>
        
        <span className={styles.scaleTitle}>Interaction Scale</span>
      </div>
      <span className={styles.statsChevron}>{showScale ? "▾" : "▸"}</span>
    </button>

    {showScale && (
      <div className={styles.scaleContent}>
        <ul className={styles.legendBox}>
          <li><span style={{ backgroundColor: '#185C29' }}></span> +3 Indivisible</li>
          <li><span style={{ backgroundColor: '#61AD4A' }}></span> +2 Reinforcing</li>
          <li><span style={{ backgroundColor: '#9CCF6C' }}></span> +1 Enabling</li>
          <li><span style={{ backgroundColor: '#E6D720', border: '1px solid #ccc' }}></span> 0 Consistent</li>
          <li><span style={{ backgroundColor: '#F1C120' }}></span> -1 Constraining</li>
          <li><span style={{ backgroundColor: '#E6914A' }}></span> -2 Counteracting</li>
          <li><span style={{ backgroundColor: '#C7422A' }}></span> -3 Cancelling</li>
        </ul>
      </div>
    )}
  </div>

  {/* --- STATISTICS (COLLAPSIBLE) --- */}
   <div className={styles.statsAccordion}>
    <button
      className={styles.statsAccordionHeader}
      onClick={() => setShowStats(prev => !prev)}
    >
      <div className={styles.statsAccordionHeaderLeft}>
       
        <span className={styles.statsTitle}>Statistics</span>
      </div>
      <span className={styles.statsChevron}>{showStats ? "▾" : "▸"}</span>
    </button>

    {showStats && (
      <div className={styles.statsAccordionContent}>
        
        {stats.indivisible > 0 && (
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Indivisible (+3)</span>
            <span className={styles.statValue}>{stats.indivisible}/{totalColored}</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}
                style={{ width: `${(stats.indivisible / totalColored) * 100}%`, background: '#185C29' }}
              />
            </div>
          </div>
        )}

        {stats.reinforcing > 0 && (
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Reinforcing (+2)</span>
            <span className={styles.statValue}>{stats.reinforcing}/{totalColored}</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}
                style={{ width: `${(stats.reinforcing / totalColored) * 100}%`, background: '#61AD4A' }}
              />
            </div>
          </div>
        )}

        {stats.noInfluence > 0 && (
          <div className={styles.statRow}>
            <span className={styles.statLabel}>No influence (0)</span>
            <span className={styles.statValue}>{stats.noInfluence}/{totalColored}</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}
                style={{ width: `${(stats.noInfluence / totalColored) * 100}%`, background: '#E6D720' }}
              />
            </div>
          </div>
        )}
                {stats.constraining > 0 && (
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Constraining (0)</span>
            <span className={styles.statValue}>{stats.constraining}/{totalColored}</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}
                style={{ width: `${(stats.constraining / totalColored) * 100}%`, background: '#F1C120' }}
              />
            </div>
          </div>
        )}

        {stats.counteracting > 0 && (
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Counteracting (-2)</span>
            <span className={styles.statValue}>{stats.counteracting}/{totalColored}</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}
                style={{ width: `${(stats.counteracting / totalColored) * 100}%`, background: '#E6914A' }}
              />
            </div>
          </div>
        )}
                {stats.enabling > 0 && (
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Enabling (+1)</span>
            <span className={styles.statValue}>{stats.enabling}/{totalColored}</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}
                style={{ width: `${(stats.enabling / totalColored) * 100}%`, background: '#9CCF6C' }}
              />
            </div>
          </div>
        )}

        {stats.cancelling > 0 && (
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Cancelling (-3)</span>
            <span className={styles.statValue}>{stats.cancelling}/{totalColored}</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}
                style={{ width: `${(stats.cancelling / totalColored) * 100}%`, background: '#C7422A' }}
              />
            </div>
          </div>
        )}

      </div>
    )}
  </div> 

</div>



    </div>


        {/* <button onClick={exportMatrixAsPDF} className={styles.buttonPrimary}>
          Export as PDF
        </button> */}
        <div className="actionIconBar">
          <button className="actionIcon" title="Export as PDF"
    onClick={exportMatrixAsPDF}>
    <i className="uil uil-import"></i>
  </button>

  <button
    className="actionIcon"
    title="Edit Input"
    onClick={() => router.push(`/project/${projectId}`)}
  >
    <svg 
      width="18" height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  </button>
<button 
  className="actionIcon" 
  title="Edit Diagram"
  onClick={() => router.push(`/project/${projectId}/diagram`)}
>
  <svg 
    viewBox="0 0 512 512" 
    fill="#ffffff" 
    width="20" 
    height="20"
    style={{ display: "block" }}
  >
    <path d="M64,64 L362.666667,64 L426.666667,128 L426.666667,448 L128,448 L64,384 L64,64 Z 
             M341.333333,106.666667 L106.666667,106.666667 L106.666667,362.666667 
             L341.333333,362.666667 L341.333333,106.666667 Z 
             M192,149.333333 L192,170.666667 L234.666667,170.666667 
             L234.666,277.333333 L256,277.333333 L256,256 L320,256 L320,320 
             L256,320 L256,298.666667 L192,298.666333 L192,320 L128,320 
             L128,256 L192,256 L192,277.333333 L213.333,277.333333 
             L213.333,191.999333 L192,192 L192,213.333333 L128,213.333333 
             L128,149.333333 L192,149.333333 Z"/>
  </svg>
</button>
</div>

{modalOpen && selectedPair && (
  <div className={styles.modalBackdrop} onClick={() => setModalOpen(false)}>
    <div
      className={styles.modalContent}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <div className={styles.modalHeaderIcons}>
        <button onClick={() => setModalOpen(false)} className={styles.iconButton}>
          ✖
        </button>
      </div>

      {/* Title + description */}
      <h2 className={styles.modalTitle}>Edit Score</h2>
      <p className={styles.modalDescription}>
        <em>
          <strong>{selectedPair.source.code}</strong> →{" "}
          <strong>{selectedPair.target.code}</strong>
        </em>
      </p>

      {/* Score dropdown (styled like Create Project inputs) */}
<select
  value={tempScore}
  onChange={(e) => {
    const value = e.target.value;
    setTempScore(value === "null" ? null : parseInt(value));
  }}
  className={styles.modalInput}
>
  <option value="null">-- Clear (Empty) --</option>   {/* NEW */}
  {[3, 2, 1, 0, -1, -2, -3].map((val) => (
    <option key={val} value={val}>
      {val}
    </option>
  ))}
</select>


      {/* Rationale input */}
      <textarea
        className={styles.modalInput}
        placeholder="Explanation (optional)"
        value={tempRationale}
        onChange={(e) => setTempRationale(e.target.value)}
      />

      {/* Buttons */}
      <div className={styles.modalActions}>
        <button
          className="nice-button"
          style={{
            marginTop: "1.5rem",
            backgroundColor: "#f3f4f6",
            color: "#111827",
            border: "1px solid #ccc",
          }}
          onClick={() => setModalOpen(false)}
        >
          Cancel
        </button>
        <button
          className="nice-button"
          style={{ marginTop: "1.5rem" }}
          onClick={handleModalSave}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}


  </div>
);
}