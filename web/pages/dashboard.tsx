import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/dashboard.module.css";
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

      if (!response.ok) throw new Error("Failed to create project");

      const newProject = await response.json();
      setProjects((prev: any) => [...prev, newProject]);

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
        <h2>Instructions</h2>
        <p>1. To view/edit an old project, click on it.</p>
        <p>2. To create a new project, enter an optional description, a unique project title, and create</p>
      </div>

      <div className={styles.dashboard}>
        <div className={styles.left}>
          <h3>Previous Projects</h3>
          {projects.map((p: any) => (
<div
  key={p.id}
  className={styles.projectBox}
  onClick={() => setSelectedProject(p)}
>
  <strong>{p.title}</strong>{p.description && ` : ${p.description}`}
  <span className={styles.arrow}>→</span>
</div>



          ))}
        </div>

        <div className={styles.right}>
          <h3>Create New Project</h3>
          <textarea
            placeholder="Project Description (Optional):"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Project Title:"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
    setIsEditing(false); // reset editing mode
  }}>
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <h2>
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className={styles.modalInput}
          />
        ) : (
          selectedProject.title
        )}
      </h2>

      {isEditing ? (
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          className={styles.modalInput}
        />
      ) : (
        <p>{selectedProject.description || "No description"}</p>
      )}

      <h4>Members</h4>
      <ul>
        {selectedProject.members.map((m: any) => (
          <li key={m.id || m.userId}>
            {m.role} - {m.user?.email || m.user?.name}

          </li>
        ))}
      </ul>

      {isEditing && (
        <>
          <label>New Collaborators (comma-separated emails):</label>
          <input
            type="text"
            value={editCollaborators}
            onChange={(e) => setEditCollaborators(e.target.value)}
            className={styles.modalInput}
          />
        </>
      )}

      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        {selectedProject.ownerUserId === user?.uid && (
          <>
            <button
              className={styles.modalButton}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Project"}
            </button>

            {isEditing && (
              <button
                className={styles.saveButton}
                onClick={async () => {
                  try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/projects/${selectedProject.id}`, {
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
                    });

                    if (!res.ok) throw new Error("Failed to update project");

                    const updated = await res.json();
                    setProjects((prev) =>
                      prev.map((p) => (p.id === updated.id ? updated : p))
                    );
                    setSelectedProject(updated);
                    setIsEditing(false);
                  } catch (err) {
                    alert("Failed to update project");
                  }
                }}
              >
                Save Changes
              </button>
            )}

            <button
              onClick={async () => {
                if (!confirm("Are you sure you want to delete this project?")) return;

                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/projects/${selectedProject.id}`, {
                    method: "DELETE",
                    credentials: "include",
                  });

                  if (!res.ok) throw new Error("Failed to delete project");

                  setProjects((prev) =>
                    prev.filter((p) => p.id !== selectedProject.id)
                  );
                  setSelectedProject(null);
                } catch (err) {
                  alert("Error deleting project.");
                  // console.error(err);
                }
              }}
              className={styles.deleteButton}
            >
              Delete Project
            </button>
          </>
        )}

        <button
          className={styles.modalButton}
          onClick={() => {
            setSelectedProject(null);
            router.push(`/project/${selectedProject.id}`);
          }}
        >
          Open Full Project →
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}
