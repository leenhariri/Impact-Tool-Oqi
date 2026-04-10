import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactFlow, { Background, Edge, MarkerType, Node } from "reactflow";
import "reactflow/dist/style.css";

type ImpactRow = {
  id: string;
  hierarchyLevel: string;
  resultStatement: string;
  indicator: string;
  indicatorDefinition: string;
  meansOfMeasurement: string;
  baseline: string;
  orderIndex: number;
  targets?: {
    sdgTargetId: string;
    sdg?: { id: number };
  }[];
};

type Risk = {
  id: string;
  text: string;
  hierarchies: { hierarchy: string }[];
};

type Activity = {
  id: string;
  text: string;
};

type Assumption = {
  id: string;
  text: string;
};

type Stakeholder = {
  id: string;
  name: string;
  role: string;
  interest: string;
  stakeholderType: string;
  engagementStrategy: string;
  hierarchyLevel: string;
};

type SDG = {
  id: number;
  code: string;
  name: string;
};

type SDGTarget = {
  id: string;
  sdgId: number;
  code: string;
  title: string;
};

type MatrixEntry = {
  sourceSdgTargetId: string;
  targetSdgTargetId: string;
  score: number | null;
  rationale?: string;
};

type DiagramNodePos = {
  nodeId: string;
  x: number;
  y: number;
};

type DiagramEdgeRow = {
  id: string;
  source: string;
  target: string;
};

const scoreColors: Record<number, string> = {
  [-3]: "#C7422A",
  [-2]: "#E6914A",
  [-1]: "#F1C120",
  [0]: "#E6D720",
  [1]: "#9CCF6C",
  [2]: "#61AD4A",
  [3]: "#185C29",
};

