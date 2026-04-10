import React, { useCallback, useEffect, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
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
import { useRouter } from 'next/router';
import { Handle, Position } from "reactflow";



type ImpactRow = {
  id: string;
  hierarchyLevel: string;
  resultStatement: string;
  orderIndex: number;
};
const iconStyle: React.CSSProperties = {
  width: "28px",
  height: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#222",
  transition: "opacity 0.2s ease",
};

type Risk = {
  id: string;
  text: string;
  hierarchies: { hierarchy: string }[]; 
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
  const router = useRouter();
  const [showInstructions, setShowInstructions] = useState(true); 
  const shouldRegenerate = router.query.regenerate === "true";
// CHANGE HERE
const shouldDownloadPreviousPdf = router.query.downloadPreviousPdf === "1";
const isDownloadOnlyMode = shouldDownloadPreviousPdf;
// 
const projectIdStr = projectId; 

const diagramOnlyRef = useRef<HTMLDivElement>(null);

const buildDiagramPdfBlob = async (): Promise<Blob> => {
  if (!diagramOnlyRef.current) {
    throw new Error("Diagram element not found.");
  }

  const element = diagramOnlyRef.current;

  const hiddenElements = element.querySelectorAll(".no-export");
  hiddenElements.forEach((el) => ((el as HTMLElement).style.display = "none"));

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
    scale: 3,
  });

  element.setAttribute("style", originalStyle);
  hiddenElements.forEach((el) => ((el as HTMLElement).style.display = ""));

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a3",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const imgWidth = canvas.width * ratio;
  const imgHeight = canvas.height * ratio;
  const x = (pageWidth - imgWidth) / 2;
  const y = (pageHeight - imgHeight) / 2;

  pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

  return pdf.output("blob");
};
// CHANGE HERE
// const exportAsPDF = async () => {
//   try {
//     const blob = await buildDiagramPdfBlob();
//     const url = URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "diagram-a3.pdf";
//     document.body.appendChild(a);
//     a.click();
//     a.remove();

//     URL.revokeObjectURL(url);
//   } catch (error) {
//     alert("Could not export diagram PDF. Please try again.");
//   }
// };


