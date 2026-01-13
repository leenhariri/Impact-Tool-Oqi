import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import styles from "../styles/dashboard.module.css";
import "nice-forms.css";
import CollaboratorPicker from "../components/CollaboratorPicker";
function sanitizeInput(value: string): string {
  return value
    .trim()
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/[<>]/g, '');
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [collaborators, setCollaborators] = useState("");
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
const [editTitle, setEditTitle] = useState("");
const [editDesc, setEditDesc] = useState("");
const [editCollaborators, setEditCollaborators] = useState("");
const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
const [filterRole, setFilterRole] = useState("All");
const [searchTerm, setSearchTerm] = useState("");
// Create modal collaborators (chips)
const [collabEmails, setCollabEmails] = useState<string[]>([]);
// Edit modal collaborators (chips)
const [editCollabEmails, setEditCollabEmails] = useState<string[]>([]);
const [lockModal, setLockModal] = useState<{ open: boolean; name: string }>({
  open: false,
  name: "",
});
const [editingCache, setEditingCache] = useState<
  Record<string, { name: string; lastSeen: number }>
>({});
const projectsReqSeq = useRef(0);


useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    const dropdowns = document.querySelectorAll(`.${styles.dropdownMenu}`);
    dropdowns.forEach((menu) => {
      if (!menu.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    });
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

const [showCreateModal, setShowCreateModal] = useState(false);

const toggleDropdown = (id: string) => {
  setDropdownOpen(prev => (prev === id ? null : id));
};

useEffect(() => {
  if (selectedProject) {
    setEditTitle(selectedProject.title);
    setEditDesc(selectedProject.description || "");
// setEditCollaborators(
//   selectedProject.members
//     .filter((m: any) => m.role !== "OWNER")
//     .map((m: any) => m.user?.email)
//     .filter(Boolean) // remove nulls in case a user relation is missing
//     .join(", ")
// );
// setEditCollabEmails(
//   selectedProject.members
//     .filter((m: any) => m.role !== "OWNER")
//     .map((m: any) => m.user?.email)
//     .filter(Boolean)
// );
setEditCollabEmails(
  (selectedProject.members ?? [])
    .filter((m: any) => m.role !== "OWNER")
    .map((m: any) => m.user?.email)
    .filter(Boolean)
);

  }
}, [selectedProject]);


  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => router.push("/login"));
  }, []);

  // useEffect(() => {
  //   if (user) {
  //     fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/projects`, {
  //       credentials: "include",
  //     })
  //       .then((res) => res.json())
  //       .then((data) => setProjects(data.projects));
  //   }
  // }, [user]);
// const fetchProjects = async () => {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/projects`, {
//     credentials: "include",
//   });
//   const data = await res.json();
//   setProjects(data.projects || []);
// };
const fetchProjects = async () => {
  const seq = ++projectsReqSeq.current;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/projects`, {
    credentials: "include",
  });

  const data = await res.json();

 
  if (seq !== projectsReqSeq.current) return;

  const nextProjects = data.projects || [];
  setProjects(nextProjects);

  
  const now = Date.now();
  setEditingCache((prev) => {
    const next = { ...prev };

    for (const p of nextProjects) {
      if (p.currentlyEditing?.name) {
        next[p.id] = { name: p.currentlyEditing.name, lastSeen: now };
      }
    }

    
    const GRACE_MS = 6000;
    for (const [projectId, info] of Object.entries(next)) {
      if (now - info.lastSeen > GRACE_MS) {
        delete next[projectId];
      }
    }

    return next;
  });
};

useEffect(() => {
  if (!user) return;

  fetchProjects();

  const interval = setInterval(() => {
    fetchProjects();
  }, 1_000);

  return () => clearInterval(interval);
}, [user]);

const openProject = async (projectId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/projects/${projectId}/edit/start`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (res.status === 423) {
    const data = await res.json();
    setLockModal({
      open: true,
      name: data?.editingBy?.name ?? "Someone",
    });
    return;
  }

  if (!res.ok) {
    alert("Could not open project.");
    return;
  }

  router.push(`/project/${projectId}`);
};

