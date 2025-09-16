import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  MarkerType,
  OnNodesChange,
} from "reactflow";
import "reactflow/dist/style.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { ReactFlowProvider } from "reactflow";
import { applyEdgeChanges } from "reactflow";
import styles from "../styles/diagram.module.css"; 
import Legend from "../components/Legend";
type ImpactRow = {
  id: string;
  hierarchyLevel: string;
  resultStatement: string;
  orderIndex: number;
};

// type Risk = {
//   id: string;
//   hierarchyLevel: string;
//   text: string;
// };
type Risk = {
  id: string;
  text: string;
  hierarchies: { hierarchy: string }[]; // ✅ ADD THIS
};


type Activity = {
  id: string;
  hierarchyLevel: string;
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


export default function DiagramView({ projectId }: { projectId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
const resetNodePositions = () => {
  const verticalSpacing = 110;
  const horizontalSpacing = 260;
  const baseX = 300;


  const levelToY: Record<string, number> = {};
  const hierarchyOrder = [
    "LONG_TERM_IMPACT",
    "MID_TERM_IMPACT",
    "SHORT_TERM_IMPACT",
    "OUTPUT",
    "ACTIVITY",
    "ASSUMPTION",
  ];

  hierarchyOrder.forEach((level, i) => {
    levelToY[level] = i * verticalSpacing;
  });

  const newNodes = nodes.map((node, index) => {
    const label: string = node.data?.label || "";
    const rawLevel = label.split(":")[0].trim().toUpperCase().replace(/ /g, "_");
    const level = rawLevel === "RISK" ? node.data?.hierarchyLevel : rawLevel;

    const y = levelToY[level] ?? 0;

    const isRisk = rawLevel === "RISK";
    const x = isRisk ? baseX - horizontalSpacing : baseX;

    return {
      ...node,
      position: { x, y },
    };
  });

  setNodes(newNodes);
};
const reactFlowWrapper = useRef<HTMLDivElement>(null);
const diagramOnlyRef = useRef<HTMLDivElement>(null);

const exportAsPDF = async () => {
  if (!diagramOnlyRef.current) return;

  const element = diagramOnlyRef.current;

  // Temporarily resize to capture full content
  const scrollWidth = element.scrollWidth;
  const scrollHeight = element.scrollHeight;

  const originalStyle = element.getAttribute("style") || "";
  element.style.width = `${scrollWidth}px`;
  element.style.height = `${scrollHeight}px`;

  await new Promise((r) => setTimeout(r, 100));

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    useCORS: true,
    width: scrollWidth,
    height: scrollHeight,
    scale: 2,
  });

  element.setAttribute("style", originalStyle);

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const imgWidth = canvas.width * ratio;
  const imgHeight = canvas.height * ratio;
  const x = (pageWidth - imgWidth) / 2;
  const y = (pageHeight - imgHeight) / 2;

  pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
  pdf.save("diagram.pdf");
};




  const extractDiagramNodeData = (nodes: Node[]): any[] =>
    nodes.map((node) => ({
      id: node.id,
      nodeId: node.id,
      x: node.position.x,
      y: node.position.y,
    }));
const [error, setError] = useState<string>(''); // ✅ Error state
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  useEffect(() => {
    if (!projectId || typeof projectId !== 'string') {
  setError('Invalid or missing project ID.');
  return;
}
const controller = new AbortController();

    const fetchAllData = async () => {
      try {
        const [
          impactRes,
          riskRes,
          activityRes,
          assumptionRes,
          nodePosRes,
          edgeRes,
          stakeholderRes,
        ] = await Promise.all([
 fetch(`http://localhost:4000/impact-rows/${projectId}`, { signal: controller.signal ,credentials: 'include'}),
        fetch(`http://localhost:4000/risks/project/${projectId}`, { signal: controller.signal ,credentials: 'include',}),
        fetch(`http://localhost:4000/activities/project/${projectId}`, { signal: controller.signal,credentials: 'include' }),
        fetch(`http://localhost:4000/assumptions/project/${projectId}`, { signal: controller.signal ,credentials: 'include',}),
        fetch(`http://localhost:4000/diagram-nodes/${projectId}`, { signal: controller.signal,credentials: 'include', }),
        fetch(`http://localhost:4000/diagram-edges/${projectId}`, { signal: controller.signal,credentials: 'include', }),
        fetch(`http://localhost:4000/stakeholders/${projectId}`, { signal: controller.signal ,credentials: 'include',}),
          
        ]);

        const impactRows: ImpactRow[] = await impactRes.json();
        const risks: Risk[] = await riskRes.json();
        const activities: Activity[] = await activityRes.json();
        const assumptions: Assumption[] = await assumptionRes.json();
        const savedNodes = await nodePosRes.json();
        const savedEdges = await edgeRes.json();
const stakeholders: Stakeholder[] = await stakeholderRes.json();
        const nodeList: Node[] = [];
        const nodePositionMap = new Map(
          savedNodes.map((n: any) => [n.nodeId, { x: n.x, y: n.y }])
        );

        const verticalSpacing = 150;
        const horizontalSpacing = 260;
        const baseX = 300;

        const impactGroups: Record<string, ImpactRow[]> = {};
        impactRows.forEach((row) => {
          if (!impactGroups[row.hierarchyLevel]) {
            impactGroups[row.hierarchyLevel] = [];
          }
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

        // Impact Rows
        for (const level of hierarchyOrder) {
          const group = impactGroups[level] || [];
          group.sort((a, b) => a.orderIndex - b.orderIndex);

          group.forEach((row, i) => {
            const nodeId = row.id;
            const position = (nodePositionMap.get(nodeId) ?? {
              x: baseX + i * horizontalSpacing,
              y: hierarchyYMap[level],
            }) as { x: number; y: number };
// let style = {};
let style: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: "13px",
  fontWeight: "normal",
  whiteSpace: "pre-wrap",
  overflowWrap: "break-word",
  display: "inline-block",
  textAlign: "center",
  minWidth: "120px",
  maxWidth: "300px",
};


if (level === "LONG_TERM_IMPACT") {
  style = { ...style, backgroundColor: "#a5c9ec", borderColor: "#003366" };
} else if (level === "MID_TERM_IMPACT") {
  style = { ...style, backgroundColor: "#deafff", borderColor: "#663399" };
} else if (level === "SHORT_TERM_IMPACT") {
  style = { ...style, backgroundColor: "#e07d7dff", borderColor: "#a4494eff" };
} else if (level === "OUTPUT") {
  style = { ...style, backgroundColor: "#fbe1c8", borderColor: "#cc6600" };
}


            nodeList.push({
              id: nodeId,
              type: "default",
              data: {
                label: ` ${row.resultStatement}`,
                // ${level.replace(/_/g, " ")}:
              },
              position,
              style
            });
          });
        }



const risksByHierarchy: Record<string, string[]> = {};
risks.forEach((risk) => {
  (risk.hierarchies ?? []).forEach((h) => {
    if (!risksByHierarchy[h.hierarchy]) {
      risksByHierarchy[h.hierarchy] = [];
    }
    risksByHierarchy[h.hierarchy].push(risk.text);
  });
});

// 📦 Render vertically stacked red risk boxes (one per hierarchy, positioned top to bottom)
const riskBoxBaseX = baseX - 350;
let accumulatedY = 0;
const verticalPadding = 30;
const baseRiskY = -50; // top margin

Object.entries(risksByHierarchy).forEach(([hierarchy, riskList]) => {
  const nodeId = `risk-${hierarchy}`;
  const y = hierarchyYMap[hierarchy] ?? 0;

  const width = Math.max(320, riskList.length * 170); // dynamically set width
  const riskBoxOffset = 60;

  const position = (nodePositionMap.get(nodeId) ?? {
    x: baseX - width - riskBoxOffset, // ✅ shift left of impact row
    y,
  }) as { x: number; y: number };

  const combinedText = (
    <div style={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "stretch",
      gap: "12px",
      flexWrap: "nowrap",
      whiteSpace: "normal",
    }}>
      {riskList.map((risk, i) => (
        <div key={i} style={{
          backgroundColor: "#f8d7da",
          border: "1px solid #721c24",
          color: "#721c24",
          padding: "6px 8px",
          borderRadius: "6px",
          fontSize: "12px",
          minWidth: "140px",
          maxWidth: "180px",
          whiteSpace: "normal",
          wordBreak: "break-word",
          display: "inline-block",
          textAlign: "left",
        }}>
          <b>{i + 1}.</b> {risk}
        </div>
      ))}
    </div>
  );

  nodeList.push({
    id: nodeId,
    type: "default",
    data: { label: combinedText, hierarchyLevel: hierarchy },
    position,
    style: {
      backgroundColor: "#f8d7da",
      borderColor: "#721c24",
      color: "#721c24",
      padding: "10px",
      fontSize: "13px",
      whiteSpace: "normal",
      textAlign: "left",
      display: "inline-block",
      minWidth: `${width}px`,
      maxWidth: `${width}px`,
    },
  });
});








        // Activities
        const outputY = hierarchyYMap["OUTPUT"] + 200;
        activities.forEach((activity, i) => {
          const nodeId = `activity-${activity.id}`;
          const position = (nodePositionMap.get(nodeId) ?? {
            x: baseX + i * horizontalSpacing,
            y: outputY,
          }) as { x: number; y: number };

          nodeList.push({
            id: nodeId,
            type: "default",
            data: { label: ` ${activity.text}` },
            // Activity:
            position,
            style: {
              backgroundColor: "#468c4cff",
              borderColor: "#156e21ff",
              color: "#0a5821ff",
              padding: "8px 12px",
  fontSize: "13px",
  fontWeight: "normal",
  whiteSpace: "pre-wrap",         // ✅ allows wrapping mid-word and expands width
  overflowWrap: "break-word",     // ✅ break long words
  textAlign: "center",
  display: "inline-block",        // ✅ keeps width flexible
  maxWidth: "300px",              // ✅ optional: prevents super long lines
  minWidth: "120px",              // ✅ optional: good minimum size
            },
          });
        });

        // Assumptions
        if (assumptions.length > 0) {
  const nodeId = "assumptions-box";

  const position = (nodePositionMap.get(nodeId) ?? {
    x: baseX,
    y: hierarchyOrder.length * verticalSpacing + 180,
  }) as { x: number; y: number };

  const combinedText = (
    <div
      style={{
        fontFamily: "Segoe UI, sans-serif",
        fontSize: "14px",
        lineHeight: 1.6,
      }}
    >
      {assumptions.map((assumption, i) => (
        <div key={i} style={{ marginBottom: "6px" }}>
          <b>{i + 1}.</b> {assumption.text}
        </div>
      ))}
    </div>
  );

  nodeList.push({
    id: nodeId,
    type: "default",
    data: { label: combinedText },
    position,
    style: {
      backgroundColor: "#d4edda",
      border: "1px solid #155724",
      color: "#155724",
      padding: "12px 16px",
      fontSize: "14px",
      whiteSpace: "normal",
      overflowWrap: "break-word",
      textAlign: "left",
      display: "inline-block",
      width: "auto",
      maxWidth: "100%",
    },
  });
}



        const edgeList: Edge[] = savedEdges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: "default",

          style: { stroke: "#222", strokeWidth: 2 },
        }));
// Stakeholders (Right of each hierarchy block)
// Group stakeholders by hierarchyLevel
const stakeholdersByHierarchy: Record<string, Stakeholder[]> = {};
stakeholders.forEach((s) => {
  if (!stakeholdersByHierarchy[s.hierarchyLevel]) {
    stakeholdersByHierarchy[s.hierarchyLevel] = [];
  }
  stakeholdersByHierarchy[s.hierarchyLevel].push(s);
});

// 1. Find max X of existing nodes
const maxX = Math.max(...nodeList.map((n) => n.position.x)) || baseX;

// 2. Render stakeholders horizontally to the right of impact rows
for (const level of hierarchyOrder) {
  const group = stakeholdersByHierarchy[level] || [];

  group.forEach((s, i) => {
    const nodeId = `stakeholder-${s.id}`;
    
    const position = (nodePositionMap.get(nodeId) ?? {
x: baseX + 800 + i * 200, // Push them further right, with even spacing
y: hierarchyYMap[level],

    }) as { x: number; y: number };

    // Determine border style based on stakeholderType
    const isDirect = s.stakeholderType === "DIRECT";
    const borderStyle = isDirect ? "solid" : "dotted";

    nodeList.push({
      id: nodeId,
      type: "default",
      data: {
        label: `Stakeholder:\n${s.name}`,
      },
      position,
style: {
  backgroundColor: "#d4edda",
  borderColor: "#14532d",
  borderStyle: isDirect ? "solid" : "dashed", // ✅ easier to see
  borderWidth: 2,                             // ✅ thicker
  color: "#14532d",
  padding: "8px 12px",
  fontSize: "13px",
  fontWeight: "normal",
  whiteSpace: "pre-wrap",
  overflowWrap: "break-word",
  textAlign: "center",
  display: "inline-block",
  maxWidth: "300px",
  minWidth: "120px",
}
,
    });

    // ❌ Skip adding edge since you said "no arrows generated"
  });
}


        setNodes(nodeList);
        setEdges(edgeList);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch diagram data", err);
      }
    };

    fetchAllData();
  //     return () => {
  //   if (controller) controller.abort();
  // };
  }, [projectId]);

