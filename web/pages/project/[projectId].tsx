// pages/project/[projectId].tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../../styles/project.module.css';
import SDGDropdown from '../../components/SDGDropdown';

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
      if (!row.id || row.id.startsWith('temp-')) {
        const res = await fetch(`http://localhost:4000/impact-rows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...row, projectId,orderIndex: index  })
        });
        const created = await res.json();
        row.id = created.id;
      } else {
        await fetch(`http://localhost:4000/impact-rows/${row.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...row, orderIndex: index })
        });
      }

      const targetIds = sdgTargets[row.id || ''] || [];
      const sdgId = selectedSDGs[row.id || ''];  // ✅ Get selected SDG
      await fetch(`http://localhost:4000/impact-row-targets/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
  sdgTargetIds: targetIds,
  projectId: projectId,
  impactRowId: row.id,
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
        <p>1. Fill in the tables</p>
        <p>2. To add a row click ➕, to delete a row click ❌</p>
        <p>3. Save your work once done</p>
        <p>4. Proceed to view Diagram/Matrix</p>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Hierarchy</th>
            <th>Result Statement</th>
            <th>Indicator</th>
            <th>Indicator Definition</th>
            <th>Means of Measurement</th>
            <th>Baseline</th>
            <th>SDG</th>
            <th>SDG Target</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {impactRows.map((row, index) => (
            <tr key={row.id || index}>
              {(['hierarchyLevel', 'resultStatement', 'indicator', 'indicatorDefinition', 'meansOfMeasurement', 'baseline'] as (keyof ImpactRow)[]).map((field) => (
                <td key={field}>
                  <div className={styles.inputGroup}>
                    <input
                      value={row[field]}
                      onChange={(e) => handleRowChange(index, field, e.target.value)}
                    />
                  </div>
                </td>
              ))}

              <td>
                <div className={styles.inputGroup}>
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
                </div>
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
                <button className={styles.deleteBtn} onClick={() => deleteRow(index)}>
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Risks</h3>
<table>
<thead>
  <tr>
    <th>Risk Text</th>
    <th>Hierarchy Levels (comma-separated)</th>
    <th></th>
  </tr>
</thead>

  <tbody>
  {risks.map((risk, index) => (
    <tr key={index}>
      <td>
        <input
          value={risk.text}
          onChange={(e) => handleRiskChange(index, 'text', e.target.value)}
        />
      </td>
      <td>
        <input
          value={risk.hierarchyLevels.join(', ')} // show it as comma-separated string
          onChange={(e) =>
            handleRiskChange(
              index,
              'hierarchyLevels',
              e.target.value.split(',').map(s => s.trim()) // turn back into string[]
            )
          }
        />
      </td>
      <td>
        <button onClick={() => deleteRisk(index)}>❌</button>
      </td>
    </tr>
  ))}
</tbody>

</table>

<button onClick={addRisk}>➕ Add Risk</button>


<button className={styles.addRowBtn} onClick={addRisk}>➕ Add Risk</button>


      <button className={styles.addRowBtn} onClick={addRow}>➕ Add Row</button>
<h3>Assumptions & Activities</h3>
<table>
  <thead>
    <tr>
      <th>Type</th>
      <th>Text</th>
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
            <option value="ACTIVITY">Activity</option>
          </select>
        </td>
        <td>
          <input
            value={item.text}
            onChange={(e) => {
              const updated = [...assumptionsAndActivities];
              updated[index].text = e.target.value;
              setAssumptionsAndActivities(updated);
            }}
          />
        </td>
        <td>
<button onClick={() => deleteAssumptionOrActivity(index)}>❌</button>

        </td>
      </tr>
    ))}
  </tbody>
</table>
<button
  onClick={() =>
    setAssumptionsAndActivities((prev = []) => [
      ...prev,
      { type: 'ASSUMPTION', text: '' },
    ])
  }
>
  ➕ Add
</button>
<h3>Stakeholders</h3>
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Role</th>
      <th>Interest</th>
      <th>Type</th>
      <th>Strategy</th>
      <th>Hierarchy</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    {stakeholders.map((s, index) => (
      <tr key={index}>
        <td><input value={s.name} onChange={e => updateStakeholderField(index, 'name', e.target.value)} /></td>
        <td><input value={s.role} onChange={e => updateStakeholderField(index, 'role', e.target.value)} /></td>
        <td><input value={s.interest} onChange={e => updateStakeholderField(index, 'interest', e.target.value)} /></td>
        <td>
          <select value={s.stakeholderType} onChange={e => updateStakeholderField(index, 'stakeholderType', e.target.value as StakeholderType)}>
            <option value="DIRECT">Direct</option>
            <option value="INDIRECT">Indirect</option>
          </select>
        </td>
        <td><input value={s.engagementStrategy} onChange={e => updateStakeholderField(index, 'engagementStrategy', e.target.value)} /></td>
        <td>
          <select value={s.hierarchyLevel} onChange={e => updateStakeholderField(index, 'hierarchyLevel', e.target.value as HierarchyLevel)}>
            <option value="LONG_TERM_IMPACT">Long-Term</option>
            <option value="MID_TERM_IMPACT">Mid-Term</option>
            <option value="SHORT_TERM_IMPACT">Short-Term</option>
          </select>
        </td>
        <td>
          <button onClick={() => deleteStakeholder(index)}>❌</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

<button onClick={addStakeholder}>➕ Add Stakeholder</button>


      <div className={styles.buttonRow}>
        <button className={styles.saveBtn} onClick={saveAll}>Save</button>
        <button className={styles.editBtn}>Edit Diagram</button>
        <button className={styles.editBtn}>Edit Matrix</button>
      </div>
    </div>
  );
}
