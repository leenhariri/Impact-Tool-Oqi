import React from "react";
import { Handle, Position } from "reactflow";

export default function CustomNode({ data, style }: any) {
  return (
    <div style={{ ...style, padding: 10, borderRadius: 5 }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <div>{data.label}</div>
    </div>
  );
}
