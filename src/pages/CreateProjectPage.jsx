import { useState } from "react";
import { createProject } from "../services/apiService";

const SKILL_OPTIONS = [
  "React", "Vue", "Angular", "Node.js", "Spring Boot", "Django",
  "Python", "Java", "JavaScript", "TypeScript", "MySQL", "MongoDB",
  "UI/UX Design", "DevOps", "Machine Learning", "Android", "iOS",
  "Flutter", "Kotlin", "Swift", "GraphQL", "Docker", "AWS"
];

export default function CreateProjectPage({ user, onCreated }) {
  const [form, setForm] = useState({
    name: "", description: "", skills: [], maxMembers: 3,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }));
  };

  const submit = async () => {
    if (!form.name.trim()) return setError("Project name is required.");
    if (form.skills.length === 0) return setError("Select at least one skill.");
    setLoading(true); setError("");
    const payload = {
      name: form.name,
      description: form.description,
      skills: form.skills.join(", "),
      maxMembers: parseInt(form.maxMembers),
      members: 1,
      owner: user.email,
    };
    const result = await createProject(payload);
    setLoading(false);
    if (!result?.id) return setError("Failed to create project.");
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onCreated(); }, 1500);
  };

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div className="mesh-bg" />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        <div className="section-title">✨ Create a Project</div>
        <div className="section-sub">Describe your idea and find the right collaborators</div>

        <div className="card" style={{ marginTop: "1rem" }}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">🎉 Project created! Redirecting…</div>}

          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-input" name="name"
              placeholder="e.g. AI Study Buddy, Campus Event App…"
              value={form.name} onChange={handle} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description"
              placeholder="What are you building? What problem does it solve?"
              value={form.description} onChange={handle} style={{ minHeight: 110 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Skills Needed</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.3rem" }}>
              {SKILL_OPTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className="btn btn-sm"
                  style={{
                    background: form.skills.includes(s)
                      ? "rgba(108,71,255,0.3)"
                      : "var(--bg3)",
                    color: form.skills.includes(s) ? "var(--primary-light)" : "var(--text-muted)",
                    border: form.skills.includes(s)
                      ? "1px solid rgba(108,71,255,0.5)"
                      : "1px solid var(--border)",
                    borderRadius: "8px", fontSize: "0.8rem", padding: "0.3rem 0.7rem",
                  }}>
                  {s}
                </button>
              ))}
            </div>
            {form.skills.length > 0 && (
              <div style={{ marginTop: "0.6rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Selected: <strong style={{ color: "var(--primary-light)" }}>{form.skills.join(", ")}</strong>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Max Team Members (including you)</label>
            <select className="form-select" name="maxMembers"
              value={form.maxMembers} onChange={handle}>
              {[2, 3, 4, 5, 6, 8, 10].map(n => (
                <option key={n} value={n}>{n} members</option>
              ))}
            </select>
          </div>

          <div className="divider" />

          <button className="btn btn-primary btn-full btn-lg"
            onClick={submit} disabled={loading || success}>
            {loading ? "Creating…" : "🚀 Launch Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