const exportAsPDF = async (
  fileName: string = "diagram-a3.pdf",
  silent: boolean = false
) => {
  try {
    const blob = await buildDiagramPdfBlob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch (error) {
    if (!silent) {
      alert("Could not export diagram PDF. Please try again.");
    }
    throw error;
  }
};
// 

  const extractDiagramNodeData = (nodes: Node[]): any[] =>
    nodes.map((node) => ({
      id: node.id,
      nodeId: node.id,
      x: node.position.x,
      y: node.position.y,
    }));
const [error, setError] = useState<string>(''); 
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ;
// CHANGE HERE
// useEffect(() => {
//   if (!projectIdStr) return;

//   (async () => {
//     const res = await fetch(`${API_BASE}/api/projects/${projectIdStr}/edit/start`, {
//       method: "POST",
//       credentials: "include",
//     });

//     if (res.status === 423) {
//       const data = await res.json();
//       alert(`${data?.editingBy?.name ?? "Someone"} is editing this project. Please try again later.`);
//       router.push("/dashboard");
//       return;
//     }

//     if (!res.ok) {
//       alert("Could not start editing session.");
//       router.push("/dashboard");
//     }
//   })();
// }, [projectIdStr, API_BASE, router]);
useEffect(() => {
  if (!projectIdStr || isDownloadOnlyMode) return;

  (async () => {
    const res = await fetch(`${API_BASE}/api/projects/${projectIdStr}/edit/start`, {
      method: "POST",
      credentials: "include",
    });

    if (res.status === 423) {
      const data = await res.json();
      alert(`${data?.editingBy?.name ?? "Someone"} is editing this project. Please try again later.`);
      router.push("/dashboard");
      return;
    }

    if (!res.ok) {
      alert("Could not start editing session.");
      router.push("/dashboard");
    }
  })();
}, [projectIdStr, API_BASE, router, isDownloadOnlyMode]);
// 
// CHANGE HERE
// useEffect(() => {
//   if (!projectIdStr) return;

//   const interval = setInterval(() => {
//     fetch(`${API_BASE}/api/projects/${projectIdStr}/edit/ping`, {
//       method: "POST",
//       credentials: "include",
//     }).catch(() => {});
//   }, 5_000);

//   return () => clearInterval(interval);
// }, [projectIdStr, API_BASE]);
useEffect(() => {
  if (!projectIdStr || isDownloadOnlyMode) return;

  const interval = setInterval(() => {
    fetch(`${API_BASE}/api/projects/${projectIdStr}/edit/ping`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, 5_000);

  return () => clearInterval(interval);
}, [projectIdStr, API_BASE, isDownloadOnlyMode]);
// 
// CHANGE HERE
// useEffect(() => {
//   if (!projectIdStr) return;

//   const stop = () => {
//     fetch(`${API_BASE}/api/projects/${projectIdStr}/edit/stop`, {
//       method: "POST",
//       credentials: "include",
//       keepalive: true,
//     }).catch(() => {});
//   };

//   const onRouteChangeStart = (url: string) => {
//     if (url.startsWith(`/project/${projectIdStr}`)) return;
//     stop();
//   };

//   router.events.on("routeChangeStart", onRouteChangeStart);
//   window.addEventListener("beforeunload", stop);

//   return () => {
//     router.events.off("routeChangeStart", onRouteChangeStart);
//     window.removeEventListener("beforeunload", stop);
//   };
// }, [projectIdStr, API_BASE, router.events]);

useEffect(() => {
  if (!projectIdStr || isDownloadOnlyMode) return;

  const stop = () => {
    fetch(`${API_BASE}/api/projects/${projectIdStr}/edit/stop`, {
      method: "POST",
      credentials: "include",
      keepalive: true,
    }).catch(() => {});
  };

  const onRouteChangeStart = (url: string) => {
    if (url.startsWith(`/project/${projectIdStr}`)) return;
    stop();
  };

  router.events.on("routeChangeStart", onRouteChangeStart);
  window.addEventListener("beforeunload", stop);

  return () => {
    router.events.off("routeChangeStart", onRouteChangeStart);
    window.removeEventListener("beforeunload", stop);
  };
}, [projectIdStr, API_BASE, router.events, isDownloadOnlyMode]);
// 
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
 fetch(`${API_BASE}/api/impact-rows/${projectId}`, { signal: controller.signal ,credentials: 'include'}),
        fetch(`${API_BASE}/api/risks/project/${projectId}`, { signal: controller.signal ,credentials: 'include',}),
        fetch(`${API_BASE}/api/activities/project/${projectId}`, { signal: controller.signal,credentials: 'include' }),
        fetch(`${API_BASE}/api/assumptions/project/${projectId}`, { signal: controller.signal ,credentials: 'include',}),
        fetch(`${API_BASE}/api/diagram-nodes/${projectId}`, { signal: controller.signal,credentials: 'include', }),
        fetch(`${API_BASE}/api/diagram-edges/${projectId}`, { signal: controller.signal,credentials: 'include', }),
        fetch(`${API_BASE}/api/stakeholders/${projectId}`, { signal: controller.signal ,credentials: 'include',}),
          
        ]);
        if (!impactRes.ok) throw new Error("Failed to fetch impact rows");
        const impactRows: ImpactRow[] = await impactRes.json();
        if (!riskRes.ok) throw new Error("Failed to fetch risks");
        const risks: Risk[] = await riskRes.json();
        if (!activityRes.ok) throw new Error("Failed to fetch activities");
        const activities: Activity[] = await activityRes.json();
         if (!assumptionRes.ok) throw new Error("Failed to fetch assumptions");
        const assumptions: Assumption[] = await assumptionRes.json();
         if (!nodePosRes.ok) throw new Error("Failed to fetch nodes");
        const savedNodes = await nodePosRes.json();
         if (!edgeRes.ok) throw new Error("Failed to fetch edges");
        const savedEdges = await edgeRes.json();
         if (!stakeholderRes.ok) throw new Error("Failed to fetch stakeholders");
const stakeholders: Stakeholder[] = await stakeholderRes.json();
        const nodeList: Node[] = [];
        

const nodePositionMap = shouldRegenerate
  ? new Map() // 
  : new Map(savedNodes.map((n: any) => [n.nodeId, { x: n.x, y: n.y }]));


        const verticalSpacing = 220;
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

        
        for (const level of hierarchyOrder) {
          const group = impactGroups[level] || [];
          group.sort((a, b) => a.orderIndex - b.orderIndex);

          group.forEach((row, i) => {
            const nodeId = row.id;
            const position = (nodePositionMap.get(nodeId) ?? {
              x: baseX + i * horizontalSpacing,
              y: hierarchyYMap[level],
            }) as { x: number; y: number };

let style: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: "16px",
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




Object.entries(risksByHierarchy).forEach(([hierarchy, riskList]) => {
  const nodeId = `risk-${hierarchy}`;
  const y = hierarchyYMap[hierarchy] ?? 0;

  const width = Math.max(320, riskList.length * 170);
  const riskBoxOffset = 60;

  const defaultPosition = {
    x: baseX - width - riskBoxOffset,
    y,
  };

const savedRiskNode = nodePositionMap.get(nodeId);

const position = {
  x: defaultPosition.x,
  y: savedRiskNode?.y ?? defaultPosition.y,
} as { x: number; y: number };

  const combinedText = (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "stretch",
        gap: "12px",
        flexWrap: "nowrap",
        whiteSpace: "normal",
      }}
    >
      {riskList.map((risk, i) => (
        <div
          key={i}
          style={{
            backgroundColor: "#f8d7da",
            border: "1px solid #721c24",
            color: "#721c24",
            padding: "6px 8px",
            borderRadius: "6px",
            fontSize: "16px",
            minWidth: "140px",
            maxWidth: "180px",
            whiteSpace: "normal",
            wordBreak: "break-word",
            display: "inline-block",
            textAlign: "left",
          }}
        >
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
      fontSize: "16px",
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
  fontSize: "16px",
  fontWeight: "normal",
  whiteSpace: "pre-wrap",         
  overflowWrap: "break-word",     
  textAlign: "center",
  display: "inline-block",        
  maxWidth: "300px",              
  minWidth: "120px",              
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
        fontSize: "16px",
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
      fontSize: "16px",
      whiteSpace: "normal",
      overflowWrap: "break-word",
      textAlign: "left",
      display: "inline-block",
      width: "auto",
      maxWidth: "100%",
    },
  });
}



const edgeList: Edge[] = shouldRegenerate
  ? []
  : savedEdges.map((edge: any) => ({
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
    }));


// Stakeholders 

const stakeholdersByHierarchy: Record<string, Stakeholder[]> = {};
stakeholders.forEach((s) => {
  if (!stakeholdersByHierarchy[s.hierarchyLevel]) {
    stakeholdersByHierarchy[s.hierarchyLevel] = [];
  }
  stakeholdersByHierarchy[s.hierarchyLevel].push(s);
});





for (const level of hierarchyOrder) {
  const group = stakeholdersByHierarchy[level] || [];

  group.forEach((s, i) => {
    const nodeId = `stakeholder-${s.id}`;
    
    const position = (nodePositionMap.get(nodeId) ?? {
x: baseX + 1400 + i * 250, 
y: hierarchyYMap[level],

    }) as { x: number; y: number };

    
    const isDirect = s.stakeholderType === "DIRECT";
    

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
  borderStyle: isDirect ? "solid" : "dashed", 
  borderWidth: 2,                             
  color: "#14532d",
  padding: "8px 12px",
  fontSize: "16px",
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

    
  });
}


        setNodes(nodeList);
        setEdges(edgeList);
        setLoading(false);
        
if (shouldRegenerate) {
  const { pathname, query } = router;
  delete query.regenerate;
  router.replace({ pathname, query }, undefined, { shallow: true });
}

} catch (err) {
  console.error("Failed to fetch diagram data", err);
  setError("Failed to load diagram. Please try again later.");
}

    };

    fetchAllData();


  }, [projectId]);

