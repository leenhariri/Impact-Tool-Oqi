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
  const [matrix, setMatrix] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const fetchTargets = async () => {
      const res = await axios.get<SDGTarget[]>(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/project/${projectId}/sdg-targets`
      );
      setTargets(res.data);
    };

    const fetchMatrix = async () => {
      const res = await axios.get<MatrixEntry[]>(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/project/${projectId}/matrix`
      );
      const saved: MatrixEntry[] = res.data;
      const entries: { [key: string]: number } = {};
      saved.forEach((entry) => {
        entries[`${entry.sourceSdgTargetId}_${entry.targetSdgTargetId}`] = entry.score;
      });
      setMatrix(entries);
    };

    Promise.all([fetchTargets(), fetchMatrix()]).finally(() => setLoading(false));
  }, [projectId]);

  const updateEntry = async (sourceId: string, targetId: string, score: number) => {
    const key = `${sourceId}_${targetId}`;
    const updated = { ...matrix, [key]: score };
    setMatrix(updated);

    await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/project/${projectId}/matrix`, {
      sourceSdgTargetId: sourceId,
      targetSdgTargetId: targetId,
      score,
    });
  };

const exportMatrixAsPDF = async () => {
  const input = document.getElementById('matrix-table-wrapper');
  if (!input) return;

  const canvas = await html2canvas(input, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Scale image to fit within the page while maintaining aspect ratio
  const canvasAspectRatio = canvas.width / canvas.height;
  const maxWidth = pageWidth - 20; // margins
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
};


  if (loading) return <div className="p-6 font-medium">Loading matrix...</div>;

  const rowSums = targets.map((source) =>
    targets.reduce((sum, target) => sum + (matrix[`${source.id}_${target.id}`] ?? 0), 0)
  );

  const colSums = targets.map((target) =>
    targets.reduce((sum, source) => sum + (matrix[`${source.id}_${target.id}`] ?? 0), 0)
  );

  return (
    <div className={styles.container}>
      <div className={styles.instructions}>
        <h2 className="font-bold text-lg mb-2">Instructions</h2>
        <ol className="list-decimal list-inside text-sm">
          <li>Insert the corresponding number from the given legend into the matrix boxes to edit elements of the matrix.</li>
          <li>Save your work once done.</li>
          <li>Option to export as PDF.</li>
        </ol>
      </div>

      <h1 className={styles.heading}>SDG Interlinkage Matrix</h1>

      <div className="flex justify-center items-start gap-8 flex-wrap sm:flex-nowrap">
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
                    const score = matrix[key] ?? 0;
                    return (
                      <td key={target.id} className="border p-1 text-center" style={{ backgroundColor: scoreColors[score] || '#FFF' }}>
                        <input
                          type="number"
                          min={-3}
                          max={3}
                          value={Number.isFinite(score) ? score : 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const safeScore = Number.isFinite(val) ? val : 0;
                            updateEntry(source.id, target.id, safeScore);
                          }}
                          className={styles.inputCell}
                        />
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
            <li><span className="inline-block w-4 h-4 mr-2 align-middle" style={{ backgroundColor: '#8B0000' }}></span> -3 Cancelling</li>
            <li><span className="inline-block w-4 h-4 mr-2 align-middle" style={{ backgroundColor: '#DC143C' }}></span> -2 Counteracting</li>
            <li><span className="inline-block w-4 h-4 mr-2 align-middle" style={{ backgroundColor: '#FF007F' }}></span> -1 Constraining</li>
            <li><span className="inline-block w-4 h-4 mr-2 align-middle" style={{ backgroundColor: '#FFFFFF', border: '1px solid #ccc' }}></span> 0 Consistent</li>
            <li><span className="inline-block w-4 h-4 mr-2 align-middle" style={{ backgroundColor: '#FFFF66' }}></span> +1 Enabling</li>
            <li><span className="inline-block w-4 h-4 mr-2 align-middle" style={{ backgroundColor: '#90EE90' }}></span> +2 Reinforcing</li>
            <li><span className="inline-block w-4 h-4 mr-2 align-middle" style={{ backgroundColor: '#006400' }}></span> +3 Indivisible</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button onClick={exportMatrixAsPDF} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
          📄 Export Matrix as PDF
        </button>
      </div>
    </div>
  );
}
