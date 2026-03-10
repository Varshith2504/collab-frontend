import { useState, useEffect } from "react";

const SKILL_OPTIONS = [
  "React", "Vue", "Angular", "Node.js", "Spring Boot", "Django",
  "Python", "Java", "JavaScript", "TypeScript", "MySQL", "MongoDB",
  "UI/UX Design", "DevOps", "Machine Learning", "Android", "iOS"
];

const SKILL_COLORS = {
  "React": "#61dafb", "Vue": "#42b883", "Angular": "#dd0031",
  "Node.js": "#68a063", "Spring Boot": "#6db33f", "Django": "#092e20",
  "Python": "#3776ab", "Java": "#f89820", "JavaScript": "#f7df1e",
  "TypeScript": "#3178c6", "MySQL": "#4479a1", "MongoDB": "#47a248",
  "UI/UX Design": "#ff6b9d", "DevOps": "#e95420", "Machine Learning": "#ff6f00",
  "Android": "#3ddc84", "iOS": "#007aff"
};

export default function ProfilePage({ user, onUpdateUser }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ name: user.name || "", skill: user.skill || "", bio: user.bio || "" });
  const [saved, setSaved]     = useState(false);
  const [stats, setStats]     = useState({ projectsOwned: 0, projectsJoined: 0, requestsSent: 0 });

  useEffect(() => {
    // Load basic stats from projects
    fetch("http://localhost:8080/projects")
      .then(r => r.json())
      .then(all => {
        const owned  = all.filter(p => p.owner === user.email).length;
        setStats(s => ({ ...s, projectsOwned: owned }));
      }).catch(() => {});
  }, [user.email]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = () => {
    // Persist to parent / local — extend with real API call if needed
    if (onUpdateUser) onUpdateUser({ ...user, ...form });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const avatarLetter = (form.name || user.name || "U").charAt(0).toUpperCase();
  const joinDate = user.id ? `Member #${user.id}` : "New member";

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div className="mesh-bg" />

      <style>{`
        .profile-hero {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          background: var(--bg2);
          border: 1px solid var(--border);
        }
        .profile-banner {
          height: 140px;
          background: linear-gradient(135deg, #7c5cfc 0%, #f97066 50%, #06d6a0 100%);
          position: relative;
          overflow: hidden;
        }
        .profile-banner::before {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            45deg,
            rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px,
            transparent 1px, transparent 20px
          );
        }
        .profile-banner-circles {
          position: absolute; top: -30px; right: -30px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
        }
        .profile-avatar-wrap {
          position: absolute;
          bottom: -40px;
          left: 2.5rem;
        }
        .profile-avatar {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c5cfc, #f97066);
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; font-weight: 800; color: #fff;
          border: 4px solid var(--bg2);
          box-shadow: 0 8px 24px rgba(124,92,252,0.4);
        }
        .profile-info-row {
          padding: 3rem 2.5rem 1.75rem;
          display: flex; justify-content: space-between;
          align-items: flex-start; flex-wrap: wrap; gap: 1rem;
        }
        .profile-name {
          font-size: 1.6rem; font-weight: 800;
          background: linear-gradient(135deg, var(--text), #7c5cfc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .profile-meta {
          color: var(--text-muted); font-size: 0.85rem; margin-top: 0.3rem;
          display: flex; gap: 1rem; flex-wrap: wrap;
        }
        .profile-meta span { display: flex; align-items: center; gap: 0.3rem; }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
          transition: transform 0.2s, border-color 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent, #7c5cfc);
        }
        .stat-val {
          font-size: 2rem; font-weight: 800;
          background: linear-gradient(135deg, #7c5cfc, #f97066);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label {
          font-size: 0.78rem; color: var(--text-muted);
          margin-top: 0.25rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
        }

        .detail-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .detail-card {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 16px; padding: 1.5rem;
        }
        .detail-label {
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1px; color: var(--text-muted); margin-bottom: 0.6rem;
        }

        .skill-pill {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.4rem 0.9rem; border-radius: 50px;
          font-size: 0.82rem; font-weight: 600;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          margin: 0.25rem;
        }
        .skill-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }

        .edit-form {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 20px; padding: 1.75rem; margin-bottom: 1.5rem;
          animation: slideIn 0.2s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .bio-text {
          color: var(--text-muted); font-size: 0.9rem; line-height: 1.65;
          font-style: italic;
        }

        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: 1fr 1fr; }
          .detail-grid { grid-template-columns: 1fr; }
          .profile-info-row { padding: 3rem 1.25rem 1.25rem; }
          .profile-avatar-wrap { left: 1.25rem; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform: translateY(16px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease both; }
        .fade-up-2 { animation: fadeUp 0.4s ease 0.1s both; }
        .fade-up-3 { animation: fadeUp 0.4s ease 0.2s both; }
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {saved && (
          <div className="alert alert-success fade-up" style={{ marginBottom: "1rem" }}>
            ✅ Profile updated successfully!
          </div>
        )}

        {/* ── Hero card ── */}
        <div className="profile-hero card-glow fade-up">
          <div className="profile-banner">
            <div className="profile-banner-circles" />
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{avatarLetter}</div>
            </div>
          </div>
          <div className="profile-info-row">
            <div>
              <div className="profile-name">{form.name || user.name}</div>
              <div className="profile-meta">
                <span>📧 {user.email}</span>
                <span>🎫 {joinDate}</span>
                {form.skill && <span>⚡ {form.skill}</span>}
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setEditing(e => !e)}
              style={{ borderRadius: "10px", padding: "0.5rem 1.1rem" }}>
              {editing ? "✕ Cancel" : "✏️ Edit Profile"}
            </button>
          </div>
        </div>

        {/* ── Edit form ── */}
        {editing && (
          <div className="edit-form">
            <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "1.25rem" }}>✏️ Edit Your Profile</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="Your name" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Primary Skill</label>
                <select className="form-select" name="skill" value={form.skill} onChange={handle}>
                  <option value="">Select skill…</option>
                  {SKILL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ margin: "0 0 1.25rem" }}>
              <label className="form-label">Bio</label>
              <textarea
                className="form-input"
                name="bio"
                value={form.bio}
                onChange={handle}
                placeholder="Tell your team something about yourself…"
                rows={3}
                style={{ resize: "vertical", minHeight: 80 }}
              />
            </div>
            <button className="btn btn-primary" onClick={saveProfile} style={{ borderRadius: "10px" }}>
              💾 Save Changes
            </button>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="stat-grid fade-up-2">
          <div className="stat-card">
            <div className="stat-val">{stats.projectsOwned}</div>
            <div className="stat-label">Projects Created</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{stats.projectsJoined}</div>
            <div className="stat-label">Teams Joined</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{stats.requestsSent}</div>
            <div className="stat-label">Requests Sent</div>
          </div>
        </div>

        {/* ── Details ── */}
        <div className="detail-grid fade-up-3">

          {/* Skills */}
          <div className="detail-card">
            <div className="detail-label">⚡ Skills</div>
            {form.skill ? (
              <span className="skill-pill">
                <span className="skill-dot" style={{ background: SKILL_COLORS[form.skill] || "#7c5cfc" }} />
                {form.skill}
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No skill set yet. Edit your profile!</span>
            )}
          </div>

          {/* Bio */}
          <div className="detail-card">
            <div className="detail-label">💬 About Me</div>
            {form.bio ? (
              <p className="bio-text">"{form.bio}"</p>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No bio yet. Tell the community about yourself!</span>
            )}
          </div>

          {/* Account info */}
          <div className="detail-card">
            <div className="detail-label">🔑 Account Info</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Email</span>
                <span style={{ fontWeight: 600 }}>{user.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Account ID</span>
                <span style={{ fontWeight: 600 }}>#{user.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Status</span>
                <span style={{ color: "#06d6a0", fontWeight: 600 }}>● Active</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="detail-card">
            <div className="detail-label">🚀 Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                { icon: "🔍", label: "Browse open projects" },
                { icon: "➕", label: "Create a new project" },
                { icon: "🤝", label: "View your teams" },
              ].map(({ icon, label }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.5rem 0.75rem", borderRadius: "8px",
                  background: "var(--bg3)", border: "1px solid var(--border)",
                  fontSize: "0.85rem", cursor: "pointer",
                  transition: "border-color 0.15s"
                }}>
                  <span>{icon}</span> {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
