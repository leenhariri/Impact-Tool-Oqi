// components/DiagramLegend.tsx
import React from "react";

const legendItems = [
  { label: "Risk", color: "#f8d7da", border: "#721c24" },
  { label: "Long-term Impact", color: "#cce5ff", border: "#004085" },
  { label: "Mid-term Impact", color: "#d6b3ff", border: "#5c2d91" },
  { label: "Short-term Impact", color: "#e07d7dff", border: "#a4494eff" },
  { label: "Output", color: "#fde2b9", border: "#8a6d3b" },
  { label: "Activity", color: "#468c4cff", border: "#156e21ff" },
  { label: "Assumption", color: "#d4f4dd", border: "#155724" },
  { label: "Stakeholder (Direct)", color: "#d4edda", border: "#14532d", style: "solid" },
  { label: "Stakeholder (Indirect)", color: "#d4edda", border: "#14532d", style: "dotted" },
];

export default function DiagramLegend() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "16px",
        right: "16px",
        backgroundColor: "white",
        border: "1px solid #ccc",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "11px",
        zIndex: 1000,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        maxWidth: "170px",
      }}
    >
      <strong style={{ display: "block", marginBottom: "8px", fontSize: "12px" }}>
        Node Legend
      </strong>
      <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
        {legendItems.map((item, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: item.color,
                border: `1.5px ${item.style || "solid"} ${item.border}`,
                marginRight: "6px",
              }}
            />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
