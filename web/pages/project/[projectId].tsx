

import { useRouter } from 'next/router';
import { useEffect, useState ,useRef} from 'react';
import styles from '../../styles/project.module.css';
import SDGDropdown from '../../components/SDGDropdown';
import HierarchyDropdown from '../../components/HierarchyDropdown';
import DOMPurify from 'dompurify'; 
import * as XLSX from 'xlsx';

function sanitizeInput(value: string): string {
  return value
    .trim()
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/[<>]/g, '');
}

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
  hierarchyLevels: string[]; 
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
  const isInvalidId = !projectId || typeof projectId !== "string";
const projectIdStr =
  router.isReady && typeof projectId === "string" ? projectId : null;
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// if (!projectId || typeof projectId !== "string") {
//   return <div>Error: Invalid project ID.</div>;
// }

useEffect(() => {
  // if (!projectId || typeof projectId !== "string") return;
if (!router.isReady || !projectIdStr) return;

  (async () => {
    // const res = await fetch(`${API_BASE}/api/projects/${projectId}/edit/start`, {
    const res = await fetch(`/api/projects/${projectIdStr}/edit/start`, {

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
    if (res.ok) {
  hasLockRef.current = true;
}

  })();
}, [router.isReady, projectIdStr,  router]);


useEffect(() => {
  // if (!projectId || typeof projectId !== "string") return;
if (!router.isReady || !projectIdStr) return;

  const interval = setInterval(() => {
    // fetch(`${API_BASE}/api/projects/${projectId}/edit/ping`, {
    fetch(`/api/projects/${projectIdStr}/edit/ping`, {

      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, 1_000);

  return () => clearInterval(interval);
}, [router.isReady, projectIdStr]);


// useEffect(() => {
//   // if (!projectId || typeof projectId !== "string") return;
// if (!router.isReady || !projectIdStr) return;

//   const stop = () => {
//     if (!hasLockRef.current) return;
//     hasLockRef.current = false;
//     // fetch(`${API_BASE}/api/projects/${projectId}/edit/stop`, {
//     fetch(`${API_BASE}/api/projects/${projectIdStr}/edit/stop`, {

//       method: "POST",
//       credentials: "include",
//       keepalive: true,
//     }).catch(() => {});
//   };

//   window.addEventListener("beforeunload", stop);

//   return () => {
//     window.removeEventListener("beforeunload", stop);
//     stop();
//   };
// }, [router.isReady, projectIdStr, API_BASE]);

useEffect(() => {
  if (!router.isReady || !projectIdStr) return;

  const stop = () => {
    fetch(`/api/projects/${projectIdStr}/edit/stop`, {
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
}, [router.isReady, projectIdStr,  router.events]);


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
const [showInstructions, setShowInstructions] = useState(true); //  new
const hasLockRef = useRef(false);



const [editingField, setEditingField] = useState<{
  section: 'impact' | 'risk' | 'assumption' | 'stakeholder';
  index: number;
  field: string;
  value: string;
  anchorRect: DOMRect | null;
} | null>(null);

const popupRef = useRef<HTMLDivElement | null>(null);
const textareaRef = useRef<HTMLTextAreaElement | null>(null);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(event.target as Node)
    ) {
      saveEditingField();
    }
  };

  if (editingField) {
    document.addEventListener('mousedown', handleClickOutside);
  };
  if (editingField && textareaRef.current) {
    textareaRef.current.focus();
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [editingField]);

useEffect(() => {
//   if (!projectId || typeof projectId !== 'string') {
// setError('Invalid or missing project ID.'); 
// return;
// }
if (!router.isReady || !projectIdStr) return;

const controller = new AbortController();
  const fetchStakeholders = async () => {
    try {
      const res = await fetch(`/api/stakeholders/${projectIdStr}`,{credentials: 'include',});
      const data = await res.json();
      setStakeholders(data);
      if (data.length === 0) {
  setStakeholders([
    {
      name: '',
      role: '',
      interest: '',
      stakeholderType: 'DIRECT',
      engagementStrategy: '',
      hierarchyLevel: 'LONG_TERM_IMPACT',
    },
  ]);
}

    } catch (err) {
      // console.error("Failed to fetch stakeholders:", err);
      setStakeholders([]);
    }
  }

  fetchStakeholders();
  return () => controller.abort();
}, [router.isReady, projectIdStr])

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
    await fetch(`/api/stakeholders/${s.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }
  const updated = [...stakeholders];
  updated.splice(index, 1);
  setStakeholders(updated);
};

  useEffect(() => {
//     if (!projectId || typeof projectId !== 'string') {
// setError('Invalid or missing project ID.'); 
// return;
// }
if (!router.isReady || !projectIdStr) return;

const controller = new AbortController();
    const fetchRows = async () => {

      try {
        const res = await fetch(`/api/impact-rows/${projectIdStr}`,{credentials: 'include',});
        
        const data = await res.json();
        setImpactRows(data);
        if (data.length === 0) {
  const newId = `temp-${Date.now()}`;
  setImpactRows([
    {
      id: newId,
      hierarchyLevel: '',
      resultStatement: '',
      indicator: '',
      indicatorDefinition: '',
      meansOfMeasurement: '',
      baseline: '',
    },
  ]);
  setSelectedSDGs({ [newId]: null });
  setSdgTargets({ [newId]: [] });
}

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
    return () => controller.abort();
 }, [router.isReady, projectIdStr]);

useEffect(() => {
//   if (!projectId || typeof projectId !== 'string') {
// setError('Invalid or missing project ID.'); 
// return;
// }
if (!router.isReady || !projectIdStr) return;

const controller = new AbortController();

const fetchRisks = async () => {
  try {
    const res = await fetch(`/api/risks?projectId=${projectIdStr}`,{credentials: 'include',});
    const data = await res.json();

    
    const formatted = data.map((r: any) => ({
      id: r.id,
      text: r.text,
      hierarchyLevels: r.hierarchies?.map((h: any) => h.hierarchy) || []
    }));

    setRisks(formatted);
    if (formatted.length === 0) {
  setRisks([
    {
      text: '',
      hierarchyLevels: [],
    },
  ]);
}

  } catch (err) {
    // console.error("Failed to fetch risks:", err);
    setRisks([]);
  }
}



  fetchRisks();
  return () => controller.abort();
}, [router.isReady, projectIdStr]);

const fetchAssumptionsAndActivities = async () => {
  try {
    const [assumptionRes, activityRes] = await Promise.all([
      fetch(`/api/assumptions/${projectIdStr}`,{credentials: 'include',}),
      fetch(`/api/activities/${projectIdStr}`,{credentials: 'include'})
    ]);

    const assumptions = await assumptionRes.json();
    const activities = await activityRes.json();

    const merged: AssumptionOrActivity[] = [
      ...assumptions.map((a: any) => ({ ...a, type: 'ASSUMPTION' })),
      ...activities.map((a: any) => ({ ...a, type: 'ACTIVITY' })),
    ];

    setAssumptionsAndActivities(merged);
    if (merged.length === 0) {
  setAssumptionsAndActivities([
    {
      type: 'ASSUMPTION',
      text: '',
    },
  ]);
}

  } catch (err) {
    // console.error("Failed to fetch assumptions/activities:", err);
    setAssumptionsAndActivities([]);
  }
};

useEffect(() => {
//   if (!projectId || typeof projectId !== 'string') {
// setError('Invalid or missing project ID.'); 
// return;
// }
if (!router.isReady || !projectIdStr) return;

const controller = new AbortController();
  fetchAssumptionsAndActivities();
  return () => controller.abort();
}, [router.isReady, projectIdStr]);



  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const res = await fetch(`/api/sdg-targets`,{credentials: 'include',});
        const data = await res.json();

        if (Array.isArray(data)) {
          setAllTargets(data);
        } else if (Array.isArray(data.targets)) {
          setAllTargets(data.targets);
        } else {
          // console.error('Unexpected SDG target format', data);
          setAllTargets([]);
        }
      } catch (error) {
        // console.error('Failed to load SDG targets:', error);
        setAllTargets([]);
      }
    };

    const fetchSDGs = async () => {
      try {
        const res = await fetch(`/api/sdgs`,{credentials: 'include',});
        const data = await res.json();
        setAllSDGs(data);
      } catch (error) {
        // console.error('Failed to load SDGs:', error);
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
    await fetch(`/api/${item.type === 'ASSUMPTION' ? 'assumptions' : 'activities'}/${item.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }
  const updated = [...assumptionsAndActivities];
  updated.splice(index, 1);
  setAssumptionsAndActivities(updated); 
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
      await fetch(`/api/impact-rows/${row.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    }
    const newRows = [...impactRows];
    newRows.splice(index, 1);
    setImpactRows(newRows);
  };

  const handleTargetChange = (rowId: string, newIds: string[]) => {
    setSdgTargets((prev) => ({ ...prev, [rowId]: newIds }));
  };

const saveAll = async (validateForDiagram: boolean = false) => {
if (validateForDiagram) {
  const missingRequired = impactRows.some((row) => {
    const rowId = row.id || '';
    return (
      !row.hierarchyLevel ||
      !row.resultStatement.trim() ||
      !selectedSDGs[rowId] ||
      !sdgTargets[rowId] ||
      sdgTargets[rowId].length === 0
    );
  });

  if (missingRequired) {
    alert("To generate the diagram, each row must have:\n- Objective Level\n- Result Statement\n- SDG\n- At least one SDG Target.");
    return false;
  }
}



    for (const [index, row] of impactRows.entries()) {
let savedRowId = row.id;

if (!savedRowId || savedRowId.startsWith('temp-')) {
  const res = await fetch(`/api/impact-rows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
  hierarchyLevel: sanitizeInput(row.hierarchyLevel),
  resultStatement: sanitizeInput(row.resultStatement),
  indicator: sanitizeInput(row.indicator),
  indicatorDefinition: sanitizeInput(row.indicatorDefinition),
  meansOfMeasurement: sanitizeInput(row.meansOfMeasurement),
  baseline: sanitizeInput(row.baseline),
  projectId,
  orderIndex: index
}),

    credentials: 'include',
  });

const created = await res.json();
const tempId = row.id!;
savedRowId = created.id;
impactRows[index].id = created.id;


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
  await fetch(`/api/impact-rows/${savedRowId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...row, orderIndex: index }),
    credentials: 'include',
  });
}


const targetIds = sdgTargets[savedRowId] || [];
const sdgId = selectedSDGs[savedRowId];

await fetch(`/api/impact-row-targets/${savedRowId}`, {
  method: 'PUT',
  credentials: 'include',
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
    await fetch(`/api/risks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...risk, projectId: projectIdStr,
 }),
      credentials: 'include',
    });
  } else {
    await fetch(`/api/risks/${risk.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
  text: sanitizeInput(risk.text),
  hierarchyLevels: risk.hierarchyLevels,
  projectId: projectIdStr,

}),

      
  credentials: 'include',

    });
  }
}
for (let i = 0; i < assumptionsAndActivities.length; i++) {
  const item = assumptionsAndActivities[i];
  const endpoint = item.type === 'ASSUMPTION' ? 'assumptions' : 'activities';
  const method = item.id ? 'PUT' : 'POST';
  const url = `/api/${endpoint}${item.id ? `/${item.id}` : ''}`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: sanitizeInput(item.text), projectId }),

    
  credentials: 'include',

  });

  if (!item.id) {
    const created = await res.json();
    assumptionsAndActivities[i].id = created.id; 
  }
}
for (let i = 0; i < stakeholders.length; i++) {
  const s = stakeholders[i];
  const method = s.id ? 'PUT' : 'POST';
  const url = s.id
    ? `/api/stakeholders/${s.id}`
    : `/api/stakeholders`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
  name: sanitizeInput(s.name),
  role: sanitizeInput(s.role),
  interest: sanitizeInput(s.interest),
  stakeholderType: s.stakeholderType,
  engagementStrategy: sanitizeInput(s.engagementStrategy),
  hierarchyLevel: s.hierarchyLevel,
  projectId: projectIdStr,

}),

    
  credentials: 'include',

  });

  if (!s.id) {
    const created = await res.json();
    stakeholders[i].id = created.id; 
  }
}



    alert('Saved successfully');
    // router.reload();
    return true;

  };
  const exportAllToExcel = () => {
  const wb = XLSX.utils.book_new();

  // 1. Impact Rows
  const impactData = impactRows.map((row) => ({
    ObjectiveLevel: row.hierarchyLevel,
    ResultStatement: row.resultStatement,
    Indicator: row.indicator,
    IndicatorDefinition: row.indicatorDefinition,
    MeansOfMeasurement: row.meansOfMeasurement,
    Baseline: row.baseline,
    SDG: (() => {
  const sdgId = selectedSDGs[row.id || ''];
  const sdg = allSDGs.find((s) => s.id === sdgId);
  return sdg ? `${sdg.code} ${sdg.name}` : '';
})(),

SDGTargets: (sdgTargets[row.id || ''] || [])
  .map((id) => {
    const target = allTargets.find((t) => t.id === id);
    return target ? `${target.code} ${target.title}` : id;
  })
  .join('; ')


  }));
  const impactSheet = XLSX.utils.json_to_sheet(impactData);
  XLSX.utils.book_append_sheet(wb, impactSheet, "Impact Rows");

  // 2. Risks
  const risksData = risks.map((r) => ({
    Risk: r.text,
    ObjectiveLevels: r.hierarchyLevels.join(', ')
  }));
  const risksSheet = XLSX.utils.json_to_sheet(risksData);
  XLSX.utils.book_append_sheet(wb, risksSheet, "Risks");

  // 3. Assumptions & Activities
  const aaData = assumptionsAndActivities.map((item) => ({
    Type: item.type,
    Description: item.text
  }));
  const aaSheet = XLSX.utils.json_to_sheet(aaData);
  XLSX.utils.book_append_sheet(wb, aaSheet, "Assumptions & Activities");

  // 4. Stakeholders
  const stakeholdersData = stakeholders.map((s) => ({
    Name: s.name,
    Role: s.role,
    Interest: s.interest,
    StakeholderType: s.stakeholderType,
    EngagementStrategy: s.engagementStrategy,
    ObjectiveLevel: s.hierarchyLevel
  }));
  const stakeholdersSheet = XLSX.utils.json_to_sheet(stakeholdersData);
  XLSX.utils.book_append_sheet(wb, stakeholdersSheet, "Stakeholders");

  // Export
  XLSX.writeFile(wb, "OQI_Impact_Workbook.xlsx");
};

const addRisk = () => {
  setRisks(prev => [
    ...prev,
    {
      text: '',
      hierarchyLevels: [], 
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
    await fetch(`/api/risks/${r.id}`, {
      method: 'DELETE',
      
  credentials: 'include',

      
    })
  }
  const updated = [...risks]
  updated.splice(index, 1)
  setRisks(updated)
}

// if (loading) return <p>Loading...</p>;
// if (isInvalidId) return <p style={{ color: 'red' }}>Invalid Project ID</p>;
// if (error) return <p style={{ color: 'red' }}>{error}</p>;
if (!router.isReady) return <p>Loading...</p>;
if (!projectIdStr) return <p style={{ color: "red" }}>Invalid Project ID</p>;
if (error) return <p style={{ color: "red" }}>{error}</p>;
if (loading) return <p>Loading...</p>;

const saveEditingField = () => {
  if (!editingField) return;
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
};


return (
  <div className={styles.container}>


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
        <li>Fill in the tables below.</li>
        <li>Save final work once done.</li>
        <li>
          After filling mandatory fields, use <strong>Generate Diagram</strong> to
          build the Theory of Change.
        </li>
        <li>Proceed to view the Diagram and SDG Interlinkage Matrix.</li>
      </ol>
    </div>
  )}
</div>



    
<h1 className={styles.Title}>Indicator Matrix</h1>
<p className={styles.note}>
  
  Use this matrix to define what your solution aims to achieve at each result level and how change will be measured. Start from long-term impact down to deliverables.  
Please refer to the full <a href="/user-guide" target="_blank" rel="noopener noreferrer">
     User Guide 
  </a> for detailed explanations and guidance. 

</p>
    <div className={styles.tableWrapper}>
      <table className={styles.softTable}>

        <thead>
          <tr>
                        <th className={styles.tooltipHeader}>
  Objective level <span style={{ color: "#ffffffff" }}>*</span>
  <span className={styles.tooltipText}>
      The stage in the causal pathway when the result occurs (e.g. as Deliverable, Short-Term Impact, Mid-Term Impact, Long-Term Impact). 
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  Result Statement<span style={{ color: "#ffffffff" }}>*</span>
  <span className={styles.tooltipText}>
    The change or outcome that happens as a consequence of the project.
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  Indicator <span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
    A measurable variable used to track progress and show whether a change or result is happening. It signals to us if our project is working as expected or not. It determines how much change has occurred. They can be both quantitative (e.g., % increase in access) or qualitative (e.g., user satisfaction).
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  Indicator Definition <span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
   What the indicator means and how it will be calculated/quantified.
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  Means of Measurement <span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
    How or by what method, source, or tool the data will be measured
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  Baseline <span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
   The starting point/status on of the problem you are adressing before your solution (please cite references here).
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  SDG <span style={{ color: "#ffffffff" }}>*</span>
  <span className={styles.tooltipText}>
    Sustainable Development Goals (SDGs) address the global challenges we face, including those related to poverty, inequality, climate change, environmental degradation, peace and justice.
  </span>
</th>
                        <th className={styles.tooltipHeader}>
  SDG Target <span style={{ color: "#ffffffff" }}>*</span>
  <span className={styles.tooltipText}>
    An SDG target is a specific, measurable objective linked to one of the Sustainable Development Goals (SDGs) that defines what we aim to achieve by a set date (often 2030). Examples for the targets can be found in the useful resources section. 
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
  style={{
    height: "36px",
    padding: "4px 36px 4px 12px", 
    fontSize: "12px",
    lineHeight: "1.5",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><polyline points='6 9 12 15 18 9'/></svg>")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center", // ← make arrow sit nicely
    backgroundSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    cursor: "pointer",
  }}
>
  <option value="">-- Select --</option>
  <option value="LONG_TERM_IMPACT">Long-Term Impact</option>
  <option value="MID_TERM_IMPACT">Mid-Term Impact</option>
  <option value="SHORT_TERM_IMPACT">Short-Term Impact</option>
  <option value="OUTPUT">Deliverable</option>
</select>


) : (
<input
  title={row[field]}
  value={row[field]}
  placeholder={
    field === 'resultStatement' ? 'Enter result...'
    : field === 'indicator' ? 'Indicator...'
    : field === 'indicatorDefinition' ? 'Describe indicator definition...'
    : field === 'meansOfMeasurement' ? 'Specify measurement method...'
    : field === 'baseline' ? 'Baseline value...'
    : ''
  }
  readOnly
  onClick={(e) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setEditingField({
      section: 'impact',
      index,
      field,
      value: row[field],
      anchorRect: rect,
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
  style={{
    height: "36px",
    padding: "0 25px 0 12px", 
    fontSize: "12px",
    lineHeight: "1.5",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><polyline points='6 9 12 15 18 9'/></svg>")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center", 
    backgroundSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    cursor: "pointer",
  }}
>
  <option value="">--</option>
  {[...allSDGs]
    .sort((a, b) => Number(a.code) - Number(b.code))
    .map((sdg) => (
      <option key={sdg.id} value={sdg.id}>
        {sdg.code} - {sdg.name}
      </option>
    ))}
</select>




              </td>
              <td style={{ minHeight: '48px', verticalAlign: 'middle' }}>
  {selectedSDGs[row.id || ''] ? (
    <SDGDropdown 
      allTargets={allTargets.filter(
        (t) => t.sdgId === selectedSDGs[row.id || '']
      )}
      selectedTargetIds={sdgTargets[row.id || ''] || []}
      onChange={(ids) => handleTargetChange(row.id || '', ids)}
    />
  ) : (
    <div style={{ height: '38px' }}></div> 
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
<button
  title="Add Row"
  className={styles.addCircleButton}
  onClick={addRow} 
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
      stroke="#111730"
      strokeWidth="1.5"
      fill="none"
    />
    <path d="M8 12H16" stroke="#111730" strokeWidth="1.5" />
    <path d="M12 16V8" stroke="#111730" strokeWidth="1.5" />
  </svg>
</button>

    </div>
    <hr className={styles.horizontalDivider} />


    
    
    <div className={styles.twoColumnSection}>
      {/* Risks */}
      <div className={styles.column}>
        
        <div className={styles.sectionHeader}>
  <h1 className={styles.Title}>Risks</h1>
  <p className={styles.note}>
    Fill in here the risks (challenges or external factors that could hinder achievement of your outcomes). For each risk, identify the specific objective level it may affect.
To better understand how to assess or categorize risks, refer to the <a href="/user-guide" target="_blank" rel="noopener noreferrer">
     User Guide 
  </a> and useful resources.

  </p>
</div>

        
        <div className={styles.tableWrapper}>
          
          <table className={styles.softTable}>
            <thead>
              <tr>
                <th className={styles.tooltipHeader}>
  Risk 
  <span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
    Potential threat or challenge that could deter a project from achieving its intended results.
  </span>
</th>
                <th className={styles.tooltipHeader}>
  Objective level <span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
    The stage in the causal pathway where the result occurs (Deliverable, Short-Term Impact, Mid-Term Impact, Long-Term Impact).
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
  placeholder="Specify risk..."
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
<button
  title="Add Risk"
  className={styles.addCircleButton}
  onClick={addRisk} 
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
      stroke="#111730"
      strokeWidth="1.5"
      fill="none"
    />
    <path d="M8 12H16" stroke="#111730" strokeWidth="1.5" />
    <path d="M12 16V8" stroke="#111730" strokeWidth="1.5" />
  </svg>
</button>
        </div>
      </div>

      {/* Assumptions & Activities */}
      <div className={styles.column}>
        <div className={styles.sectionHeader}>
  
  <h1 className={styles.Title}>Assumptions & Activities Table</h1>
  <p className={styles.note}>
    Fill in here the key conditions that must hold true for your solution’s anticipated change to succeed (assumptions) and the activities you plan to take to mitigate potential issues that may deter.
If you need more information and help on this, refer to the <a href="/user-guide" target="_blank" rel="noopener noreferrer">
     User Guide 
  </a> for guidance.

  </p>
</div>

        <div className={styles.tableWrapper}>
          <table className={styles.softTable}>
            <thead>
              <tr>
                <th className={styles.tooltipHeader}>
  Activity/ Assumption
    <span style={{ color: "#ffffffff" }}></span> 
   <span className={styles.tooltipText}>
    Activities undertaken using your solution to produce outputs and drive change. /
    Factor or condition that you assume will hold true for the project to succeed at each level of the change.
  </span> 
</th>
                <th className={styles.tooltipHeader}>
  Description 
   <span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
    Describe the Activity/Assumption in more details.
  </span> 
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
                      style={{
    height: "36px",
    padding: "4px 36px 4px 12px", 
    fontSize: "12px",
    lineHeight: "1.5",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><polyline points='6 9 12 15 18 9'/></svg>")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center", 
    backgroundSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    cursor: "pointer",
  }}
                    >
                      <option value="ASSUMPTION">Assumption</option>
                      <option value="ACTIVITY">Activity</option>
                    </select>
                  </td>
                  <td>
<input
  value={item.text}
  placeholder="Description"
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
  title="Add Assumption/Activity"
  className={styles.addCircleButton}
  onClick={() =>
    setAssumptionsAndActivities((prev = []) => [
      ...prev,
      { type: 'ASSUMPTION', text: '' },
    ])
  }
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
      stroke="#111730"
      strokeWidth="1.5"
      fill="none"
    />
    <path d="M8 12H16" stroke="#111730" strokeWidth="1.5" />
    <path d="M12 16V8" stroke="#111730" strokeWidth="1.5" />
  </svg>
</button>

        </div>
      </div>
    </div>
<hr className={styles.horizontalDivider} />

    

    <h1 className={styles.Title}>Stakeholders Matrix</h1>
     <p className={styles.note}>
      Map your anticipated stakeholders to be involved or affected by your solution. Define their roles, interests, engagement type (direct/indirect), and how you intend to engage them (strategy). 
Refer to the <a href="/user-guide" target="_blank" rel="noopener noreferrer">
     User Guide 
  </a> for reference and guidance.

     </p>
   

    <div className={styles.tableWrapper}>
      <table className={styles.softTable}>
        <thead>
          <tr>
                                    <th className={styles.tooltipHeader}>
  Stakeholder <span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
    Key people, groups of people and organisations that are directly and indirectly involved in the implementation, monitoring of the project/solution or a affected by it.

  </span>
</th>
                                    <th className={styles.tooltipHeader}>
  Role <span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
    Describe what this stakeholder does and how they are involved in the project.
  </span>
</th>
                                    <th className={styles.tooltipHeader}>
Interest <span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
    What is the stakeholder's benefit from engagement?

  </span>
</th>
                                    <th className={styles.tooltipHeader}>
  Stakeholder Type <span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
    Indicate whether they are direct or indirect stakeholders.
  </span>
</th>
                                    <th className={styles.tooltipHeader}>
Engagement Strategy<span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
   How will the stakeholder be mobilised/convinced to be involved and supportive? 
  </span>
</th>
            <th className={styles.tooltipHeader}>
Objective level<span style={{ color: "#ffffffff" }}></span>
  <span className={styles.tooltipText}>
   The stage in the causal pathway when the result occurs (e.g. as Deliverable, Short-Term Impact, Mid-Term Impact, Long-Term Impact).
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
          placeholder="Enter stakeholder name..."
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
          placeholder="Specify role..."
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
           placeholder="Specify benefit..."
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
          style={{
    height: "36px",
    padding: "4px 36px 4px 12px",
    fontSize: "12px",
    lineHeight: "1.5",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><polyline points='6 9 12 15 18 9'/></svg>")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    cursor: "pointer",
  }}
        >
          <option value="DIRECT">Direct</option>
          <option value="INDIRECT">Indirect</option>
        </select>
      </td>
      <td>
        <input
          value={s.engagementStrategy}
           placeholder="Specify Strategy..."
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
          style={{
    height: "36px",
    padding: "4px 36px 4px 12px", 
    fontSize: "12px",
    lineHeight: "1.5",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><polyline points='6 9 12 15 18 9'/></svg>")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center", 
    backgroundSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    cursor: "pointer",
  }}
        >
          <option value="LONG_TERM_IMPACT">Long Term</option>
          <option value="MID_TERM_IMPACT">Mid Term</option>
          <option value="SHORT_TERM_IMPACT">Short Term</option>
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
<button
  title="Add Stakeholder"
  className={styles.addCircleButton}
  onClick={addStakeholder} 
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
      stroke="#111730"
      strokeWidth="1.5"
      fill="none"
    />
    <path d="M8 12H16" stroke="#111730" strokeWidth="1.5" />
    <path d="M12 16V8" stroke="#111730" strokeWidth="1.5" />
  </svg>
</button>
    </div>

    {/* Final Buttons */}
<div className="actionIconBar">
  <button className="actionIcon" title="Save" onClick={() => saveAll(false)}>
    <i className="uil uil-save"></i>
  </button>

<button 
  className="actionIcon" 
  title="Generate Diagram"
  onClick={async () => {
    const ok = await saveAll(true);
    if (ok) router.push(`/project/${projectIdStr}/diagram?regenerate=true`);
  }}
>
  <svg 
    viewBox="0 0 512 512" 
    fill="#ffffff" 
    width="20" 
    height="20"
    style={{ display: "block" }}
  >
    <path d="M426.666667,320 L426.666,383.999 L490.666667,384 L490.666667,426.666667 L426.666,426.666 L426.666667,490.666667 L384,490.666667 L383.999,426.666 L320,426.666667 L320,384 L383.999,383.999 L384,320 L426.666667,320 Z M341.333333,42.6666667 L405.333333,106.666667 L405.332667,298.666667 L362.666667,298.666667 L362.666667,362.666667 L298.666667,362.666667 L298.665667,426.666667 L106.666667,426.666667 L42.6666667,362.666667 L42.6666667,42.6666667 L341.333333,42.6666667 Z M320,85.3333333 L85.3333333,85.3333333 L85.3333333,341.333333 L320,341.333333 L320,85.3333333 Z M170.666667,128 L170.666667,149.333 L213.333333,149.333333 L213.332667,256 L234.666667,256 L234.666667,234.666667 L298.666667,234.666667 L298.666667,298.666667 L234.666667,298.666667 L234.666667,277.332667 L170.666667,277.333 L170.666667,298.666667 L106.666667,298.666667 L106.666667,234.666667 L170.666667,234.666667 L170.666667,256 L191.999667,256 L191.999667,170.666 L170.666667,170.666 L170.666667,192 L106.666667,192 L106.666667,128 L170.666667,128 Z"/>
  </svg>
</button>


{/* <button 
  className="actionIcon" 
  title="Edit Diagram"
  onClick={() => router.push(`/project/${projectId}/diagram`)}
>
  <svg 
    viewBox="0 0 512 512" 
    fill="#ffffff" 
    width="20" 
    height="20"
    style={{ display: "block" }}
  >
    <path d="M64,64 L362.666667,64 L426.666667,128 L426.666667,448 L128,448 L64,384 L64,64 Z 
             M341.333333,106.666667 L106.666667,106.666667 L106.666667,362.666667 
             L341.333333,362.666667 L341.333333,106.666667 Z 
             M192,149.333333 L192,170.666667 L234.666667,170.666667 
             L234.666,277.333333 L256,277.333333 L256,256 L320,256 L320,320 
             L256,320 L256,298.666667 L192,298.666333 L192,320 L128,320 
             L128,256 L192,256 L192,277.333333 L213.333,277.333333 
             L213.333,191.999333 L192,192 L192,213.333333 L128,213.333333 
             L128,149.333333 L192,149.333333 Z"/>
  </svg>
</button> */}


  <button className="actionIcon" title="Export as Excel"
    onClick={exportAllToExcel}>
    <i className="uil uil-import"></i>
  </button>

<button className="actionIcon" title="Edit SDG Interlinkage"
  onClick={() => router.push(`/project/${projectIdStr}/matrix`)}>
  
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
      position: "absolute",
      zIndex: 1000,
    }}
  >
   <div style={{ position: "relative" }}>
  <textarea
    ref={textareaRef}
    value={editingField.value}
    onChange={(e) => {
      const text = e.target.value;
      const MAX_CHARS = 95;
      setEditingField({
        ...editingField,
        value: text.slice(0, MAX_CHARS),
      });
    }}
    onBlur={saveEditingField}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        saveEditingField();
      } else if (e.key === "Escape") {
        setEditingField(null);
      }
    }}
    className={styles.textarea}
  />

  
  <div
    style={{
      position: "absolute",
      bottom: "0px",      
      right: "4px",
      fontSize: "10px",
      color: "rgba(0, 0, 0, 0.57)",
      pointerEvents: "none",
    }}
  >
    {editingField.value.length} / 95
  </div>
</div>

  </div>
)}

  </div>
);
}