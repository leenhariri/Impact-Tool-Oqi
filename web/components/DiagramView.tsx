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

type ImpactRow = {
  id: string;
  hierarchyLevel: string;
  resultStatement: string;
  orderIndex: number;
};

type Risk = {
  id: string;
  hierarchyLevel: string;
  text: string;
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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          impactRes,
          riskRes,
          activityRes,
          assumptionRes,
          nodePosRes,
          edgeRes,
        ] = await Promise.all([
          fetch(`http://localhost:4000/impact-rows/${projectId}`),
          fetch(`http://localhost:4000/risks/project/${projectId}`),
          fetch(`http://localhost:4000/activities/project/${projectId}`),
          fetch(`http://localhost:4000/assumptions/project/${projectId}`),
          fetch(`http://localhost:4000/diagram-nodes/${projectId}`),
          fetch(`http://localhost:4000/diagram-edges/${projectId}`),
        ]);

        const impactRows: ImpactRow[] = await impactRes.json();
        const risks: Risk[] = await riskRes.json();
        const activities: Activity[] = await activityRes.json();
        const assumptions: Assumption[] = await assumptionRes.json();
        const savedNodes = await nodePosRes.json();
        const savedEdges = await edgeRes.json();

        const nodeList: Node[] = [];
        const nodePositionMap = new Map(
          savedNodes.map((n: any) => [n.nodeId, { x: n.x, y: n.y }])
        );

        const verticalSpacing = 90;
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
let style = {};
if (level === "LONG_TERM_IMPACT") {
  style = { backgroundColor: "#a5c9ec", borderColor: "#003366" };
} else if (level === "MID_TERM_IMPACT") {
  style = { backgroundColor: "#deafff", borderColor: "#663399" };
} else if (level === "SHORT_TERM_IMPACT") {
  style = { backgroundColor: "#f5d6ff", borderColor: "#cc66cc" };
} else if (level === "OUTPUT") {
  style = { backgroundColor: "#fbe1c8", borderColor: "#cc6600" };
}

            nodeList.push({
              id: nodeId,
              type: "default",
              data: {
                label: `${level.replace(/_/g, " ")}: ${row.resultStatement}`,
              },
              position,
              style
            });
          });
        }

        // Risks
        risks.forEach((risk, i) => {
          const nodeId = `risk-${risk.id}`;
          const position = (nodePositionMap.get(nodeId) ?? {
            x: baseX - 350,
            y: hierarchyYMap[risk.hierarchyLevel] ?? i * verticalSpacing,
          }) as { x: number; y: number };

          nodeList.push({
            id: nodeId,
            type: "default",
            data: { label: `Risk: ${risk.text}` },
            position,
            style: {
              backgroundColor: "#f8d7da",
              borderColor: "#721c24",
              color: "#721c24",
            },
          });
        });
        // Group risks by hierarchyLevel
// const risksByHierarchy: Record<string, string[]> = {};
// risks.forEach((risk) => {
//   const level = risk.hierarchyLevel;
//   if (!risksByHierarchy[level]) risksByHierarchy[level] = [];
//   risksByHierarchy[level].push(risk.text);
// });

// Create nodes for risks
// Object.entries(risksByHierarchy).forEach(([level, riskTexts], i) => {
//   riskTexts.forEach((text, j) => {
//     const nodeId = `risk-${level}-${j}`;
//           const position = (nodePositionMap.get(nodeId) ?? {
//             x: baseX,
//             y: hierarchyOrder.length * verticalSpacing + 120 + i * 80,
//           }) as { x: number; y: number };

//     nodeList.push({
//       id: nodeId,
//       type: "default",
//       data: { label: `Risk: ${text}` },
//       position, // ✅ XYPosition: { x: number, y: number }
//       style: {
//         backgroundColor: "#f8d7da", // soft red like your mockup
//         borderColor: "#a94442",
//         color: "#a94442",
//         fontWeight: "bold",
//         borderRadius: "6px",
//         padding: "4px 8px",
//         fontSize: "13px",
//         width: 140,
//         textAlign: "center",
//       },
//     });
//   });
// });

// Group risks by hierarchyLevel


        // Activities
        const outputY = hierarchyYMap["OUTPUT"] + 120;
        activities.forEach((activity, i) => {
          const nodeId = `activity-${activity.id}`;
          const position = (nodePositionMap.get(nodeId) ?? {
            x: baseX + i * horizontalSpacing,
            y: outputY,
          }) as { x: number; y: number };

          nodeList.push({
            id: nodeId,
            type: "default",
            data: { label: `Activity: ${activity.text}` },
            position,
            style: {
              backgroundColor: "#fff3cd",
              borderColor: "#856404",
              color: "#856404",
            },
          });
        });

        // Assumptions
        assumptions.forEach((assumption, i) => {
          const nodeId = `assumption-${assumption.id}`;
          const position = (nodePositionMap.get(nodeId) ?? {
            x: baseX,
            y: hierarchyOrder.length * verticalSpacing + 120 + i * 80,
          }) as { x: number; y: number };

          nodeList.push({
            id: nodeId,
            type: "default",
            data: { label: `Assumption: ${assumption.text}` },
            position,
            style: {
              backgroundColor: "#d4edda",
              borderColor: "#155724",
              color: "#155724",
            },
          });
        });

        const edgeList: Edge[] = savedEdges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: "default",

          style: { stroke: "#222", strokeWidth: 2 },
        }));

        setNodes(nodeList);
        setEdges(edgeList);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch diagram data", err);
      }
    };

    fetchAllData();
  }, [projectId]);

  const handleNodesChange: OnNodesChange = (changes) => {
    onNodesChange(changes);
    const updated = extractDiagramNodeData(nodes);
    fetch("http://localhost:4000/diagram-nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, nodes: updated }),
    });
  };
const handleEdgesChange = (changes: any) => {
  const updatedEdges = applyEdgeChanges(changes, edges);
  setEdges(updatedEdges);

  // Save updated edges to backend
  fetch("http://localhost:4000/diagram-edges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, edges: updatedEdges }),
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
      });
    },
    [edges, projectId]
  );

  if (loading) return <p>Loading diagram...</p>;

return (
   <ReactFlowProvider>
  <div
    style={{
      padding: "1rem",
      height: "90vh",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Instructions Box */}
    <div style={{ fontWeight: "bold", marginBottom: "1rem" }}>
      <h3
        style={{
          background: "#dcdcdc",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        Instructions
      </h3>
      <ol style={{ marginLeft: "1rem" }}>
        <li>Insert arrows between diagram boxes.</li>
        <li>To clear a single arrow, click on it then delete.</li>
        <li>Save your work once done.</li>
        <li>Option to export as PDF.</li>
      </ol>
    </div>

    {/* Main diagram area */}
    <div
      style={{
        flex: 1,
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
      }}
    >
      {/* Export-only diagram ref wrapper */}
      <div
        ref={diagramOnlyRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      >
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
        >
          <Background />
        </ReactFlow>
      </div>

      {/* UI controls (not included in PDF) */}
      <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}>
        <Controls />
        <MiniMap />
      </div>
    </div>

    {/* Buttons */}
    <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
      <button
        onClick={resetNodePositions}
        style={{
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "8px 12px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        🔄 Reset Positions
      </button>

      <button
        onClick={exportAsPDF}
        style={{
          backgroundColor: "#e0f7fa",
          border: "1px solid #00acc1",
          borderRadius: "5px",
          padding: "8px 12px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        📄 Export as PDF
      </button>
    </div>
  </div>
  </ReactFlowProvider>
);
}