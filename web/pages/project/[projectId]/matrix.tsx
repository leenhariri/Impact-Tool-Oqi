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
  score: number;
  rationale?: string;
}

const scoreColors: { [key: number]: string } = {
  [-3]: '#8B0000',
  [-2]: '#DC143C',
  [-1]: '#FF007F',
  [0]: '#FFFFFF',
  [1]: '#FFFF66',
  [2]: '#90EE90',
  [3]: '#006400',
};

export default function MatrixPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const matrixRef = useRef<HTMLDivElement>(null);

  const [targets, setTargets] = useState<SDGTarget[]>([]);
  const [matrix, setMatrix] = useState<{ [key: string]: MatrixEntry }>({});
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<{
    source: SDGTarget;
    target: SDGTarget;
    currentScore: number;
    rationale?: string;
  } | null>(null);
  const [tempScore, setTempScore] = useState<number>(0);
  const [tempRationale, setTempRationale] = useState<string>("");

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
      score,
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
  tempScore,
  tempRationale?.trim() // this can be empty now
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

  return (
  <div className={styles.container}>
    <div className={styles.instructions}>
      <h2 className="font-bold text-lg mb-2">Instructions</h2>
      <ol className="list-decimal list-inside text-sm">
        <li>Click a cell to select interaction score and rationale.</li>
        <li>Save the chosen score and explanation.</li>
        <li>Option to export as pdf.</li>
      </ol>
    </div>
<h3 className={styles.sectionTitle}>
  <a href="/user-guide#sdg-interlinkage" target="_blank" rel="noopener noreferrer">
     SDG Interlinkage Matrix
  </a>
</h3>

<p className={styles.note}>
  Please refer to the section in the User Guide for full instructions
</p>
    <div className={styles.flexRow}>
      <div id="matrix-table-wrapper" className="w-full flex justify-center">
        <table className={styles.matrixTable}>
          <thead>
            <tr>
              <th className="bg-gray-200 p-2 font-semibold border text-sm">Influencing Targets</th>
              {targets.map((target) => (
                <th key={target.id} className={styles.headerCell}>{target.code}</th>
              ))}
              <th className="bg-purple-200 p-2 font-semibold border text-sm">Outsum</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((source, rowIndex) => (
              <tr key={source.id}>
                <td className={styles.headerCell}>{source.code}</td>
                {targets.map((target) => {
                  const key = `${source.id}_${target.id}`;
                  const entry = matrix[key];
                  const score = entry?.score ?? 0;
                  const isDiagonal = source.id === target.id;

                  return (
                    <td
                      key={target.id}
                      className="border p-1 text-center cursor-pointer"
                      style={{
                        backgroundColor: isDiagonal ? '#F5F5F5' : scoreColors[score] || '#FFF',
                        pointerEvents: isDiagonal ? 'none' : 'auto',
                        opacity: isDiagonal ? 0.6 : 1,
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
                      {score}
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
      </div>

      <div className={styles.legendWrapper}>
        <h3 className="font-semibold text-md mb-2">Interaction Scale</h3>
        <ul className={styles.legendBox}>
          <li><span style={{ backgroundColor: '#006400' }}></span> +3 Indivisible</li>
          <li><span style={{ backgroundColor: '#90EE90' }}></span> +2 Reinforcing</li>
          <li><span style={{ backgroundColor: '#FFFF66' }}></span> +1 Enabling</li>
          <li><span style={{ backgroundColor: '#FFFFFF', border: '1px solid #ccc' }}></span> 0 Consistent</li>
          <li><span style={{ backgroundColor: '#FF007F' }}></span> -1 Constraining</li>
          <li><span style={{ backgroundColor: '#DC143C' }}></span> -2 Counteracting</li>
          <li><span style={{ backgroundColor: '#8B0000' }}></span> -3 Cancelling</li>
        </ul>
      </div>
    </div>

    <div className={styles.bottomButtonRow}>
      <div className={styles.leftButtons}>
        <button onClick={exportMatrixAsPDF} className={styles.buttonPrimary}>
          Export as PDF
        </button>
      </div>
      <div className={styles.rightButtons}>
        <button onClick={() => router.push(`/project/${projectId}`)} className={styles.buttonPrimary}>
          Edit Input
        </button>
        <button onClick={() => router.push(`/project/${projectId}/diagram`)} className={styles.buttonPrimary}>
          Edit Diagram
        </button>
      </div>
    </div>

{modalOpen && selectedPair && (
  <div
    className={styles.modalOverlay}
    onClick={() => setModalOpen(false)} // click outside = cancel
  >
    <div
      className={styles.modalContent}
      onClick={(e) => e.stopPropagation()} // prevent modal click from closing
    >
      <h3 className="text-lg font-semibold mb-3">Edit Interaction</h3>
      <p className="mb-3 text-sm text-gray-600">
        <strong>{selectedPair.source.code}</strong> → <strong>{selectedPair.target.code}</strong>
      </p>

      <label className="block text-sm font-medium mb-1">Score</label>
      <select
        value={tempScore}
        onChange={(e) => setTempScore(parseInt(e.target.value))}
        className="w-full p-2 border rounded mb-3"
      >
        {[3,2,1,0,-1,-2,-3].map((val) => (
          <option key={val} value={val}>{val}</option>
        ))}
      </select>

      <label className="block text-sm font-medium mb-1">Rationale</label>
      <textarea
        value={tempRationale}
        onChange={(e) => setTempRationale(e.target.value)}
        className="w-full p-2 border rounded h-24"
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button onClick={handleModalSave} className={styles.buttonPrimary}>Save</button>
        <button onClick={() => setModalOpen(false)} className={styles.buttonPrimary}>Cancel</button>
        
      </div>
    </div>
  </div>
)}

  </div>
);
}