const handleNodesChange: OnNodesChange = (changes) => {
  onNodesChange(changes); // update state only
};

useEffect(() => {
  if (!projectId || nodes.length === 0) return;

  const timeout = setTimeout(() => {
    const updated = extractDiagramNodeData(nodes);
    fetch("http://localhost:4000/diagram-nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, nodes: updated }),
      credentials:'include'
    });
  }, 300);

  return () => clearTimeout(timeout);
}, [nodes, projectId]);

const handleEdgesChange = (changes: any) => {
  const updatedEdges = applyEdgeChanges(changes, edges);
  setEdges(updatedEdges);

  // Save updated edges to backend
  fetch("http://localhost:4000/diagram-edges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, edges: updatedEdges }),
    credentials:'include'
  });
};


  const onConnect = useCallback(
    (params: any) => {
      const newEdge: Edge = {
        ...params,
        id: `${params.source}-${params.target}`,
        type: "default",

        style: { stroke: "#222", strokeWidth: 2 },
      };

      const updatedEdges = [...edges, newEdge];
      setEdges(updatedEdges);

      fetch("http://localhost:4000/diagram-edges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, edges: updatedEdges }),
        credentials:'include'
      });
    },
    [edges, projectId]
  );

  if (loading) return <p>Loading diagram...</p>;

