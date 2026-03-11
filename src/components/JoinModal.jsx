import { useState } from "react";
import { sendJoinRequest } from "../services/apiService";

export default function JoinModal({ project, user, onClose }) {
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    skills: user.skill || "",
    experience: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.skills || !form.experience) return setError("Please fill in all fields.");
    setLoading(true); setError("");
    try {
      await sendJoinRequest(project.id, form);
      setSent(true);
      setTimeout(onClose, 1800);
    } catch {
      setError("Failed to send request. Try again.");
    }
    setLoading(false);
  };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: "1rem", backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "var(--bg2, #1a1a2e)", border: "1px solid var(--border, #2a2a3e)",
        borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "480px",
        boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
        animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)"
      }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text, #fff)" }}>Apply to Join</div>
          <button onClick={onClose} style={{
            background: "var(--bg3, #252540)", border: "1px solid var(--border, #2a2a3e)",
            borderRadius: "50%", width: 32, height: 32, cursor: "pointer",
            color: "var(--text-muted, #888)", fontSize: "1rem", display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>✕</button>
        </div>

        {/* Project name */}
        <div style={{
          background: "var(--bg3, #252540)", borderRadius: "10px",
          padding: "0.85rem 1rem", marginBottom: "1.5rem",
          borderLeft: "3px solid var(--accent, #7c5cfc)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #888)", marginBottom: "0.2rem" }}>Project</div>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text, #fff)" }}>{project.name}</div>
        </div>

        {sent ? (
          <div style={{
            background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "12px", padding: "1.5rem", textAlign: "center",
            color: "#22c55e", fontWeight: 600, fontSize: "1rem"
          }}>
            ✅ Request sent! Good luck!
          </div>
        ) : (
          <>
            {error && (
              <div style={{
                background: "rgba(249,112,102,0.15)", border: "1px solid rgba(249,112,102,0.3)",
                borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1rem",
                color: "#f97066", fontSize: "0.88rem"
              }}>{error}</div>
            )}

            {[
              { label: "Your Name",  name: "name",   type: "text",  placeholder: "" },
              { label: "Email",      name: "email",  type: "email", placeholder: "" },
              { label: "Your Skills",name: "skills", type: "text",  placeholder: "e.g. React, Node.js, UI/UX" },
            ].map(f => (
              <div key={f.name} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600,
                  color: "var(--text-muted, #888)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {f.label}
                </label>
                <input name={f.name} type={f.type} value={form[f.name]}
                  onChange={handle} placeholder={f.placeholder}
                  style={{
                    width: "100%", background: "var(--bg3, #252540)",
                    border: "1.5px solid var(--border, #2a2a3e)", borderRadius: "10px",
                    padding: "0.75rem 1rem", color: "var(--text, #fff)", fontSize: "0.95rem",
                    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s"
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--accent, #7c5cfc)"}
                  onBlur={e => e.target.style.borderColor = "var(--border, #2a2a3e)"}
                />
              </div>
            ))}

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600,
                color: "var(--text-muted, #888)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Experience / Motivation
              </label>
              <textarea name="experience" value={form.experience} onChange={handle}
                placeholder="Tell the project owner why you're a great fit…"
                rows={4}
                style={{
                  width: "100%", background: "var(--bg3, #252540)",
                  border: "1.5px solid var(--border, #2a2a3e)", borderRadius: "10px",
                  padding: "0.75rem 1rem", color: "var(--text, #fff)", fontSize: "0.95rem",
                  outline: "none", resize: "vertical", boxSizing: "border-box",
                  fontFamily: "inherit", transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent, #7c5cfc)"}
                onBlur={e => e.target.style.borderColor = "var(--border, #2a2a3e)"}
              />
            </div>

            <button onClick={submit} disabled={loading} style={{
              width: "100%", padding: "0.9rem", borderRadius: "12px",
              background: loading ? "var(--bg3, #252540)" : "linear-gradient(135deg, #7c5cfc, #a78bfa)",
              border: "none", color: "#fff", fontWeight: 700, fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
              opacity: loading ? 0.7 : 1
            }}>
              {loading ? "Sending…" : "Send Request →"}
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}