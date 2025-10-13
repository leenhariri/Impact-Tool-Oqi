import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/project.module.css'; // Optional

const ALL_HIERARCHIES = [
  { value: 'LONG_TERM_IMPACT', label: 'Long-Term Impact' },
  { value: 'MID_TERM_IMPACT', label: 'Mid-Term Impact' },
  { value: 'SHORT_TERM_IMPACT', label: 'Short-Term Impact' },

];

interface Props {
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

const HierarchyDropdown: React.FC<Props> = ({ selectedValues, onChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const selectedItems = ALL_HIERARCHIES.filter((h) =>
    selectedValues.includes(h.value)
  );

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {/* Displayed Box */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          height: '36px',
          padding: '0 36px 0 12px', // left padding + space for arrow
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: '#fff',
          fontSize: '14px',
          lineHeight: 'normal',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><polyline points='6 9 12 15 18 9'/></svg>")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '16px',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      >
        {selectedItems.length === 0 ? (
          <span style={{ color: '#aaa' }}>Hierarchy</span>
        ) : (
          <span>{selectedItems.length} selected</span>
        )}
      </div>


      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '105%',
            left: 0,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px',
            zIndex: 9999,
            width: '100%',
            boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
            maxHeight: '180px',
            overflowY: 'auto',
          }}
        >
          {ALL_HIERARCHIES.map((option) => (
            <label
              key={option.value}
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => toggleValue(option.value)}
                style={{ marginRight: '8px' }}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default HierarchyDropdown;