const handleCreate = async () => {
  setError("");
  if (!title) return setError("Project title is required");

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/projects`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: sanitizeInput(title),
        description: sanitizeInput(description),
        // collaborators: collaborators
        //   .split(",")
        //   .map((email) => ({ email: email.trim(), role: "EDITOR" })),
        collaborators: collabEmails.map((email) => ({ email, role: "EDITOR" })),

      }),
    });

    if (!response.ok) {
      const result = await response.json();

      if (result.code === "P2002") {
        setError("You already have a project with this title.");
      } else if (result.missingEmails?.length) {
        setError(`These collaborators were not found: ${result.missingEmails.join(", ")}`);
      } else {
        setError(result.error || "Failed to create project");
      }
      return;
    }

    const newProject = await response.json();
    setProjects((prev: any) => [...prev, newProject]);

   
    setShowCreateModal(false);

    
    setTitle("");
    setDescription("");
    // setCollaborators("");
    setCollabEmails([]);

    setError("");
  } catch (err: any) {
    setError(err.message);
  }
};


  if (!user) return <p>Loading...</p>;

 return (
  <div style={{ position: "relative", zIndex: 1 }} className={styles.container}>
    {/* <div className={styles.instructions}>
      <h2 className="font-bold text-lg mb-2">Instructions</h2>
      <ol className="list-decimal list-inside text-sm">
        <li>Enter a unique project title, add an optional description, and click Create to start your new project.</li>
        <li>Click to view/edit an existing project.</li>
      </ol>
    </div> */}

    <div className={styles.tableHeader}>
  <h1 className={styles.Title}>Projects</h1>

  <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
    Create Project
  </button>
</div>
<div className={styles.filterBar}>
  {/* Filter dropdown */}
  <div className={styles.filterGroup}>
    <label htmlFor="roleFilter" className={styles.filterLabel}>
      <i className="fa fa-filter" style={{ marginRight: "6px" }}></i> Filter
    </label>
    <select
      id="roleFilter"
      value={filterRole}
      onChange={(e) => setFilterRole(e.target.value)}
      className={styles.filterSelect}
    >
      <option value="All">All</option>
      <option value="Owner">Owner</option>
      <option value="Editor">Editor</option>
    </select>
  </div>

  {/* Search box */}
  <div className={styles.searchGroup}>
    <input
      type="text"
      placeholder="Search by project name..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className={styles.searchInput}
    />
  </div>
</div>

<table className={styles.projectTable}>
<thead>
  <tr>
    <th>Name</th>
    <th>Members</th>
    <th>Requester</th>
    <th>Currently editing</th>
    <th>Created</th>
    <th></th>
  </tr>
</thead>

  <tbody>
  {projects.length === 0 ? (
    <tr>
      <td colSpan={6}>
        <div className={styles.emptyState}>
          No projects yet — create one above.
        </div>
      </td>
    </tr>
  ) : (
      projects
  .filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      filterRole === "All" ||
      p.members.some((m: any) => {
        if (filterRole === "Owner") return m.role === "OWNER";
        if (filterRole === "Editor") return m.role === "EDITOR";
        return true;
      });
    return matchesSearch && matchesRole;
  })
  .map((p: any) => (

        <tr key={p.id}>
          <td className={styles.nameCell}>
            <span className={styles.avatar}>PR</span>
{/* <a
  href={`/project/${p.id}`}
  className={styles.projectLink}
  style={{ textDecoration: "underline", color: "#111827" }}
>
  {p.title}
</a> */}
<button
  type="button"
  className={styles.projectLink}
  onClick={() => openProject(p.id)}
  style={{
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    textDecoration: "underline",
    color: "#111827",
    textAlign: "left",
  }}
>
  {p.title}
</button>


          </td>
<td>
  <ul style={{ paddingLeft: 0, margin: 0, listStyle: "none" }}>
    {p.members.map((m: any) => (
      <li key={m.userId || m.id} style={{ marginBottom: "2px" }}>
        {m.user?.email || m.user?.name || "(unknown)"}
        {m.role === "OWNER" && " (Owner)"}
      </li>
    ))}
  </ul>
</td>

          <td>{p.members.find((m: any) => m.role === "OWNER")?.user?.email || "Unknown"}</td>
          {/* <td>
  {p.currentlyEditing ? (
    <span style={{ color: "#b7791f", fontWeight: 600 }}>
      {p.currentlyEditing.name}
    </span>
  ) : (
    <span style={{ color: "#9ca3af" }}>—</span>
  )}
</td> */}
<td>
  {(() => {
    const cached = editingCache[p.id];
    const GRACE_MS = 6000;

    const name =
      p.currentlyEditing?.name ||
      (cached && Date.now() - cached.lastSeen <= GRACE_MS ? cached.name : null);

    return name ? (
      <span style={{ color: "#b7791f", fontWeight: 600 }}>{name}</span>
    ) : (
      <span style={{ color: "#9ca3af" }}>—</span>
    );
  })()}
</td>

          <td>{new Date(p.createdAt).toLocaleString()}</td>
          <td>
            <div className={styles.actionsDropdown}>
              <button onClick={() => toggleDropdown(p.id)}>⋮</button>
              {dropdownOpen === p.id && (
                <div className={styles.dropdownMenu}>
                  <button onClick={() => setSelectedProject(p)}>Edit Project</button>
                  <button
                    onClick={async () => {
                      if (!confirm("Are you sure you want to delete this project?")) return;
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/projects/${p.id}`, {
                          method: "DELETE",
                          credentials: "include",
                        });
                        if (!res.ok) throw new Error("Failed to delete project");
                        setProjects((prev) => prev.filter((proj) => proj.id !== p.id));
                        setSelectedProject(null);
                      } catch (err) {
                        alert("Error deleting project.");
                      }
                    }}
                  >
                    Delete Project
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>


    {selectedProject && (
      <div className={styles.modalBackdrop} onClick={() => {
        setSelectedProject(null);
        setIsEditing(false);
      }}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

          {/* ICONS top-right */}
          <div className={styles.modalHeaderIcons}>
            {!isEditing && selectedProject.ownerUserId === user?.uid && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className={styles.iconButton}
                  title="Edit Project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                    viewBox="0 0 16 16" className={styles.iconSvg}>
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                  </svg>
                </button>

                <button
                  onClick={async () => {
                    if (!confirm("Are you sure you want to delete this project?")) return;
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/projects/${selectedProject.id}`, {
                        method: "DELETE",
                        credentials: "include",
                      });
                      if (!res.ok) throw new Error("Failed to delete project");
                      setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
                      setSelectedProject(null);
                    } catch (err) {
                      alert("Error deleting project.");
                    }
                  }}
                  className={styles.iconButton}
                  title="Delete Project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                    viewBox="0 0 16 16" className={styles.iconSvg}>
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Title */}
{isEditing ? (
  <>

<h2 className={styles.modalTitle}>Edit Project</h2>
<p className={styles.modalDescription}>
Update the title, optional description, or invite new collaborators.
</p>

<input
  type="text"
  className={styles.modalInput}
  placeholder="Name *"
  value={editTitle}
  onChange={(e) => setEditTitle(e.target.value)}
/>

<textarea
  placeholder="Description (optional)"
  className={styles.modalInput}
  value={editDesc}
  onChange={(e) => setEditDesc(e.target.value)}
/>

{/* <input
  type="text"
  className={styles.modalInput}
  placeholder="Invite collaborators (emails, comma-separated)"
  value={editCollaborators}
  onChange={(e) => setEditCollaborators(e.target.value)}
/> */}

<CollaboratorPicker
  valueEmails={editCollabEmails}
  onChangeEmails={setEditCollabEmails}
/>

    {/* ===== Edit Mode Buttons ===== */}
    <div className={styles.modalActions}>
      <button
        className="nice-button"
        style={{
          marginTop: "1.5rem",
          backgroundColor: "#f3f4f6",
          color: "#111827",
          border: "1px solid #ccc",
        }}
        onClick={() => setIsEditing(false)}
      >
        Cancel
      </button>

      <button
        className="nice-button"
        style={{ marginTop: "1.5rem" }}
        onClick={async () => {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE}/api/projects/${selectedProject.id}`,
              {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: editTitle,
                  description: editDesc,
                  // collaborators: editCollaborators
                  //   .split(",")
                  //   .map((email) => ({
                  //     email: email.trim(),
                  //     role: "EDITOR",
                  //   })),
                  collaborators: editCollabEmails.map((email) => ({
  email,
  role: "EDITOR",
})),

                }),
              }
            );
            const result = await res.json();
            if (!res.ok) {
              if (result.code === "P2002") {
                alert("You already have a project with this title.");
              } else if (result.missingEmails?.length) {
                alert(
                  `These collaborators were not found: ${result.missingEmails.join(", ")}`
                );
              } else {
                alert(result.error || "Failed to update project");
              }
              return;
            }
            // setSelectedProject(result);
            
const fullRes = await fetch(
  `${process.env.NEXT_PUBLIC_API_BASE}/api/projects/${selectedProject.id}`,
  { credentials: "include" }
);

if (fullRes.ok) {
  const json = await fullRes.json();

  
  const fullProject = json.project ?? json;
console.log("FULL PROJECT", fullProject);
console.log("FULL MEMBERS", fullProject?.members);

  setSelectedProject(fullProject);


  setProjects((prev: any) =>
    prev.map((p: any) => (p.id === fullProject.id ? fullProject : p))
  );
} else {
 
  setSelectedProject(result);
}

setIsEditing(false);

            
          } catch (err) {
            alert("Failed to update project");
          }
        }}
      >
        Save Changes
      </button>
    </div>
  </>
) : (
  <>
    {/* ===== VIEW MODE INFO ===== */}
    <div className="styled-dl-template">
      <dl className="definition-list">
        <dt>Project Title</dt>
        <dd>{selectedProject.title}</dd>

        <dt>Description</dt>
        <dd>{selectedProject.description || "No description"}</dd>

        <dt>Members</dt>
        <dd>
          <ul style={{ paddingLeft: "1rem", margin: 0 }}>
            {(selectedProject?.members ?? []).map((m: any) => (
              <li key={m.userId || m.id}>
                {m.user?.email || m.user?.name || "(unknown)"}{" "}
                {m.role === "OWNER" && "(Owner)"}
              </li>
            ))}
          </ul>
        </dd>
      </dl>
    </div>

    <div className={styles.modalActions}>
      <button
        className="nice-button"
        onClick={() => {
          setSelectedProject(null);
          // router.push(`/project/${selectedProject.id}`);
          openProject(selectedProject.id);

        }}
      >
        Open Project →
      </button>
    </div>
  </>
)}



        </div>
      </div>
    )}
    {showCreateModal && (
  <div className={styles.modalBackdrop} onClick={() => setShowCreateModal(false)}>
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeaderIcons}>
        <button onClick={() => setShowCreateModal(false)} className={styles.iconButton}>✖</button>
      </div>
      <h2 className={styles.modalTitle}>Create Project</h2>
      <p className={styles.modalDescription}>
        Enter a unique project title, add an optional description, and click Create to start your new project.
      </p>

      <input
        type="text"
        className={styles.modalInput}
        placeholder="Name *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description (optional)"
        className={styles.modalInput}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {/* <input
        type="text"
        className={styles.modalInput}
        placeholder="Invite collaborators (emails, comma-separated)"
        value={collaborators}
        onChange={(e) => setCollaborators(e.target.value)}
      /> */}
<CollaboratorPicker
  valueEmails={collabEmails}
  onChangeEmails={setCollabEmails}
/>

      <div className={styles.modalActions}>
        {/* <button className="cancelLink" onClick={() => setShowCreateModal(false)}>Cancel</button> */}
              <button
        className="nice-button"
        style={{
          marginTop: "1.5rem",
          backgroundColor: "#f3f4f6",
          color: "#111827",
          border: "1px solid #ccc",
        }}
        onClick={() => setShowCreateModal(false)}
      >
        Cancel
      </button>
        <button         className="nice-button"
        style={{ marginTop: "1.5rem" }} onClick={handleCreate}>Create</button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  </div>
)}
{lockModal.open && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
    onClick={() => setLockModal({ open: false, name: "" })}
  >
    <div
      style={{
        width: 420,
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 style={{ margin: 0, fontSize: 18 }}>⚠️ Project currently in use</h3>
      <p style={{ marginTop: 10, color: "#374151", lineHeight: 1.4 }}>
        <b>{lockModal.name}</b> is currently editing this project.
        <br />
        Please try again later to avoid conflicting changes.
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <button
          onClick={() => setLockModal({ open: false, name: "" })}
          style={{
            background: "#111730",
            color: "#fff",
            border: "none",
            padding: "10px 14px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

  </div>
);

}
