import { useState, useRef, useEffect } from "react";

async function fetchUnreadCount(userEmail) {
  try {
    const res  = await fetch("http://localhost:8080/projects");
    const all  = await res.json();
    const mine = all.filter(p => p.owner === userEmail);
    let count  = 0;
    await Promise.all(mine.map(async p => {
      try {
        const r    = await fetch(`http://localhost:8080/projects/${p.id}/requests`);
        const reqs = await r.json();
        count += reqs.length;
      } catch { /* ignore */ }
    }));
    return count;
  } catch { return 0; }
}

export default function Navbar({ user, page, setPage, onLogout, theme, toggleTheme }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [liveCount, setLiveCount]       = useState(0);
  const dropRef   = useRef(null);
  const mobileRef = useRef(null);

  /* ── Poll every 15s ── */
  useEffect(() => {
    if (!user?.email) return;
    const poll = async () => setLiveCount(await fetchUnreadCount(user.email));
    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, [user?.email]);

  /* ── Clear dot on notifications page ── */
  useEffect(() => {
    if (page === "notifications") setLiveCount(0);
    setMobileOpen(false); // close mobile menu on page change
  }, [page]);

  /* ── Outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current   && !dropRef.current.contains(e.target))   setDropdownOpen(false);
      if (mobileRef.current && !mobileRef.current.contains(e.target)) setMobileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navTo = (p) => { setPage(p); setDropdownOpen(false); setMobileOpen(false); };

  const navLinks = [
    { key: "projects",  label: "🚀 Projects"    },
    { key: "create",    label: "+ New Project"  },
    { key: "dashboard", label: "📋 Dashboard"   },
  ];

  return (
    <>
      <nav className="navbar" ref={mobileRef}>
        <div className="navbar-brand">⚡ CollabHub</div>

        {/* ── Desktop nav links ── */}
        <div className="navbar-actions">
          {navLinks.map(l => (
            <button key={l.key}
              className={`btn btn-secondary btn-sm ${page === l.key ? "btn-primary" : ""}`}
              onClick={() => setPage(l.key)}>
              {l.label}
            </button>
          ))}

          {/* Bell */}
          <button
            className={`nav-bell-btn ${page === "notifications" ? "active" : ""}`}
            onClick={() => setPage("notifications")}
            title="Notifications">
            <span>🔔</span>
            {liveCount > 0 && (
              <span className="nav-bell-dot">{liveCount > 9 ? "9+" : liveCount}</span>
            )}
          </button>

          {/* Theme */}
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Profile dropdown */}
          <div className="nav-profile-wrap" ref={dropRef}>
            <button
              className="nav-profile-btn"
              onClick={() => setDropdownOpen(o => !o)}>
              <div className="nav-avatar">{user.name?.charAt(0).toUpperCase() || "U"}</div>
              <span className="nav-username">{user.name}</span>
              <span className="nav-chevron" style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
            </button>

            {dropdownOpen && (
              <div className="nav-dropdown">
                <div className="nav-dropdown-header">
                  <div className="nav-dropdown-avatar">{user.name?.charAt(0).toUpperCase() || "U"}</div>
                  <div>
                    <div className="nav-dropdown-name">{user.name}</div>
                    <div className="nav-dropdown-email">{user.email}</div>
                  </div>
                </div>
                <div className="nav-dropdown-divider" />
                <button className="nav-dropdown-item" onClick={() => navTo("profile")}>
                  <span>👤</span> My Profile
                </button>
                <button className="nav-dropdown-item" onClick={() => navTo("joined")}>
                  <span>🤝</span> Joined Teams
                </button>
                <button className="nav-dropdown-item" onClick={() => navTo("notifications")}>
                  <span>🔔</span>
                  <span style={{ flex: 1 }}>Notifications</span>
                  {liveCount > 0 && <span className="nav-inline-badge">{liveCount > 9 ? "9+" : liveCount}</span>}
                </button>
                <div className="nav-dropdown-divider" />
                <button className="nav-dropdown-item nav-dropdown-danger"
                  onClick={() => { setDropdownOpen(false); onLogout(); }}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>

          {/* Hamburger — only visible on mobile via CSS */}
          <button
            className="navbar-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu">
            <span style={{ transform: mobileOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <div className={`navbar-mobile-menu ${mobileOpen ? "open" : ""}`}>
        {navLinks.map(l => (
          <button key={l.key}
            className={`btn btn-secondary ${page === l.key ? "btn-primary" : ""}`}
            onClick={() => navTo(l.key)}>
            {l.label}
          </button>
        ))}

        <button
          className={`btn btn-secondary ${page === "notifications" ? "btn-primary" : ""}`}
          onClick={() => navTo("notifications")}
          style={{ position: "relative" }}>
          🔔 Notifications
          {liveCount > 0 && (
            <span style={{
              marginLeft: "auto",
              background: "#f97066", color: "#fff",
              borderRadius: "50px", fontSize: "0.68rem", fontWeight: 800,
              padding: "0.1rem 0.45rem"
            }}>{liveCount > 9 ? "9+" : liveCount}</span>
          )}
        </button>

        <div style={{ height: 1, background: "var(--border)", margin: "0.25rem 0" }} />

        <button className={`btn btn-secondary ${page === "profile" ? "btn-primary" : ""}`}
          onClick={() => navTo("profile")}>👤 My Profile</button>
        <button className={`btn btn-secondary ${page === "joined" ? "btn-primary" : ""}`}
          onClick={() => navTo("joined")}>🤝 Joined Teams</button>

        <div style={{ height: 1, background: "var(--border)", margin: "0.25rem 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.25rem 0" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>👤 {user.name}</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="theme-toggle" onClick={toggleTheme}>{theme === "dark" ? "☀️" : "🌙"}</button>
            <button className="btn btn-danger btn-sm" onClick={onLogout}>🚪 Logout</button>
          </div>
        </div>
      </div>

      <style>{`
        /* Bell */
        .nav-bell-btn {
          position: relative; display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          background: var(--bg3); border: 1px solid var(--border);
          cursor: pointer; transition: all 0.18s; flex-shrink: 0; font-size: 1rem;
        }
        .nav-bell-btn:hover, .nav-bell-btn.active {
          border-color: var(--accent); background: var(--bg2);
        }
        .nav-bell-dot {
          position: absolute; top: -5px; right: -5px;
          min-width: 19px; height: 19px; border-radius: 50px;
          background: #f97066; color: #fff;
          font-size: 0.62rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--bg); padding: 0 3px;
          animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
          pointer-events: none;
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        .nav-inline-badge {
          background: #f97066; color: #fff; border-radius: 50px;
          font-size: 0.68rem; font-weight: 800;
          padding: 0.1rem 0.45rem; min-width: 18px; text-align: center;
        }

        /* Profile */
        .nav-profile-wrap { position: relative; }
        .nav-profile-btn {
          display: flex; align-items: center; gap: 0.5rem;
          background: var(--bg3); border: 1px solid var(--border);
          border-radius: 50px; padding: 0.35rem 0.75rem 0.35rem 0.4rem;
          cursor: pointer; color: var(--text); font-size: 0.88rem;
          transition: all 0.18s;
        }
        .nav-profile-btn:hover { border-color: var(--accent); background: var(--bg2); }
        .nav-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #7c5cfc, #f97066);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.85rem; color: #fff; flex-shrink: 0;
        }
        .nav-username { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .nav-chevron  { font-size: 0.7rem; opacity: 0.7; }

        /* Dropdown */
        .nav-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          min-width: 235px; background: var(--bg2);
          border: 1px solid var(--border); border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
          z-index: 1000; overflow: hidden;
          animation: dropIn 0.18s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .nav-dropdown-header { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1rem 0.85rem; }
        .nav-dropdown-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #7c5cfc, #f97066);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1rem; color: #fff; flex-shrink: 0;
        }
        .nav-dropdown-name  { font-weight: 700; font-size: 0.92rem; color: var(--text); }
        .nav-dropdown-email { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }
        .nav-dropdown-divider { height: 1px; background: var(--border); margin: 0.25rem 0; }
        .nav-dropdown-item {
          width: 100%; display: flex; align-items: center; gap: 0.65rem;
          padding: 0.7rem 1rem; background: none; border: none;
          color: var(--text); font-size: 0.88rem; cursor: pointer; text-align: left;
          transition: background 0.15s;
        }
        .nav-dropdown-item:hover { background: var(--bg3); }
        .nav-dropdown-item > span:first-child { font-size: 1rem; width: 20px; text-align: center; }
        .nav-dropdown-danger { color: #f97066 !important; margin-bottom: 0.25rem; }
        .nav-dropdown-danger:hover { background: rgba(249,112,102,0.1) !important; }

        /* Mobile specific overrides */
        @media (max-width: 767px) {
          .nav-profile-btn { display: none; }
          .nav-bell-btn    { display: none; }
          .theme-toggle    { display: none; }
          .navbar-hamburger { display: flex !important; }
        }
        @media (min-width: 768px) {
          .navbar-hamburger { display: none !important; }
          .navbar-mobile-menu { display: none !important; }
        }
        @media (max-width: 479px) {
          .nav-username { display: none; }
        }
      `}</style>
    </>
  );
}
