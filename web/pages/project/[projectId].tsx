// pages/project/[projectId].tsx

import { useRouter } from 'next/router';
import { useEffect, useState ,useRef} from 'react';
import styles from '../../styles/project.module.css';
import SDGDropdown from '../../components/SDGDropdown';
import HierarchyDropdown from '../../components/HierarchyDropdown';
type StakeholderType = 'DIRECT' | 'INDIRECT';
type HierarchyLevel = 'LONG_TERM_IMPACT' | 'MID_TERM_IMPACT' | 'SHORT_TERM_IMPACT';

interface Stakeholder {
  id?: string;
  name: string;
  role: string;
  interest: string;
  stakeholderType: StakeholderType;
  engagementStrategy: string;
  hierarchyLevel: HierarchyLevel;
}

interface ImpactRow {
  id?: string;
  hierarchyLevel: string;
  resultStatement: string;
  indicator: string;
  indicatorDefinition: string;
  meansOfMeasurement: string;
  baseline: string;
}
interface Risk {
  id?: string;
  projectId?: string;
  text: string;
  hierarchyLevels: string[]; // ✅ add this
}


interface SDG {
  id: number;
  code: string;
  name: string;
}

interface SDGTarget {
  id: string;
  sdgId: number;
  code: string;
  title: string;
}
type AssumptionOrActivityType = 'ASSUMPTION' | 'ACTIVITY';

interface AssumptionOrActivity {
  id?: string;
  type: AssumptionOrActivityType;
  text: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const { projectId } = router.query;

  const [impactRows, setImpactRows] = useState<ImpactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sdgTargets, setSdgTargets] = useState<{ [rowId: string]: string[] }>({});
  const [selectedSDGs, setSelectedSDGs] = useState<{ [rowId: string]: number | null }>({});
  const [allTargets, setAllTargets] = useState<SDGTarget[]>([]);
  const [allSDGs, setAllSDGs] = useState<SDG[]>([]);
const [risks, setRisks] = useState<Risk[]>([])
const [assumptionsAndActivities, setAssumptionsAndActivities] = useState<AssumptionOrActivity[]>([]);
const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
// State for editing a specific cell
const [editingField, setEditingField] = useState<{
  section: 'impact' | 'risk' | 'assumption' | 'stakeholder';
  index: number;
  field: string;
  value: string;
  anchorRect: DOMRect | null;
} | null>(null);

const popupRef = useRef<HTMLDivElement | null>(null);
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(event.target as Node)
    ) {
      setEditingField(null);
    }
  };

  if (editingField) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [editingField]);

useEffect(() => {
  if (!projectId) return;

  const fetchStakeholders = async () => {
    try {
      const res = await fetch(`http://localhost:4000/stakeholders/${projectId}`);
      const data = await res.json();
      setStakeholders(data);
    } catch (err) {
      console.error("Failed to fetch stakeholders:", err);
      setStakeholders([]);
    }
  }

  fetchStakeholders();
}, [projectId])
const updateStakeholderField = (
  index: number,
  field: keyof Stakeholder,
  value: string
) => {
  const updated = [...stakeholders];
  (updated[index][field] as string) = value;
  setStakeholders(updated);
};

const addStakeholder = () => {
  setStakeholders(prev => [
    ...prev,
    {
      name: '',
      role: '',
      interest: '',
      stakeholderType: 'DIRECT',
      engagementStrategy: '',
      hierarchyLevel: 'LONG_TERM_IMPACT',
    }
  ]);
};

