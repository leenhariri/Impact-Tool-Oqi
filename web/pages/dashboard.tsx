import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/dashboard.module.css";
import "nice-forms.css";
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

useEffect(() => {
  if (selectedProject) {
    setEditTitle(selectedProject.title);
    setEditDesc(selectedProject.description || "");
setEditCollaborators(
  selectedProject.members
    .filter((m: any) => m.role !== "OWNER")
    .map((m: any) => m.user?.email)
    .filter(Boolean) // remove nulls in case a user relation is missing
    .join(", ")
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

  useEffect(() => {
    if (user) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/projects`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setProjects(data.projects));
    }
  }, [user]);

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

          collaborators: collaborators
            .split(",")
            .map((email) => ({ email: email.trim(), role: "EDITOR" })),
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

      setSelectedProject(newProject); 
      // Reset form
      setTitle("");
      setDescription("");
      setCollaborators("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user) return <p>Loading...</p>;

 return (
  <div className={styles.container}>
    <div className={styles.instructions}>
      <h2 className="font-bold text-lg mb-2">Instructions</h2>
      <ol className="list-decimal list-inside text-sm">
        <li>Enter a unique project title, add an optional description, and click Create to start your new project.</li>
        <li>Click to view/edit an existing project.</li>
      </ol>
    </div>

    <div className={styles.dashboard}>
      <div className={styles.left}>
        <h3>Previous Projects</h3>
{projects.length === 0 ? (
  <div className={styles.emptyState}>
    No projects yet — create one on the right.
  </div>
) : (
  projects.map((p: any) => (
    <div
      key={p.id}
      className={styles.projectBox}
      onClick={() => setSelectedProject(p)}
    >
      <strong>{p.title}</strong>{p.description && ` : ${p.description}`}
      <span className={styles.arrow}>→</span>
    </div>
  ))
)}

      </div>

      <div className={styles.right}>
        <h3>New Project</h3>
        <input
          type="text"
          placeholder="Project Title:"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Project Description (Optional):"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Invite Collaborators: (comma-separated emails)"
          value={collaborators}
          onChange={(e) => setCollaborators(e.target.value)}
        />
        <button onClick={handleCreate}>Create</button>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>

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
  <div className="nice-form-group">
    <label htmlFor="editTitle">Project Title</label>
    <input
      id="editTitle"
      type="text"
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
      required
    />
  </div>
) : (
  <div className="nice-form-group">
    <label>Project Title</label>
    <p>{selectedProject.title}</p>
  </div>
)}


          {/* Description */}
{isEditing ? (
  <div className="nice-form-group">
    <label htmlFor="editDesc">Description</label>
    <textarea
      id="editDesc"
      placeholder="Project Description"
      value={editDesc}
      onChange={(e) => setEditDesc(e.target.value)}
      rows={4}
    />
  </div>
) : (
  <div className="nice-form-group">
    <label>Description</label>
    <p>{selectedProject.description || "No description"}</p>
  </div>
)}


          {/* Members */}
{/* <div className="nice-form-group">
  <label>Members</label>
  <ul>
    {selectedProject.members.map((m: any) => (
      <li key={m.id || m.userId}>
        {m.role} – {m.user?.email || m.user?.name}
      </li>
    ))}
  </ul>
</div> */}


          {/* Collaborators input */}
{isEditing && (
  <div className="nice-form-group">
    <label htmlFor="editCollaborators">New Collaborators</label>
    <small>Comma-separated emails</small>
    <input
      id="editCollaborators"
      type="text"
      value={editCollaborators}
      onChange={(e) => setEditCollaborators(e.target.value)}
      placeholder="e.g. alice@cern.ch, bob@cern.ch"
    />
  </div>
)}


          {/* Bottom Buttons */}
<div className={styles.modalActions}>
  {isEditing ? (
    <>
      <button
        className={styles.linkButton}
        onClick={() => setIsEditing(false)}
      >
        Cancel
      </button>
      <button
        className={styles.linkButton}
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
                  collaborators: editCollaborators
                    .split(",")
                    .map((email) => ({ email: email.trim(), role: "EDITOR" })),
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
            setSelectedProject(result);
            setIsEditing(false);
          } catch (err) {
            alert("Failed to update project");
          }
        }}
      >
        Save Changes
      </button>
    </>
  ) : (
    <button
      className={styles.linkButton}
      onClick={() => {
        setSelectedProject(null);
        router.push(`/project/${selectedProject.id}`);
      }}
    >
      Open Project →
    </button>
  )}
</div>


        </div>
      </div>
    )}
  </div>
);

}
