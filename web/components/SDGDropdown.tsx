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
    border: "1px solid #ccc",
    borderRadius: "8px",
    height: "40px",
    padding: "0 12px",
    backgroundColor: "#fff",
    cursor: "pointer",
    width: "100%",
    userSelect: "none",
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    minWidth: "110px", // ✅ Add this line — adjust if needed
    whiteSpace: "nowrap", // ✅ Prevent text wrapping
  }}
>
  {renderLabel()} ▼
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
