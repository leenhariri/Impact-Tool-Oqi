import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/dashboard.module.css";

type UserSuggestion = { id: string; email: string; name: string | null };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(value: string) {
  return value.trim().replace(/[<>]/g, "");
}

export default function CollaboratorPicker({
  valueEmails,
  onChangeEmails,
  placeholder = "Invite collaborators (search by name/email)",
}: {
  valueEmails: string[];
  onChangeEmails: (emails: string[]) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedSet = useMemo(() => new Set(valueEmails.map((e) => e.toLowerCase())), [valueEmails]);
const filteredSuggestions = useMemo(
  () => suggestions.filter((u) => u.email && !selectedSet.has(u.email.toLowerCase())),
  [suggestions, selectedSet]
);

  // close dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // debounced search
useEffect(() => {
  const q = sanitize(query);

 
  if (!q) {
    setSuggestions([]);
    setOpen(false);
    setLoading(false);
    abortRef.current?.abort();
    return;
  }


    const t = setTimeout(async () => {
      try {
        setLoading(true);
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(q)}`,
          { credentials: "include", signal: abortRef.current.signal }
        );

        if (!res.ok) {
          setSuggestions([]);
          return;
        }

        const data = await res.json();
        setSuggestions(Array.isArray(data.users) ? data.users : []);
        setOpen(true);
      } catch {
        // ignore abort / network
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [query]);

  function addEmail(email: string) {
    const cleaned = sanitize(email).toLowerCase();
    if (!cleaned || !isValidEmail(cleaned)) return;
    if (selectedSet.has(cleaned)) return;
    onChangeEmails([...valueEmails, cleaned]);
    setQuery("");
    setOpen(false);
  }

  function removeEmail(email: string) {
    onChangeEmails(valueEmails.filter((e) => e.toLowerCase() !== email.toLowerCase()));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      // allow manual email entry too
      const raw = query.replace(/,$/, "");
      const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length) {
        e.preventDefault();
        parts.forEach(addEmail);
      }
    }
    if (e.key === "Escape") setOpen(false);
  }

  return (
   <div
  ref={wrapperRef}
  style={{ position: "relative", marginBottom: "14px" }}
>

      {/* chips */}
      {valueEmails.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {valueEmails.map((email) => (
            <span
              key={email}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                fontSize: 13,
              }}
            >
              {email}
              <button
                type="button"
                onClick={() => removeEmail(email)}
                aria-label={`Remove ${email}`}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* input */}
      <input
        type="text"
        className={styles.modalInput}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(sanitize(e.target.value))}
        onFocus={() => {
          if (suggestions.length) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />

      {/* dropdown */}
      {open && (
<div className={styles.autocompleteMenu}>

          {loading && (
            <div style={{ padding: 10, fontSize: 13, color: "#6b7280" }}>
              Searching…
            </div>
          )}
          

{!loading &&
  filteredSuggestions.map((u) => (
    <div
      key={u.id}
      className={styles.autocompleteItem}
      onClick={() => addEmail(u.email)}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className={styles.autocompleteName}>{u.name || u.email}</div>
      <div className={styles.autocompleteEmail}>{u.email}</div>
    </div>
  ))}


{!loading && query.trim().length > 0 && filteredSuggestions.length === 0 && (
  <div style={{ padding: 10, fontSize: 13, color: "#6b7280" }}>
    No users found
  </div>
)}

          
        </div>
      )}
    </div>
  );
}