const deleteStakeholder = async (index: number) => {
  const s = stakeholders[index];
  if (s.id) {
    await fetch(`http://localhost:4000/stakeholders/${s.id}`, {
      method: 'DELETE'
    });
  }
  const updated = [...stakeholders];
  updated.splice(index, 1);
  setStakeholders(updated);
};

  useEffect(() => {
    if (!projectId) return;

    const fetchRows = async () => {
      try {
        const res = await fetch(`http://localhost:4000/impact-rows/${projectId}`);
        const data = await res.json();
        setImpactRows(data);

        const targetMap: { [rowId: string]: string[] } = {};
        const sdgMap: { [rowId: string]: number | null } = {};

        data.forEach((row: any) => {
targetMap[row.id] = row.targets?.map((t: any) => t.sdgTargetId) || [];
sdgMap[row.id] = row.targets?.[0]?.sdg?.id || null;

        });

        setSdgTargets(targetMap);
        setSelectedSDGs(sdgMap);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRows();
  }, [projectId]);
useEffect(() => {
  if (!projectId) return;

const fetchRisks = async () => {
  try {
    const res = await fetch(`http://localhost:4000/risks?projectId=${projectId}`);
    const data = await res.json();

    // Transform DB data to match frontend Risk interface
    const formatted = data.map((r: any) => ({
      id: r.id,
      text: r.text,
      hierarchyLevels: r.hierarchies?.map((h: any) => h.hierarchy) || []
    }));

    setRisks(formatted);
  } catch (err) {
    console.error("Failed to fetch risks:", err);
    setRisks([]);
  }
}



  fetchRisks();
}, [projectId]);
const fetchAssumptionsAndActivities = async () => {
  try {
    const [assumptionRes, activityRes] = await Promise.all([
      fetch(`http://localhost:4000/assumptions/${projectId}`),
      fetch(`http://localhost:4000/activities/${projectId}`)
    ]);

    const assumptions = await assumptionRes.json();
    const activities = await activityRes.json();

    const merged: AssumptionOrActivity[] = [
      ...assumptions.map((a: any) => ({ ...a, type: 'ASSUMPTION' })),
      ...activities.map((a: any) => ({ ...a, type: 'ACTIVITY' })),
    ];

    setAssumptionsAndActivities(merged);
  } catch (err) {
    console.error("Failed to fetch assumptions/activities:", err);
    setAssumptionsAndActivities([]);
  }
};

useEffect(() => {
  if (!projectId) return;
  fetchAssumptionsAndActivities();
}, [projectId]);


  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const res = await fetch('http://localhost:4000/sdg-targets');
        const data = await res.json();

        if (Array.isArray(data)) {
          setAllTargets(data);
        } else if (Array.isArray(data.targets)) {
          setAllTargets(data.targets);
        } else {
          console.error('Unexpected SDG target format', data);
          setAllTargets([]);
        }
      } catch (error) {
        console.error('Failed to load SDG targets:', error);
        setAllTargets([]);
      }
    };

    const fetchSDGs = async () => {
      try {
        const res = await fetch('http://localhost:4000/sdgs');
        const data = await res.json();
        setAllSDGs(data);
      } catch (error) {
        console.error('Failed to load SDGs:', error);
        setAllSDGs([]);
      }
    };

    fetchTargets();
    fetchSDGs();
  }, []);

  const handleRowChange = (index: number, field: keyof ImpactRow, value: string) => {
    const newRows = [...impactRows];
    newRows[index][field] = value;
    setImpactRows(newRows);
  };
