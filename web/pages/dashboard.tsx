// pages/project/[projectId].tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/project.module.css";

interface ImpactRow {
  id?: string;
  hierarchyLevel: string;
  resultStatement: string;
  indicator: string;
  indicatorDefinition: string;
  meansOfMeasurement: string;
  baseline: string;
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

export default function ProjectDetail() {
  const router = useRouter();
  const { projectId } = router.query;

  const [impactRows, setImpactRows] = useState<ImpactRow[]>([]);
  const [sdgs, setSdgs] = useState<SDG[]>([]);
  const [targets, setTargets] = useState<SDGTarget[]>([]);
  const [selectedSDG, setSelectedSDG] = useState<{ [rowId: string]: number }>({});
  const [selectedTargets, setSelectedTargets] = useState<{ [rowId: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    fetch(`http://localhost:4000/impact-rows/${projectId}`)
      .then(res => res.json())
      .then(data => setImpactRows(data))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    fetch("http://localhost:4000/sdg-targets")
      .then(res => res.json())
      .then(data => {
        setTargets(data.targets || []);
        const uniqueSdgs: { [id: number]: SDG } = {};
        data.targets.forEach((t: SDGTarget) => {
          uniqueSdgs[t.sdgId] = {
            id: t.sdgId,
            code: String(t.code.split(".")[0]),
            name: "" // You can fetch SDG name separately if needed
          };
        });
        setSdgs(Object.values(uniqueSdgs));
      });
  }, []);

  const handleFieldChange = (index: number, field: keyof ImpactRow, value: string) => {
    const updated = [...impactRows];
    updated[index][field] = value;
    setImpactRows(updated);
  };

  const addRow = () => {
    const tempId = `temp-${Date.now()}`;
    setImpactRows(prev => [
      ...prev,
      {
        id: tempId,
        hierarchyLevel: "",
        resultStatement: "",
        indicator: "",
        indicatorDefinition: "",
        meansOfMeasurement: "",
        baseline: ""
      }
    ]);
  };

  const deleteRow = (index: number) => {
    const updated = [...impactRows];
    updated.splice(index, 1);
    setImpactRows(updated);
  };

  const saveRows = async () => {
    for (const row of impactRows) {
      let savedRow = row;
      if (!row.id?.startsWith("temp-")) {
        await fetch(`http://localhost:4000/impact-rows/${row.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row)
        });
      } else {
        const res = await fetch("http://localhost:4000/impact-rows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...row, projectId })
        });
        const created = await res.json();
        savedRow = { ...row, id: created.id };
      }

      const targetId = selectedTargets[savedRow.id!];
      if (targetId) {
        await fetch("http://localhost:4000/impact-row-targets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            impactRowId: savedRow.id,
            sdgTargetId: targetId
          })
        });
      }
    }

    alert("Saved.");
  };

  if (loading) return <p>Loading...</p>;

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
          {impactRows.map((row, i) => (
            <tr key={row.id}>
              <td>
                <select value={row.hierarchyLevel} onChange={e => handleFieldChange(i, "hierarchyLevel", e.target.value)}>
                  <option value="">Select</option>
                  <option value="LONG_TERM_IMPACT">Long-Term Impact</option>
                  <option value="MID_TERM_IMPACT">Mid-Term Impact</option>
                  <option value="SHORT_TERM_IMPACT">Short-Term Impact</option>
                  <option value="OUTPUT">Output</option>
                  <option value="ACTIVITY">Activity</option>
                </select>
              </td>
              <td><input value={row.resultStatement} onChange={e => handleFieldChange(i, "resultStatement", e.target.value)} /></td>
              <td><input value={row.indicator} onChange={e => handleFieldChange(i, "indicator", e.target.value)} /></td>
              <td><input value={row.indicatorDefinition} onChange={e => handleFieldChange(i, "indicatorDefinition", e.target.value)} /></td>
              <td><input value={row.meansOfMeasurement} onChange={e => handleFieldChange(i, "meansOfMeasurement", e.target.value)} /></td>
              <td><input value={row.baseline} onChange={e => handleFieldChange(i, "baseline", e.target.value)} /></td>
              <td>
                <select
                  value={selectedSDG[row.id!]}
                  onChange={(e) => {
                    const sdgId = parseInt(e.target.value);
                    setSelectedSDG(prev => ({ ...prev, [row.id!]: sdgId }));
                    setSelectedTargets(prev => ({ ...prev, [row.id!]: "" }));
                  }}
                >
                  <option value="">Select SDG</option>
                  {sdgs.map(sdg => (
                    <option key={sdg.id} value={sdg.id}>{sdg.code} - {sdg.name}</option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={selectedTargets[row.id!]}
                  onChange={e => setSelectedTargets(prev => ({ ...prev, [row.id!]: e.target.value }))}
                >
                  <option value="">Select Target</option>
                  {targets.filter(t => t.sdgId === selectedSDG[row.id!]).map(t => (
                    <option key={t.id} value={t.id}>{t.code} - {t.title}</option>
                  ))}
                </select>
              </td>
              <td>
                <button className={styles.deleteBtn} onClick={() => deleteRow(i)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className={styles.addRowBtn} onClick={addRow}>➕ Add Row</button>
      <button className={styles.saveBtn} onClick={saveRows}>💾 Save</button>
    </div>
  );
}
