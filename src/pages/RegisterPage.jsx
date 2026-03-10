import { useState } from "react";
import { registerStudent } from "../services/apiService";

const SKILL_OPTIONS = [
  "React","Vue","Angular","Node.js","Spring Boot","Django",
  "Python","Java","JavaScript","TypeScript","MySQL","MongoDB",
  "UI/UX Design","DevOps","Machine Learning","Android","iOS"
];

export default function RegisterPage({ onRegistered, onGoLogin, theme, toggleTheme }) {
  const [form, setForm]       = useState({ name: "", email: "", skill: "", password: "" });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle    = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  const submit = async () => {
    if (!form.name || !form.email || !form.skill || !form.password)
      return setError("Please fill in all fields.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    setLoading(true); setError("");
    const student = await registerStudent(form);
    setLoading(false);
    if (!student?.id) return setError("Registration failed. Try again.");
    setSuccess(true);
    setTimeout(() => onRegistered(student), 1200);
  };

  return (
    <div className="login-page" data-theme={theme}>

      {/* ── LEFT HERO ── */}
      <div className="login-hero">
        <div className="login-hero-content">
          <div className="login-brand">⚡ CollabHub</div>
          <div className="login-brand-sub">
            Start building with fellow students.<br />
            Create your profile and join the movement.
          </div>

          <div className="login-feature">
            <div className="login-feature-icon purple">🎯</div>
            <div className="login-feature-text">
              <strong>Showcase Your Skills</strong>
              Let projects find you based on what you know
            </div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon coral">🌍</div>
            <div className="login-feature-text">
              <strong>Join Live Projects</strong>
              Apply to open teams and start contributing
            </div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon teal">🏆</div>
            <div className="login-feature-text">
              <strong>Grow Your Portfolio</strong>
              Real projects, real impact, real experience
            </div>
          </div>
        </div>

        <div className="login-floating-card c1">
          <div className="login-floating-card-label">🌟 Students</div>
          <div className="login-floating-card-val">2,400+ Active</div>
        </div>
        <div className="login-floating-card c2">
          <div className="login-floating-card-label">🚀 Projects</div>
          <div className="login-floating-card-val">340+ Open</div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="login-form-panel">
        <button className="theme-toggle login-theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div className="auth-tabs">
          <button className="auth-tab" onClick={onGoLogin}>Login</button>
          <button className="auth-tab active">Register</button>
        </div>

        <div className="login-form-box">
          <div className="login-form-title">Create your account 🚀</div>
          <div className="login-form-sub">Join thousands of student builders today.</div>

          {error   && <div className="alert alert-error"   style={{ marginBottom: "1.2rem" }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: "1.2rem" }}>Account created! Redirecting…</div>}

          <div className="float-group">
            <input className="float-input" name="name" type="text" placeholder=" "
              value={form.name} onChange={handle} onKeyDown={handleKey} autoComplete="name" />
            <label className="float-label">Full Name</label>
          </div>

          <div className="float-group">
            <input className="float-input" name="email" type="email" placeholder=" "
              value={form.email} onChange={handle} onKeyDown={handleKey} autoComplete="email" />
            <label className="float-label">Email address</label>
          </div>

          {/* Skill select styled as float input */}
          <div className="float-group">
            <select className="float-input float-select" name="skill" value={form.skill} onChange={handle}
              style={{ color: form.skill ? "var(--text)" : "transparent" }}>
              <option value="" disabled hidden></option>
              {SKILL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="float-label" style={{
              top: form.skill ? "0.55rem" : "50%",
              transform: form.skill ? "none" : "translateY(-50%)",
              fontSize: form.skill ? "0.72rem" : "0.9rem",
              color: form.skill ? "var(--accent)" : "var(--text-muted)"
            }}>Primary Skill</label>
          </div>

          <div className="float-group">
            <input className="float-input" name="password" type="password" placeholder=" "
              value={form.password} onChange={handle} onKeyDown={handleKey} autoComplete="new-password" />
            <label className="float-label">Password (min. 6 chars)</label>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: "0.5rem", borderRadius: "12px" }}
            onClick={submit} disabled={loading || success}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                Creating account…
              </span>
            ) : "Create Account →"}
          </button>

          <div className="divider-text">or</div>

          <button className="btn btn-secondary btn-full"
            style={{ borderRadius: "12px", padding: "0.75rem", justifyContent: "center" }}
            onClick={onGoLogin}>
            👋 Sign in to existing account
          </button>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            By registering you agree to our terms of service.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}