const deleteAssumptionOrActivity = async (index: number) => {
  const item = assumptionsAndActivities[index];
  if (item.id) {
    await fetch(`http://localhost:4000/${item.type === 'ASSUMPTION' ? 'assumptions' : 'activities'}/${item.id}`, {
      method: 'DELETE',
    });
  }
  const updated = [...assumptionsAndActivities];
  updated.splice(index, 1);
  setAssumptionsAndActivities(updated); // ✅ Update local state
};

  const addRow = () => {
    const newId = `temp-${Date.now()}`;
    setImpactRows((prev) => [
      ...prev,
      {
        id: newId,
        hierarchyLevel: '',
        resultStatement: '',
        indicator: '',
        indicatorDefinition: '',
        meansOfMeasurement: '',
        baseline: ''
      }
    ]);
    setSelectedSDGs((prev) => ({ ...prev, [newId]: null }));
    setSdgTargets((prev) => ({ ...prev, [newId]: [] }));
  };

  const deleteRow = async (index: number) => {
    const row = impactRows[index];
    if (row.id && !row.id.startsWith('temp-')) {
      await fetch(`http://localhost:4000/impact-rows/${row.id}`, {
        method: 'DELETE'
      });
    }
    const newRows = [...impactRows];
    newRows.splice(index, 1);
    setImpactRows(newRows);
  };

  const handleTargetChange = (rowId: string, newIds: string[]) => {
    setSdgTargets((prev) => ({ ...prev, [rowId]: newIds }));
  };

  const saveAll = async () => {
    for (const [index, row] of impactRows.entries()) {
let savedRowId = row.id;

if (!savedRowId || savedRowId.startsWith('temp-')) {
  const res = await fetch(`http://localhost:4000/impact-rows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...row, projectId, orderIndex: index })
  });

const created = await res.json();
const tempId = row.id!;
savedRowId = created.id;
impactRows[index].id = created.id;

// 🔄 Update all references from temp ID to real ID
if (tempId.startsWith('temp-')) {
  // Update selectedSDGs
  if (selectedSDGs[tempId] !== undefined) {
    selectedSDGs[created.id] = selectedSDGs[tempId];
    delete selectedSDGs[tempId];
  }

  // Update sdgTargets
  if (sdgTargets[tempId] !== undefined) {
    sdgTargets[created.id] = sdgTargets[tempId];
    delete sdgTargets[tempId];
  }
}

} else {
  await fetch(`http://localhost:4000/impact-rows/${savedRowId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...row, orderIndex: index })
  });
}

// ✅ Now save SDG + SDG Target using correct ID
const targetIds = sdgTargets[savedRowId] || [];
const sdgId = selectedSDGs[savedRowId];

await fetch(`http://localhost:4000/impact-row-targets/${savedRowId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sdgTargetIds: targetIds,
    projectId,
    impactRowId: savedRowId,
    sdgId
  })
});

    }
    for (const risk of risks) {
  if (!risk.id) {
    await fetch(`http://localhost:4000/risks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...risk, projectId })
    });
  } else {
    await fetch(`http://localhost:4000/risks/${risk.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(risk)
    });
  }
}
for (let i = 0; i < assumptionsAndActivities.length; i++) {
  const item = assumptionsAndActivities[i];
  const endpoint = item.type === 'ASSUMPTION' ? 'assumptions' : 'activities';
  const method = item.id ? 'PUT' : 'POST';
  const url = `http://localhost:4000/${endpoint}${item.id ? `/${item.id}` : ''}`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: item.text, projectId }),
  });

  if (!item.id) {
    const created = await res.json();
    assumptionsAndActivities[i].id = created.id; // ✅ Save the new ID
  }
}
for (let i = 0; i < stakeholders.length; i++) {
  const s = stakeholders[i];
  const method = s.id ? 'PUT' : 'POST';
  const url = s.id
    ? `http://localhost:4000/stakeholders/${s.id}`
    : 'http://localhost:4000/stakeholders';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...s, projectId }),
  });

  if (!s.id) {
    const created = await res.json();
    stakeholders[i].id = created.id; // Save returned ID
  }
}



    alert('Saved successfully');
    router.reload();

  };
const addRisk = () => {
  setRisks(prev => [
    ...prev,
    {
      text: '',
      hierarchyLevels: [], // ✅ send this to backend even if it's empty
    },
  ]);
};

const handleRiskChange = (
  index: number,
  field: keyof Risk,
  value: string | string[]
) => {
  const updated = [...risks];

  if (field === 'hierarchyLevels' && Array.isArray(value)) {
    updated[index].hierarchyLevels = value;
  } else if (field === 'text' && typeof value === 'string') {
    updated[index].text = value;
  }

  setRisks(updated);
};






const deleteRisk = async (index: number) => {
  const r = risks[index]
  if (r.id) {
    await fetch(`http://localhost:4000/risks/${r.id}`, {
      method: 'DELETE'
    })
  }
  const updated = [...risks]
  updated.splice(index, 1)
  setRisks(updated)
}

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;