export default function ExportProjectZipPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const projectIdStr =
    router.isReady && typeof projectId === "string" ? projectId : null;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const diagramRef = useRef<HTMLDivElement>(null);
  const matrixRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const [error, setError] = useState("");

  const [impactRows, setImpactRows] = useState<ImpactRow[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assumptions, setAssumptions] = useState<Assumption[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [allSDGs, setAllSDGs] = useState<SDG[]>([]);
  const [allTargets, setAllTargets] = useState<SDGTarget[]>([]);
  const [matrixTargets, setMatrixTargets] = useState<SDGTarget[]>([]);
  const [matrixEntries, setMatrixEntries] = useState<Record<string, MatrixEntry>>(
    {}
  );
  const [savedNodes, setSavedNodes] = useState<DiagramNodePos[]>([]);
  const [savedEdges, setSavedEdges] = useState<DiagramEdgeRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!router.isReady || !projectIdStr || !API_BASE) return;

    const run = async () => {
      try {
        const [
          impactRes,
          risksRes,
          assumptionsRes,
          activitiesRes,
          stakeholdersRes,
          sdgsRes,
          targetsRes,
          matrixTargetsRes,
          matrixRes,
          nodesRes,
          edgesRes,
        ] = await Promise.all([
          fetch(`${API_BASE}/api/impact-rows/${projectIdStr}`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/risks/project/${projectIdStr}`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/assumptions/${projectIdStr}`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/activities/${projectIdStr}`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/stakeholders/${projectIdStr}`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/sdgs`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/sdg-targets`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/project/${projectIdStr}/sdg-targets`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/project/${projectIdStr}/matrix`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/diagram-nodes/${projectIdStr}`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/api/diagram-edges/${projectIdStr}`, {
            credentials: "include",
          }),
        ]);

        if (!impactRes.ok) throw new Error("Failed to load impact rows");
        if (!risksRes.ok) throw new Error("Failed to load risks");
        if (!assumptionsRes.ok) throw new Error("Failed to load assumptions");
        if (!activitiesRes.ok) throw new Error("Failed to load activities");
        if (!stakeholdersRes.ok) throw new Error("Failed to load stakeholders");
        if (!sdgsRes.ok) throw new Error("Failed to load SDGs");
        if (!targetsRes.ok) throw new Error("Failed to load SDG targets");
        if (!matrixTargetsRes.ok) throw new Error("Failed to load matrix targets");
        if (!matrixRes.ok) throw new Error("Failed to load matrix entries");
        if (!nodesRes.ok) throw new Error("Failed to load diagram nodes");
        if (!edgesRes.ok) throw new Error("Failed to load diagram edges");

        const impactData = await impactRes.json();
        const risksData = await risksRes.json();
        const assumptionsData = await assumptionsRes.json();
        const activitiesData = await activitiesRes.json();
        const stakeholdersData = await stakeholdersRes.json();
        const sdgsData = await sdgsRes.json();
        const targetsData = await targetsRes.json();
        const matrixTargetsData = await matrixTargetsRes.json();
        const matrixData: MatrixEntry[] = await matrixRes.json();
        const nodesData = await nodesRes.json();
        const edgesData = await edgesRes.json();

        const matrixMap: Record<string, MatrixEntry> = {};
        matrixData.forEach((entry) => {
          matrixMap[`${entry.sourceSdgTargetId}_${entry.targetSdgTargetId}`] = entry;
        });

        setImpactRows(impactData);
        setRisks(risksData);
        setAssumptions(assumptionsData);
        setActivities(activitiesData);
        setStakeholders(stakeholdersData);
        setAllSDGs(sdgsData);
        setAllTargets(Array.isArray(targetsData) ? targetsData : targetsData.targets || []);
        setMatrixTargets(matrixTargetsData);
        setMatrixEntries(matrixMap);
        setSavedNodes(nodesData);
        setSavedEdges(edgesData);
        setReady(true);
      } catch (err: any) {
        setError(err.message || "Export failed");
        window.parent?.postMessage({ type: "export-zip-error" }, "*");
      }
    };

    run();
  }, [router.isReady, projectIdStr, API_BASE]);

  const diagramNodes: Node[] = useMemo(() => {
    const nodeList: Node[] = [];
    const nodePositionMap = new Map(
      savedNodes.map((n) => [n.nodeId, { x: n.x, y: n.y }])
    );

    const verticalSpacing = 220;
    const horizontalSpacing = 260;
    const baseX = 300;

    const impactGroups: Record<string, ImpactRow[]> = {};
    impactRows.forEach((row) => {
      if (!impactGroups[row.hierarchyLevel]) impactGroups[row.hierarchyLevel] = [];
      impactGroups[row.hierarchyLevel].push(row);
    });

    const hierarchyOrder = [
      "LONG_TERM_IMPACT",
      "MID_TERM_IMPACT",
      "SHORT_TERM_IMPACT",
      "OUTPUT",
    ];

    const hierarchyYMap: Record<string, number> = {};
    hierarchyOrder.forEach((level, idx) => {
      hierarchyYMap[level] = idx * verticalSpacing;
    });

    for (const level of hierarchyOrder) {
      const group = impactGroups[level] || [];
      group.sort((a, b) => a.orderIndex - b.orderIndex);

      group.forEach((row, i) => {
        const position =
          nodePositionMap.get(row.id) ?? {
            x: baseX + i * horizontalSpacing,
            y: hierarchyYMap[level],
          };

        let style: React.CSSProperties = {
          padding: "8px 12px",
          fontSize: "16px",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "center",
          minWidth: "120px",
          maxWidth: "300px",
        };

        if (level === "LONG_TERM_IMPACT") {
          style = { ...style, backgroundColor: "#a5c9ec", borderColor: "#003366" };
        } else if (level === "MID_TERM_IMPACT") {
          style = { ...style, backgroundColor: "#deafff", borderColor: "#663399" };
        } else if (level === "SHORT_TERM_IMPACT") {
          style = { ...style, backgroundColor: "#e07d7d", borderColor: "#a4494e" };
        } else if (level === "OUTPUT") {
          style = { ...style, backgroundColor: "#fbe1c8", borderColor: "#cc6600" };
        }

        nodeList.push({
          id: row.id,
          type: "default",
          data: { label: row.resultStatement },
          position,
          style,
        });
      });
    }

    const risksByHierarchy: Record<string, string[]> = {};
    risks.forEach((risk) => {
      (risk.hierarchies || []).forEach((h) => {
        if (!risksByHierarchy[h.hierarchy]) risksByHierarchy[h.hierarchy] = [];
        risksByHierarchy[h.hierarchy].push(risk.text);
      });
    });

    Object.entries(risksByHierarchy).forEach(([hierarchy, riskList]) => {
      const nodeId = `risk-${hierarchy}`;
      const width = Math.max(320, riskList.length * 170);
      const position =
        nodePositionMap.get(nodeId) ?? {
          x: baseX - width - 60,
          y: hierarchy === "OUTPUT" ? 660 : hierarchy === "SHORT_TERM_IMPACT" ? 440 : hierarchy === "MID_TERM_IMPACT" ? 220 : 0,
        };

      nodeList.push({
        id: nodeId,
        type: "default",
        data: { label: riskList.map((r, i) => `${i + 1}. ${r}`).join("\n\n") },
        position,
        style: {
          backgroundColor: "#f8d7da",
          borderColor: "#721c24",
          color: "#721c24",
          padding: "10px",
          fontSize: "16px",
          whiteSpace: "pre-wrap",
          textAlign: "left",
          minWidth: `${width}px`,
          maxWidth: `${width}px`,
        },
      });
    });

    const outputY = 660 + 200;
    activities.forEach((activity, i) => {
      const nodeId = `activity-${activity.id}`;
      const position =
        nodePositionMap.get(nodeId) ?? {
          x: baseX + i * horizontalSpacing,
          y: outputY,
        };

      nodeList.push({
        id: nodeId,
        type: "default",
        data: { label: activity.text },
        position,
        style: {
          backgroundColor: "#468c4c",
          borderColor: "#156e21",
          color: "#0a5821",
          padding: "8px 12px",
          fontSize: "16px",
          whiteSpace: "pre-wrap",
          textAlign: "center",
          maxWidth: "300px",
          minWidth: "120px",
        },
      });
    });

    if (assumptions.length > 0) {
      const nodeId = "assumptions-box";
      const position =
        nodePositionMap.get(nodeId) ?? {
          x: baseX,
          y: 4 * 220 + 180,
        };

      nodeList.push({
        id: nodeId,
        type: "default",
        data: { label: assumptions.map((a, i) => `${i + 1}. ${a.text}`).join("\n") },
        position,
        style: {
          backgroundColor: "#d4edda",
          border: "1px solid #155724",
          color: "#155724",
          padding: "12px 16px",
          fontSize: "16px",
          whiteSpace: "pre-wrap",
          textAlign: "left",
        },
      });
    }

    const stakeholdersByHierarchy: Record<string, Stakeholder[]> = {};
    stakeholders.forEach((s) => {
      if (!stakeholdersByHierarchy[s.hierarchyLevel]) {
        stakeholdersByHierarchy[s.hierarchyLevel] = [];
      }
      stakeholdersByHierarchy[s.hierarchyLevel].push(s);
    });

    const yMap: Record<string, number> = {
      LONG_TERM_IMPACT: 0,
      MID_TERM_IMPACT: 220,
      SHORT_TERM_IMPACT: 440,
      OUTPUT: 660,
    };

    for (const level of Object.keys(yMap)) {
      const group = stakeholdersByHierarchy[level] || [];
      group.forEach((s, i) => {
        const nodeId = `stakeholder-${s.id}`;
        const position =
          nodePositionMap.get(nodeId) ?? {
            x: baseX + 1400 + i * 250,
            y: yMap[level],
          };

        nodeList.push({
          id: nodeId,
          type: "default",
          data: { label: `Stakeholder:\n${s.name}` },
          position,
          style: {
            backgroundColor: "#d4edda",
            borderColor: "#14532d",
            borderStyle: s.stakeholderType === "DIRECT" ? "solid" : "dashed",
            borderWidth: 2,
            color: "#14532d",
            padding: "8px 12px",
            fontSize: "16px",
            whiteSpace: "pre-wrap",
            textAlign: "center",
            maxWidth: "300px",
            minWidth: "120px",
          },
        });
      });
    }

    return nodeList;
  }, [impactRows, risks, activities, assumptions, stakeholders, savedNodes]);

  const diagramEdges: Edge[] = useMemo(
    () =>
      savedEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        sourceHandle: "top",
        targetHandle: "bottom",
        style: { stroke: "#222", strokeWidth: 2 },
        markerStart: {
          type: MarkerType.ArrowClosed,
          color: "#222",
          width: 18,
          height: 18,
        },
      })),
    [savedEdges]
  );

  const rowSums = useMemo(
    () =>
      matrixTargets.map((source) =>
        matrixTargets.reduce(
          (sum, target) =>
            sum + (matrixEntries[`${source.id}_${target.id}`]?.score ?? 0),
          0
        )
      ),
    [matrixTargets, matrixEntries]
  );

  const colSums = useMemo(
    () =>
      matrixTargets.map((target) =>
        matrixTargets.reduce(
          (sum, source) =>
            sum + (matrixEntries[`${source.id}_${target.id}`]?.score ?? 0),
          0
        )
      ),
    [matrixTargets, matrixEntries]
  );

  useEffect(() => {
    if (!ready || startedRef.current) return;
    if (!diagramRef.current || !matrixRef.current) return;

    startedRef.current = true;

    const doExport = async () => {
      try {
        const workbook = XLSX.utils.book_new();

        const impactSheetData = impactRows.map((row) => ({
          ObjectiveLevel: row.hierarchyLevel,
          ResultStatement: row.resultStatement,
          Indicator: row.indicator,
          IndicatorDefinition: row.indicatorDefinition,
          MeansOfMeasurement: row.meansOfMeasurement,
          Baseline: row.baseline,
          SDG: (() => {
            const sdgId = row.targets?.[0]?.sdg?.id;
            const sdg = allSDGs.find((s) => s.id === sdgId);
            return sdg ? `${sdg.code} ${sdg.name}` : "";
          })(),
          SDGTargets: (row.targets || [])
            .map((t) => {
              const target = allTargets.find((x) => x.id === t.sdgTargetId);
              return target ? `${target.code} ${target.title}` : t.sdgTargetId;
            })
            .join("; "),
        }));

        const risksSheetData = risks.map((r) => ({
          Risk: r.text,
          ObjectiveLevels: (r.hierarchies || []).map((h) => h.hierarchy).join(", "),
        }));

        const aaSheetData = [
          ...assumptions.map((a) => ({ Type: "ASSUMPTION", Description: a.text })),
          ...activities.map((a) => ({ Type: "ACTIVITY", Description: a.text })),
        ];

        const stakeholdersSheetData = stakeholders.map((s) => ({
          Name: s.name,
          Role: s.role,
          Interest: s.interest,
          StakeholderType: s.stakeholderType,
          EngagementStrategy: s.engagementStrategy,
          ObjectiveLevel: s.hierarchyLevel,
        }));

        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.json_to_sheet(impactSheetData),
          "Impact Rows"
        );
        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.json_to_sheet(risksSheetData),
          "Risks"
        );
        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.json_to_sheet(aaSheetData),
          "Assumptions & Activities"
        );
        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.json_to_sheet(stakeholdersSheetData),
          "Stakeholders"
        );

        const excelArray = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        await new Promise((r) => setTimeout(r, 300));

        const diagramCanvas = await html2canvas(diagramRef.current!, {
          backgroundColor: "#ffffff",
          useCORS: true,
          scale: 2,
        });

        const matrixCanvas = await html2canvas(matrixRef.current!, {
          backgroundColor: "#ffffff",
          useCORS: true,
          scale: 2,
        });

        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        const addCanvasPage = (canvas: HTMLCanvasElement, isFirst = false) => {
          if (!isFirst) pdf.addPage("a4", "landscape");

          const imgData = canvas.toDataURL("image/png");
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
          const imgWidth = canvas.width * ratio;
          const imgHeight = canvas.height * ratio;
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;

          pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
        };

        addCanvasPage(diagramCanvas, true);
        addCanvasPage(matrixCanvas, false);

        const pdfArrayBuffer = pdf.output("arraybuffer");

        const zip = new JSZip();
        zip.file("OQI_Impact_Workbook.xlsx", excelArray);
        zip.file("OQI_Impact_Report.pdf", pdfArrayBuffer);

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `OQI_Project_${projectIdStr}.zip`);

        window.parent?.postMessage({ type: "export-zip-done" }, "*");
      } catch (err: any) {
        setError(err.message || "Failed to export ZIP");
        window.parent?.postMessage({ type: "export-zip-error" }, "*");
      }
    };

    doExport();
  }, [
    ready,
    impactRows,
    risks,
    assumptions,
    activities,
    stakeholders,
    allSDGs,
    allTargets,
    matrixTargets,
    matrixEntries,
    diagramNodes,
    diagramEdges,
    rowSums,
    colSums,
    projectIdStr,
  ]);

  return (
    <>
      {error ? <div style={{ display: "none" }}>{error}</div> : null}

      <div
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: "2400px",
          background: "#fff",
          zIndex: -1,
        }}
      >
        <div
          ref={diagramRef}
          style={{
            width: "2200px",
            height: "1200px",
            background: "#fff",
          }}
        >
          <ReactFlow
            nodes={diagramNodes}
            edges={diagramEdges}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background />
          </ReactFlow>
        </div>

