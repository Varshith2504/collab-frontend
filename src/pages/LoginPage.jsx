import { useState } from "react";
import { loginStudent } from "../services/apiService";

export default function LoginPage({ onLogin, onGoRegister, theme, toggleTheme }) {
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle    = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  const submit = async () => {
    if (!form.email || !form.password) return setError("Please fill in all fields.");
    setLoading(true); setError("");
    const student = await loginStudent(form.email, form.password);
    setLoading(false);
    if (!student) return setError("Invalid email or password. Try again.");
    onLogin(student);
  };

  return (
    <div className="login-page" data-theme={theme}>

      {/* ── LEFT HERO ── */}
      <div className="login-hero">
        <div className="login-hero-content">
          <div className="login-brand">⚡ CollabHub</div>
          <div className="login-brand-sub">
            Connect with student builders.<br />
            Form your dream team. Ship together.
          </div>

          <div className="login-feature">
            <div className="login-feature-icon purple">🚀</div>
            <div className="login-feature-text">
              <strong>Discover Projects</strong>
              Browse real ideas built by students like you
            </div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon coral">🤝</div>
            <div className="login-feature-text">
              <strong>Find Teammates</strong>
              Match with people whose skills complement yours
            </div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon teal">✨</div>
            <div className="login-feature-text">
              <strong>Build &amp; Learn</strong>
              Ship projects that matter for your portfolio
            </div>
          </div>
        </div>

        <div className="login-floating-card c1">
          <div className="login-floating-card-label">🔥 Trending</div>
          <div className="login-floating-card-val">AI Study Buddy</div>
        </div>
        <div className="login-floating-card c2">
          <div className="login-floating-card-label">👥 New Members</div>
          <div className="login-floating-card-val">+12 this week</div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="login-form-panel">
        <button className="theme-toggle login-theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div className="auth-tabs">
          <button className="auth-tab active">Login</button>
          <button className="auth-tab" onClick={onGoRegister}>Register</button>
        </div>

        <div className="login-form-box">
          <div className="login-form-title">Welcome back 👋</div>
          <div className="login-form-sub">Sign in to continue building great things.</div>

          {error && <div className="alert alert-error" style={{ marginBottom: "1.2rem" }}>{error}</div>}

          <div className="float-group">
            <input className="float-input" name="email" type="email" placeholder=" "
              value={form.email} onChange={handle} onKeyDown={handleKey} autoComplete="email" />
            <label className="float-label">Email address</label>
          </div>

          <div className="float-group">
            <input className="float-input" name="password" type="password" placeholder=" "
              value={form.password} onChange={handle} onKeyDown={handleKey} autoComplete="current-password" />
            <label className="float-label">Password</label>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: "0.5rem", borderRadius: "12px" }}
            onClick={submit} disabled={loading}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                Signing in…
              </span>
            ) : "Sign In →"}
          </button>

          <div className="divider-text">or</div>

          <button className="btn btn-secondary btn-full"
            style={{ borderRadius: "12px", padding: "0.75rem", justifyContent: "center" }}
            onClick={onGoRegister}>
            ✨ Create a new account
          </button>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            By signing in you agree to our terms of service.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}