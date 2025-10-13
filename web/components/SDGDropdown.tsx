import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface SDGTarget {
  id: string;
  code: string;
  title: string;
}

interface Props {
  allTargets: SDGTarget[];
  selectedTargetIds: string[];
  onChange: (ids: string[]) => void;
}

const SDGDropdown: React.FC<Props> = ({ allTargets, selectedTargetIds, onChange }) => {
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 200 });

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleValue = (id: string) => {
    if (selectedTargetIds.includes(id)) {
      onChange(selectedTargetIds.filter((t) => t !== id));
    } else {
      onChange([...selectedTargetIds, id]);
    }
  };

  // Set position of dropdown on open
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderLabel = () => {
    const count = selectedTargetIds.length;
    return count === 0 ? "Target" : `${count} selected`;
  };

  return (
    <>
      {/* Trigger Button */}
<div
  ref={triggerRef}
  onClick={() => setOpen((prev) => !prev)}
  style={{
    height: "36px", // ✅ Match real select height visually (not 33px!)
    padding: "0 10px",
    backgroundColor: "#fff",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#333",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "8px",
    width: "100%",
    lineHeight: "normal",
    position: "relative",
    top: "1px", // ✅ Aligns perfectly with native <select> baseline
  }}
>
  <span
    style={{
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      flexGrow: 1,
    }}
  >
    {renderLabel()}
  </span>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#555"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginLeft: "8px", flexShrink: 0 }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
</div>






      {/* Dropdown Portal */}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
style={{
  position: "absolute",
  top: dropdownPosition.top,
  left: dropdownPosition.left,
  width: dropdownPosition.width,
  maxHeight: "200px",
  overflowY: "auto",
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "10px",
  zIndex: 9999,
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  fontSize: "13.5px", // match input size
  fontFamily: "inherit",
}}

          >
            {allTargets.map((target) => (
              <label key={target.id} style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                <input
                  type="checkbox"
                  checked={selectedTargetIds.includes(target.id)}
                  onChange={() => toggleValue(target.id)}
                  style={{ marginRight: "8px" }}
                />
                {target.code}
              </label>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default SDGDropdown;