const handleNodesChange: OnNodesChange = (changes) => {
  onNodesChange(changes); // update state only
};
// CHANGE HERE
// useEffect(() => {
//   if (!projectId || nodes.length === 0) return;

//   const timeout = setTimeout(() => {
//     const updated = extractDiagramNodeData(nodes);
//     fetch(`${API_BASE}/api/diagram-nodes`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ projectId, nodes: updated }),
//       credentials:'include'
//     }).then(res => {
//     if (!res.ok) throw new Error("Failed to save nodes");
//   })
//   .catch(err => {
//     console.error("node save error:", err);
//   });
//   }, 300);

//   return () => clearTimeout(timeout);
// }, [nodes, projectId]);
useEffect(() => {
  if (!projectId || nodes.length === 0 || isDownloadOnlyMode) return;

  const timeout = setTimeout(() => {
    const updated = extractDiagramNodeData(nodes);
    fetch(`${API_BASE}/api/diagram-nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, nodes: updated }),
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save nodes");
      })
      .catch((err) => {
        console.error("node save error:", err);
      });
  }, 300);

  return () => clearTimeout(timeout);
}, [nodes, projectId, API_BASE, isDownloadOnlyMode]);
// 
const handleEdgesChange = (changes: any) => {
  const updatedEdges = applyEdgeChanges(changes, edges);
  setEdges(updatedEdges);


  fetch(`${API_BASE}/api/diagram-edges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, edges: updatedEdges }),
    credentials:'include'
  }).then(res => {
    if (!res.ok) throw new Error("Failed to save edges");
  })
  .catch(err => {
    console.error("Edge save error:", err);
  });
};


