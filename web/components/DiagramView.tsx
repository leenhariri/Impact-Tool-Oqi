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
} from "reactflow";
import "reactflow/dist/style.css";
import { Handle, Position } from 'reactflow';


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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [impactRes, riskRes, activityRes, assumptionRes] = await Promise.all([
          fetch(`http://localhost:4000/impact-rows/${projectId}`),
          fetch(`http://localhost:4000/risks/project/${projectId}`),
          fetch(`http://localhost:4000/activities/project/${projectId}`),
          fetch(`http://localhost:4000/assumptions/project/${projectId}`),
        ]);

        const impactRows: ImpactRow[] = await impactRes.json();
        const risks: Risk[] = await riskRes.json();
        const activities: Activity[] = await activityRes.json();
        const assumptions: Assumption[] = await assumptionRes.json();

        const nodeList: Node[] = [];

        const verticalSpacing = 90;
        const horizontalSpacing = 260;
        const baseX = 300;

        // Group Impact Rows by Hierarchy Level
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

        // Add Impact Nodes (side-by-side for each hierarchy level)
        for (const level of hierarchyOrder) {
          const group = impactGroups[level] || [];
          group.sort((a, b) => a.orderIndex - b.orderIndex);

          group.forEach((row, i) => {
            const x = baseX + i * horizontalSpacing;
            const y = hierarchyYMap[level];

            nodeList.push({
              id: row.id,
              type: "default",
              data: { label: `${level.replace(/_/g, " ")}: ${row.resultStatement}` },
              position: { x, y },
            });
          });
        }

        // Add Risks to the left of their hierarchy level
        risks.forEach((risk, i) => {
          const y = hierarchyYMap[risk.hierarchyLevel] ?? i * verticalSpacing;

          nodeList.push({
            id: `risk-${risk.id}`,
            type: "default",
            data: { label: `Risk: ${risk.text}` },
            position: { x: baseX - 350, y },
            style: {
              backgroundColor: "#f8d7da",
              borderColor: "#721c24",
              color: "#721c24",
            },
          });
        });

        // Add Activities below OUTPUTs
        const outputRows = impactGroups["OUTPUT"] || [];
        activities.forEach((activity, i) => {
          const x = baseX + i * horizontalSpacing;
          const y = hierarchyYMap["OUTPUT"] + 120;

          nodeList.push({
            id: `activity-${activity.id}`,
            type: "default",
            data: { label: `Activity: ${activity.text}` },
            position: { x, y },
            style: {
              backgroundColor: "#fff3cd",
              borderColor: "#856404",
              color: "#856404",
            },
          });
        });

        // Add Assumptions at bottom center
        assumptions.forEach((assumption, i) => {
          const y = hierarchyOrder.length * verticalSpacing + 120 + i * 80;

          nodeList.push({
            id: `assumption-${assumption.id}`,
            type: "default",
            data: { label: `Assumption: ${assumption.text}` },
            position: { x: baseX, y },
            style: {
              backgroundColor: "#d4edda",
              borderColor: "#155724",
              color: "#155724",
            },
          });
        });

        setNodes(nodeList);
        setEdges([]); // NO PRE-GENERATED ARROWS
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch diagram data", err);
      }
    };

    fetchAllData();
  }, [projectId]);

const onConnect = useCallback(
  (params: any) =>
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: "default",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#222",
          },
          style: { stroke: "#222", strokeWidth: 2 },
        },
        eds
      )
    ),
  [setEdges]
);


  if (loading) return <p>Loading diagram...</p>;

  return (
    <div style={{ padding: "1rem", height: "90vh", display: "flex", flexDirection: "column" }}>
      <div style={{ fontWeight: "bold", marginBottom: "1rem" }}>
        <h3 style={{ background: "#dcdcdc", padding: "10px", borderRadius: "5px" }}>
          Instructions
        </h3>
        <ol style={{ marginLeft: "1rem" }}>
          <li>Insert arrows between diagram boxes.</li>
          <li>To clear a single arrow, click on it then delete.</li>
          <li>Save your work once done.</li>
          <li>Option to export as PDF.</li>
        </ol>
      </div>

      <div
        style={{
          border: "2px solid #000",
          borderRadius: "20px",
          padding: "10px",
          backgroundColor: "#fff",
          flex: 1,
          position: "relative",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