return (
  <div className={styles.container}>

    <div className={styles.instructions}>
      <h2>Instructions</h2>
      <p>1. Fill in the tables</p>
      <p>2. To add a row click +, to delete a row click ×</p>
      <p>3. Save your work once done</p>
      <p>4. Proceed to view Diagram/Matrix</p>
    </div>

    {/* Impact Rows */}
    {/* <h3>Impact Rows</h3> */}
    <h3> Indicator Matrix</h3>
    <div className={styles.tableWrapper}>
      <table className={styles.softTable}>

        <thead>
          <tr>
                        <th className={styles.tooltipHeader}>
  Score <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
      specify the objective 
               level here
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  Result <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    outline the defined result statements here
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  Indicator <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    Describe what will be measured to show progress toward the result
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  Indicator Definition <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    explain clearly what the indicator means and how it will be calculated
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  Means of Measurement <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    state how or by what method, source, or tool the data will be measured
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  Baseline <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    state the starting point/status on a particular result before your solution - cite references
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  SDG <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    choose the SDG
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  SDG Target <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    choose the corresponding SDG Targets
  </span>
</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {impactRows.map((row, index) => (
            <tr key={row.id || index}>
              {([
                'hierarchyLevel',
                'resultStatement',
                'indicator',
                'indicatorDefinition',
                'meansOfMeasurement',
                'baseline',
              ] as (keyof ImpactRow)[]).map((field) => (
                <td key={field}>
{field === 'hierarchyLevel' ? (
  <select
    value={row.hierarchyLevel}
    onChange={(e) => handleRowChange(index, 'hierarchyLevel', e.target.value)}
  >
    <option value="">-- Select --</option>
    <option value="LONG_TERM_IMPACT">Long-Term Impact</option>
    <option value="MID_TERM_IMPACT">Mid-Term Impact</option>
    <option value="SHORT_TERM_IMPACT">Short-Term Impact</option>
    <option value="OUTPUT">Deliverable</option>
    {/* <option value="ACTIVITY">Activity</option> */}
  </select>
) : (
<input
  value={row[field]}
  readOnly
  onClick={(e) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
setEditingField({
  section: 'impact',
  index,
  field,
  value: row[field],
  anchorRect: rect
});

  }}
  className={styles.readonlyInput}
/>

)}

                </td>
              ))}
              <td>
                <select
                  value={selectedSDGs[row.id || ''] ?? ''}
                  onChange={(e) => {
                    const sdgId = parseInt(e.target.value);
                    setSelectedSDGs((prev) => ({ ...prev, [row.id || '']: sdgId }));
                    setSdgTargets((prev) => ({ ...prev, [row.id || '']: [] }));
                  }}
                >
                  <option value="">-- Select SDG --</option>
                  {allSDGs.map((sdg) => (
                    <option key={sdg.id} value={sdg.id}>
                      {sdg.code} – {sdg.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                {selectedSDGs[row.id || ''] && (
                  <SDGDropdown
                    allTargets={allTargets.filter(
                      (t) => t.sdgId === selectedSDGs[row.id || '']
                    )}
                    selectedTargetIds={sdgTargets[row.id || ''] || []}
                    onChange={(ids) => handleTargetChange(row.id || '', ids)}
                  />
                )}
              </td>
              <td>
                <button className={styles.iconButton} onClick={() => deleteRow(index)}>
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className={styles.tableActions}>
      <button className={styles.addRowButton} onClick={addRow}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Row
      </button>
    </div>
    <hr className={styles.horizontalDivider} />


    {/* Two-up: Risks + Assumptions */}
    <div className={styles.twoColumnSection}>
      {/* Risks */}
      <div className={styles.column}>
        <h3> Risks Table</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.softTable}>
            <thead>
              <tr>
                <th className={styles.tooltipHeader}>
  Risk 
  {/* <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    Indicate the risks 
  </span> */}
</th>
                <th className={styles.tooltipHeader}>
  Scale <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    Indicate to which scale(s) these risks apply
  </span>
</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk, index) => (
                <tr key={index}>
                  <td>
<input
  value={risk.text}
  readOnly
  onClick={(e) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setEditingField({
      section: 'risk',
      index,
      field: 'text',
      value: risk.text,
      anchorRect: rect,
    });
  }}
  className={styles.readonlyInput}
/>

                  </td>
<td>
  <HierarchyDropdown
    selectedValues={risk.hierarchyLevels}
    onChange={(newValues) =>
      handleRiskChange(index, 'hierarchyLevels', newValues)
    }
  />
</td>

                  <td>
                    <button className={styles.iconButton} onClick={() => deleteRisk(index)}>
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.tableActions}>
          <button className={styles.addRowButton} onClick={addRisk}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Risk
          </button>
        </div>
      </div>

      {/* Assumptions & Activities */}
      <div className={styles.column}>
        <h3> Assumptions & Actions Table</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.softTable}>
            <thead>
              <tr>
                <th className={styles.tooltipHeader}>
  Action/ Assumption
   {/* <span style={{ color: "#ffffffff" }}>🛈</span> */}
  {/* <span className={styles.tooltipText}>
    choose action/ assumption
  </span> */}
</th>
                <th className={styles.tooltipHeader}>
  Description 
  {/* <span style={{ color: "#ffffffff" }}>🛈</span> */}
  {/* <span className={styles.tooltipText}>
    choose the corresponding SDG Targets
  </span> */}
</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assumptionsAndActivities.map((item, index) => (
                <tr key={index}>
                  <td>
                    <select
                      value={item.type}
                      onChange={(e) => {
                        const updated = [...assumptionsAndActivities];
                        updated[index].type = e.target.value as AssumptionOrActivityType;
                        setAssumptionsAndActivities(updated);
                      }}
                    >
                      <option value="ASSUMPTION">Assumption</option>
                      <option value="ACTIVITY">Action</option>
                    </select>
                  </td>
                  <td>
<input
  value={item.text}
  readOnly
  onClick={(e) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setEditingField({
      section: 'assumption',
      index,
      field: 'text',
      value: item.text,
      anchorRect: rect,
    });
  }}
  className={styles.readonlyInput}
/>

                  </td>
                  <td>
                    <button
                      className={styles.iconButton}
                      onClick={() => deleteAssumptionOrActivity(index)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.tableActions}>
          <button
            className={styles.addRowButton}
            onClick={() =>
              setAssumptionsAndActivities((prev = []) => [
                ...prev,
                { type: 'ASSUMPTION', text: '' },
              ])
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>
      </div>
    </div>
<hr className={styles.horizontalDivider} />

    {/* Stakeholders */}
    <h3> Stakeholders Matrix</h3>
   {/* <p className="text-[10px]">  Add the stakeholders responsible for each of the results</p> */}

    <div className={styles.tableWrapper}>
      <table className={styles.softTable}>
        <thead>
          <tr>
                                    <th className={styles.tooltipHeader}>
  Stakeholder <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    Who are the people to be involved directly or indirectly in the implementation

  </span>
</th>
                                    <th className={styles.tooltipHeader}>
  Role <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    specify their role
  </span>
</th>
                                    <th className={styles.tooltipHeader}>
Interest <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    What is their benefit

  </span>
</th>
                                    <th className={styles.tooltipHeader}>
  Stakeholder Type <span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
    Indicate whether they are direct or indirect stakeholders
  </span>
</th>
                                    <th className={styles.tooltipHeader}>
Engagement Strategy<span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
   How will they be mobilised/convinced to be involved?
  </span>
</th>
            <th className={styles.tooltipHeader}>
Scale<span style={{ color: "#ffffffff" }}>🛈</span>
  <span className={styles.tooltipText}>
   Indicate which scale they are related to
  </span>
</th>
            <th></th>
          </tr>
        </thead>
<tbody>
  {stakeholders.map((s, index) => (
    <tr key={index}>
      <td>
        <input
          value={s.name}
          readOnly
          onClick={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setEditingField({
              section: 'stakeholder',
              index,
              field: 'name',
              value: s.name,
              anchorRect: rect,
            });
          }}
          className={styles.readonlyInput}
        />
      </td>
      <td>
        <input
          value={s.role}
          readOnly
          onClick={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setEditingField({
              section: 'stakeholder',
              index,
              field: 'role',
              value: s.role,
              anchorRect: rect,
            });
          }}
          className={styles.readonlyInput}
        />
      </td>
      <td>
        <input
          value={s.interest}
          readOnly
          onClick={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setEditingField({
              section: 'stakeholder',
              index,
              field: 'interest',
              value: s.interest,
              anchorRect: rect,
            });
          }}
          className={styles.readonlyInput}
        />
      </td>
      <td>
        <select
          value={s.stakeholderType}
          onChange={(e) =>
            updateStakeholderField(index, 'stakeholderType', e.target.value as StakeholderType)
          }
        >
          <option value="DIRECT">Direct</option>
          <option value="INDIRECT">Indirect</option>
        </select>
      </td>
      <td>
        <input
          value={s.engagementStrategy}
          readOnly
          onClick={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setEditingField({
              section: 'stakeholder',
              index,
              field: 'engagementStrategy',
              value: s.engagementStrategy,
              anchorRect: rect,
            });
          }}
          className={styles.readonlyInput}
        />
      </td>
      <td>
        <select
          value={s.hierarchyLevel}
          onChange={(e) =>
            updateStakeholderField(index, 'hierarchyLevel', e.target.value as HierarchyLevel)
          }
        >
          <option value="LONG_TERM_IMPACT">Long-Term</option>
          <option value="MID_TERM_IMPACT">Mid-Term</option>
          <option value="SHORT_TERM_IMPACT">Short-Term</option>
        </select>
      </td>
      <td>
        <button className={styles.iconButton} onClick={() => deleteStakeholder(index)}>
          ×
        </button>
      </td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
    <div className={styles.tableActions}>
      <button className={styles.addRowButton} onClick={addStakeholder}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Stakeholder
      </button>
    </div>

    {/* Final Buttons */}
    <div className={styles.buttonRow}>
      <button className={styles.saveBtn} onClick={saveAll}>Save</button>
        <button
    className={styles.editBtn}
    onClick={() => router.push(`/project/${projectId}/diagram`)}
  >
    Edit Diagram
  </button>
        <button
    className={styles.editBtn}
    onClick={() => router.push(`/project/${projectId}/matrix`)}
  >
    Edit Matrix
  </button>
    </div>
{editingField && editingField.anchorRect && (
  <div
     ref={popupRef}
    className={styles.popupEditor}
  style={{
    top: editingField.anchorRect.top + window.scrollY,
    left:
      editingField.anchorRect.right + 340 > window.innerWidth
        ? editingField.anchorRect.left - 340
        : editingField.anchorRect.right + 10,
    position: 'absolute',
    zIndex: 1000,
  }}

  >
    <textarea
      value={editingField.value}
      onChange={(e) =>
        setEditingField({ ...editingField, value: e.target.value })
      }
    />
    <div className={styles.popupActions}>
      <button
        onClick={() => {
          const { section, index, field, value } = editingField;
          if (section === 'impact') {
            handleRowChange(index, field as keyof ImpactRow, value);
          } else if (section === 'risk') {
            handleRiskChange(index, field as keyof Risk, value);
          } else if (section === 'assumption') {
            const updated = [...assumptionsAndActivities];
            updated[index].text = value;
            setAssumptionsAndActivities(updated);
          } else if (section === 'stakeholder') {
            updateStakeholderField(index, field as keyof Stakeholder, value);
          }
          setEditingField(null);
        }}
      >
        Save
      </button>
      <button onClick={() => setEditingField(null)}>Cancel</button>
    </div>
  </div>
)}

  </div>
);
}