const onConnect = useCallback(
  (params: any) => {
    const sourceNode = nodes.find((n) => n.id === params.source);
    const targetNode = nodes.find((n) => n.id === params.target);
    if (!sourceNode || !targetNode) return;


    const topNode = sourceNode.position.y < targetNode.position.y ? sourceNode : targetNode;
    const bottomNode = topNode.id === sourceNode.id ? targetNode : sourceNode;


    const newEdge: Edge = {
      id: `${topNode.id}-${bottomNode.id}-${Date.now()}`,
      source: topNode.id,
      target: bottomNode.id,
      sourceHandle: "top",
      targetHandle: "bottom",
      type: "smoothstep",
      style: { stroke: "#222", strokeWidth: 2 },
      markerStart: {                    
        type: MarkerType.ArrowClosed,
        color: "#222",
        width: 18,
        height: 18,
      },
    };

    const updatedEdges = [...edges, newEdge];
    setEdges(updatedEdges);

    fetch(`${API_BASE}/api/diagram-edges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        edges: updatedEdges,

      }),
      credentials: "include",
    }).catch((err) => console.error("Edge save error:", err));
  },
  [edges, nodes, projectId]
);



const [isDrawingArrow, setIsDrawingArrow] = useState(false);
const [arrowSource, setArrowSource] = useState<string | null>(null);
 const handleNodeClick = useCallback(
  (event: React.MouseEvent, node: Node) => {
    if (!isDrawingArrow) return;

    if (!arrowSource) {
      setArrowSource(node.id);
    } else {
      const sourceNode = nodes.find((n) => n.id === arrowSource);
      const targetNode = nodes.find((n) => n.id === node.id);
      if (!sourceNode || !targetNode) return;

      const topNode = sourceNode.position.y < targetNode.position.y ? sourceNode : targetNode;
const bottomNode = topNode.id === sourceNode.id ? targetNode : sourceNode;

const newEdge: Edge = {
  id: `${topNode.id}-${bottomNode.id}-${Date.now()}`,
  source: topNode.id,
  target: bottomNode.id,
  sourceHandle: "top",
  targetHandle: "bottom",
  type: "smoothstep",
  style: { stroke: "#222", strokeWidth: 2 },
  markerStart: {
    type: MarkerType.ArrowClosed,
    color: "#222",
    width: 18,
    height: 18,
  },
};


      const updatedEdges = [...edges, newEdge];
      setEdges(updatedEdges);
      setArrowSource(null);
      setIsDrawingArrow(false);

      fetch(`${API_BASE}/api/diagram-edges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          edges: updatedEdges,

        }),
        credentials: "include",
      }).catch((err) => {
        console.error("Failed to save edge:", err);
      });
    }
  },
  [isDrawingArrow, arrowSource, edges, nodes, projectId]
);
// CHANGE HERE 
useEffect(() => {
  if (!router.isReady) return;
  if (!shouldDownloadPreviousPdf) return;
  if (loading) return;
  if (nodes.length === 0) return;

  const timer = setTimeout(async () => {
    try {
      const fileName = `previous-diagram-${projectIdStr}.pdf`;
      await exportAsPDF(fileName, true);
    } catch (error) {
      // ignore export failure here
    } finally {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: "previous-diagram-pdf-downloaded" },
            window.location.origin
          );
        }
      } catch {}

      setTimeout(() => {
        window.close();
      }, 500);
    }
  }, 700);

  return () => clearTimeout(timer);
}, [
  router.isReady,
  shouldDownloadPreviousPdf,
  loading,
  nodes,
  projectIdStr,
]);
// 
  if (loading) return <p>Loading diagram...</p>;

