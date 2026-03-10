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
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

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
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <div className="modal-title">Apply to Join</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Project</div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{project.name}</div>
        </div>

        {sent ? (
          <div className="alert alert-success" style={{ textAlign: "center" }}>
            ✅ Request sent! Good luck!
          </div>
        ) : (
          <>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" name="name" value={form.name} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" name="email" type="email" value={form.email} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Your Skills</label>
              <input className="form-input" name="skills"
                placeholder="e.g. React, Node.js, UI/UX"
                value={form.skills} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Experience / Motivation</label>
              <textarea className="form-textarea" name="experience"
                placeholder="Tell the project owner why you're a great fit…"
                value={form.experience} onChange={handle} />
            </div>
            <button className="btn btn-primary btn-full" onClick={submit} disabled={loading}>
              {loading ? "Sending…" : "Send Request →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