<div
  ref={matrixRef}
  style={{
    marginTop: 40,
    background: "#fff",
    padding: 20,
    display: "inline-block"
  }}
>
          <table style={{ borderCollapse: "collapse", fontSize: 20 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: 10 }}>
                  Influencing Targets
                </th>
                {matrixTargets.map((target) => (
                  <th
                    key={target.id}
                    style={{ border: "1px solid #ccc", padding: 10 }}
                  >
                    {target.code}
                  </th>
                ))}
                <th style={{ border: "1px solid #ccc", padding: 10 }}>Outsum</th>
              </tr>
            </thead>
            <tbody>
              {matrixTargets.map((source, rowIndex) => (
                <tr key={source.id}>
                  <td style={{ border: "1px solid #ccc", padding: 10 }}>
                    {source.code}
                  </td>
                  {matrixTargets.map((target) => {
                    const entry = matrixEntries[`${source.id}_${target.id}`];
                    const score = entry?.score ?? null;
                    const isDiagonal = source.id === target.id;

                    return (
                      <td
                        key={target.id}
                        style={{
                          border: "1px solid #ccc",
                          padding: 6,
                          textAlign: "center",
                          backgroundColor: isDiagonal
                            ? "#F5F5F5"
                            : score === null
                            ? "#FFFFFF"
                            : scoreColors[score],
                          minWidth: 60,
                        }}
                      >
                        {isDiagonal ? "" : score ?? ""}
                      </td>
                    );
                  })}
                  <td style={{ border: "1px solid #ccc", padding: 10 }}>
                    {rowSums[rowIndex]}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ border: "1px solid #ccc", padding: 10 }}>Insum</td>
                {colSums.map((sum, i) => (
                  <td
                    key={i}
                    style={{ border: "1px solid #ccc", padding: 10 }}
                  >
                    {sum}
                  </td>
                ))}
                <td style={{ border: "1px solid #ccc", padding: 10 }} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}