return (
  <ReactFlowProvider>
    <div className={styles.container}>
      {/* Instructions */}
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
          Refer to{' '}
          <a href="/user-guide" target="_blank" rel="noopener noreferrer">
            User Guide
          </a>{' '}
          for full instructions.
        </li>
        <li>Add Arrow: Click the + icon, then select two boxes to draw an arrow between them.</li>
        <li>Cancel Arrow: Click the x icon to exit drawing mode before selecting a second box.</li>
        <li>Delete All Arrows: Click the trash icon to clear all arrows from the diagram. This cannot be undone.</li>
        <li>
          Move Boxes: Drag boxes to reposition them — the layout is saved automatically.
        </li>
        <li>Delete a Single Arrow: Click on the arrow, then press delete/backspace.</li>
        <li> Export: Use the Export to PDF button.</li>
        <li> Make sure to click the Fit View toggle before exporting the diagram as PDF.</li>
      </ol>
    </div>
  )}
</div>
      <h3 className={styles.sectionTitle}>Anticipated Impact Flowchart</h3>
{/* <button
  onClick={() => {
    setIsDrawingArrow(true);
    setArrowSource(null);
  }}
  className={styles.buttonPrimary}
>
  Draw Arrow
</button> */}

<div className={styles.diagramArea}>
        <div ref={diagramOnlyRef} className={styles.reactFlowWrapper}>
      {/* Top-right icon controls */}
<div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 10,
        }}
        className="no-export"
      >
        {/* Add Arrow */}
<div
  onClick={() => {
    setIsDrawingArrow(true);
    setArrowSource(null);
  }}
  title="Add Arrow"
  style={iconStyle}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 18L18 6M18 6H10M18 6V14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</div>

        {/*  Cancel Arrow */}
        <div
          onClick={() => {
            setIsDrawingArrow(false);
            setArrowSource(null);
          }}
          title="Cancel Arrow"
          style={iconStyle}
        >
          <X size={18} />
        </div>

       
        <div
          onClick={() => {
            setEdges([]);
            fetch(`${API_BASE}/api/diagram-edges`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ projectId, edges: [] }),
              credentials: "include",
            }).catch((err) => console.error("Failed to delete arrows:", err));
          }}
          title="Delete All Arrows"
          style={iconStyle}
        >
          <Trash2 size={18} />
        </div>
      </div>

    
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={handleNodesChange}
  onEdgesChange={handleEdgesChange}
  onConnect={onConnect}
  onNodeClick={handleNodeClick}
  fitView
  fitViewOptions={{ padding: 0.2 }}
  panOnScroll
  zoomOnScroll
  minZoom={0.05}
  maxZoom={2}
>
  <Background />
  <Controls className="no-export" />       
  {/* <MiniMap />         */}
</ReactFlow>

          <div className="no-export">
  <Legend />
</div>

        </div>

        <div className={styles.controlsWrapper}>
          {/* <Controls /> */}
          {/* <MiniMap /> */}
        </div>
      </div>

      {/* Buttons Row */}

<div className="actionIconBar">

  {/* Export PDF */}
  {/* <button className="actionIcon" title="Export as PDF" onClick={exportAsPDF}>
    <svg 
      width="22" height="22" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  </button> */}
  {/* CHANGE HERE */}
  {/* <button className="actionIcon" title="Export as PDF"
    onClick={exportAsPDF}>
    <i className="uil uil-import"></i>
  </button> */}
<button
  className="actionIcon"
  title="Export as PDF"
  onClick={() => exportAsPDF()}
>
  <i className="uil uil-import"></i>
</button>
{/*  */}
  {/* Edit Input */}
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

  {/* Edit SDG Interlinkage */}
<button className="actionIcon" title="Edit SDG Interlinkage"
  onClick={() => router.push(`/project/${projectId}/matrix`)}>
  
  <svg viewBox="0 0 48 48" fill="#ffffff" stroke="none" width="22" height="22">
    <rect x="4" y="4" width="10" height="10"></rect>
    <rect x="19" y="4" width="10" height="10"></rect>
    <rect x="34" y="4" width="10" height="10"></rect>

    <rect x="4" y="19" width="10" height="10"></rect>
    <rect x="19" y="19" width="10" height="10"></rect>
    <rect x="34" y="19" width="10" height="10"></rect>

    <rect x="4" y="34" width="10" height="10"></rect>
    <rect x="19" y="34" width="10" height="10"></rect>
    <rect x="34" y="34" width="10" height="10"></rect>
  </svg>

</button>

</div>

      {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

    </div>
  </ReactFlowProvider>
);
}