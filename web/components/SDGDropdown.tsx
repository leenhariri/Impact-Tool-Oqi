// components/SDGDropdown.tsx
import React from "react";

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
  const toggle = (id: string) => {
    if (selectedTargetIds.includes(id)) {
      onChange(selectedTargetIds.filter(t => t !== id));
    } else {
      onChange([...selectedTargetIds, id]);
    }
  };

  return (
    <div style={{ maxHeight: "120px", overflowY: "scroll", border: "1px solid #ccc", padding: "5px" }}>
      {allTargets.map((target) => (
        <div key={target.id}>
          <label>
            <input
              type="checkbox"
              checked={selectedTargetIds.includes(target.id)}
              onChange={() => toggle(target.id)}
            />
            {target.code} - {target.title}
          </label>
        </div>
      ))}
    </div>
  );
};

export default SDGDropdown;