return (
  <ReactFlowProvider>
    <div className={styles.container}>
      {/* Instructions */}
      <div className={styles.instructions}>
        <h2 className="font-bold text-lg mb-2">Instructions</h2>
        <ol className="list-decimal list-inside text-sm">
          <li>Insert arrows between diagram boxes.</li>
          <li>To clear a single arrow, click on it then delete.</li>
          <li>Boxes are movable, you may drag them to rearrange the layout for better visibility.</li>
          <li>Option to export as PDF.</li>
        </ol>
      </div>

<div className={styles.diagramArea}>
        <div ref={diagramOnlyRef} className={styles.reactFlowWrapper}>
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={handleNodesChange}
  onEdgesChange={handleEdgesChange}
  onConnect={onConnect}
  fitView
  fitViewOptions={{ padding: 0.2 }}
  panOnScroll
  zoomOnScroll
  minZoom={0.05}
  maxZoom={2}
>
  <Background />
  <Controls />       
  {/* <MiniMap />         */}
</ReactFlow>

           <Legend/>
        </div>

        <div className={styles.controlsWrapper}>
          {/* <Controls /> */}
          {/* <MiniMap /> */}
        </div>
      </div>

      {/* Buttons Row */}
      <div className={styles.bottomButtonRow}>
        <div className={styles.leftButtons}>
          <button onClick={exportAsPDF} className={styles.buttonPrimary}>
            Export as PDF
          </button>
        </div>
        <div className={styles.rightButtons}>
          {/* <button onClick={resetNodePositions} className={styles.buttonPrimary}>
             Reset Positions
          </button> */}
          <button
            onClick={() => window.location.href = `/project/${projectId}`}
            className={styles.buttonPrimary}
          >
            Edit Table
          </button>
          <button
            onClick={() => window.location.href = `/project/${projectId}/matrix`}
            className={styles.buttonPrimary}
          >
            Edit Matrix
          </button>
        </div>
      </div>
      {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

    </div>
  </ReactFlowProvider>
);
}