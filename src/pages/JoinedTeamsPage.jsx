import { useEffect, useState } from "react";

/* 
  Shows all projects where the current user is a team member (not the owner).
  Fetches all projects and checks member lists, or queries /team endpoint.
*/

async function fetchJoinedProjects(userEmail) {
  try {
   const res = await fetch(`${BASE_URL}/projects`);  // also fix localhost here!
const all = await res.json();
const joined = all.filter(p =>
  p.owner !== userEmail &&
  Array.isArray(p.memberEmails) && p.memberEmails.includes(userEmail)
);
    return joined;
  } catch {
    return [];
  }
}

const STATUS_COLORS = { active: "#06d6a0", full: "#f7c948", archived: "#888" };

function fillPercent(p) {
  return Math.round((p.members / p.maxMembers) * 100);
}

export default function JoinedTeamsPage({ user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await fetchJoinedProjects(user.email);
    setProjects(data);
    setLoading(false);
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.skills || "").toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (p) => {
    if (p.members >= p.maxMembers) return "full";
    return "active";
  };

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div className="mesh-bg" />

      <style>{`
        .jt-header {
          display: flex; justify-content: space-between;
          align-items: flex-start; flex-wrap: wrap; gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .jt-search-wrap {
          position: relative; max-width: 300px; width: 100%;
        }
        .jt-search {
          width: 100%; padding: 0.6rem 1rem 0.6rem 2.4rem;
          border-radius: 50px; border: 1px solid var(--border);
          background: var(--bg3); color: var(--text);
          font-size: 0.88rem; outline: none;
          transition: border-color 0.15s;
        }
        .jt-search:focus { border-color: var(--accent, #7c5cfc); }
        .jt-search-icon {
          position: absolute; left: 0.8rem; top: 50%;
          transform: translateY(-50%); color: var(--text-muted);
          font-size: 0.85rem; pointer-events: none;
        }

        .jt-card {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          animation: fadeUp 0.35s ease both;
        }
        .jt-card:hover {
          transform: translateY(-3px);
          border-color: rgba(124,92,252,0.4);
          box-shadow: 0 12px 40px rgba(0,0,0,0.2);
        }
        .jt-card-top {
          padding: 1.4rem 1.5rem 1rem;
        }
        .jt-card-row {
          display: flex; justify-content: space-between;
          align-items: flex-start; gap: 1rem; flex-wrap: wrap;
        }
        .jt-project-name {
          font-size: 1.1rem; font-weight: 800;
          margin-bottom: 0.3rem; color: var(--text);
        }
        .jt-project-desc {
          font-size: 0.83rem; color: var(--text-muted); line-height: 1.5;
        }
        .jt-status-badge {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.3rem 0.75rem; border-radius: 50px;
          font-size: 0.75rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
          flex-shrink: 0;
        }
        .jt-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
        }

        .jt-footer {
          background: var(--bg3);
          border-top: 1px solid var(--border);
          padding: 0.9rem 1.5rem;
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 0.75rem;
        }
        .jt-owner-info {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.82rem; color: var(--text-muted);
        }
        .jt-mini-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: linear-gradient(135deg, #7c5cfc, #f97066);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; color: #fff; flex-shrink: 0;
        }

        .jt-expand-panel {
          padding: 1.25rem 1.5rem;
          border-top: 1px dashed var(--border);
          animation: fadeUp 0.2s ease;
        }
        .jt-detail-row {
          display: flex; justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.85rem;
        }
        .jt-detail-row:last-child { border-bottom: none; }

        .empty-joined {
          text-align: center; padding: 4rem 2rem;
        }
        .empty-joined-icon {
          font-size: 4rem; margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform: translateY(14px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.1rem;
        }
        @media (max-width: 640px) {
          .grid-2 { grid-template-columns: 1fr; }
          .jt-card-top { padding: 1.1rem 1.1rem 0.9rem; }
          .jt-footer { padding: 0.75rem 1.1rem; }
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div className="jt-header">
          <div>
            <div className="section-title">🤝 Joined Teams</div>
            <div className="section-sub">
              {projects.length > 0
                ? `You're part of ${projects.length} team${projects.length > 1 ? "s" : ""}`
                : "Projects you've joined will appear here"}
            </div>
          </div>
          <div className="jt-search-wrap">
            <span className="jt-search-icon">🔍</span>
            <input
              className="jt-search"
              placeholder="Search by name or skill…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats row */}
        {projects.length > 0 && (
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <span className="badge badge-purple">🤝 {projects.length} Teams</span>
            <span className="badge badge-yellow">🔥 {projects.filter(p => getStatus(p) === "active").length} Active</span>
            <span className="badge" style={{ background: "rgba(249,112,102,0.15)", color: "#f97066" }}>
              🎉 {projects.filter(p => getStatus(p) === "full").length} Full
            </span>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ animation: "pulse 1.2s infinite" }}>⏳</div>
            <h3>Loading your teams…</h3>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-joined">
            <div className="empty-joined-icon">🌱</div>
            <h3 style={{ color: "var(--text)", fontSize: "1.3rem", marginBottom: "0.5rem" }}>
              {search ? "No matching teams found" : "You haven't joined any teams yet"}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 360, margin: "0 auto 1.5rem" }}>
              {search
                ? "Try a different search term."
                : "Browse open projects and send a join request to get started!"}
            </p>
            {!search && (
              <button className="btn btn-primary" style={{ borderRadius: "12px" }}>
                🚀 Browse Projects
              </button>
            )}
          </div>
        ) : (
          <div className="grid-2">
            {filtered.map((project, i) => {
              const status  = getStatus(project);
              const fill    = fillPercent(project);
              const isOpen  = expanded === project.id;

              return (
                <div key={project.id} className="jt-card card-glow" style={{ animationDelay: `${i * 0.06}s` }}>

                  {/* Top section */}
                  <div className="jt-card-top">
                    <div className="jt-card-row">
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <div className="jt-project-name">{project.name}</div>
                        </div>
                        <div className="jt-project-desc">
                          {project.description || "No description provided."}
                        </div>
                      </div>
                      {/* Status badge */}
                      <div
                        className="jt-status-badge"
                        style={{
                          background: STATUS_COLORS[status] + "22",
                          color: STATUS_COLORS[status],
                          border: `1px solid ${STATUS_COLORS[status]}44`
                        }}>
                        <span className="jt-status-dot" style={{ background: STATUS_COLORS[status] }} />
                        {status === "full" ? "Full" : "Active"}
                      </div>
                    </div>

                    {/* Skills */}
                    <div style={{ marginTop: "0.75rem" }}>
                      {(project.skills || "").split(",").map(s => s.trim()).filter(Boolean).map(s =>
                        <span key={s} className="tag">{s}</span>
                      )}
                    </div>

                    {/* Progress */}
                    <div style={{ marginTop: "0.85rem" }}>
                      <div className="flex-between" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                        <span>Team capacity</span>
                        <span style={{ fontWeight: 700, color: fill >= 90 ? "#f97066" : "var(--text-muted)" }}>
                          {project.members}/{project.maxMembers} members
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${fill}%`,
                            background: fill >= 90
                              ? "linear-gradient(90deg, #f97066, #f7c948)"
                              : undefined
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="jt-footer">
                    <div className="jt-owner-info">
                      <div className="jt-mini-avatar">
                        {(project.owner || "?").charAt(0).toUpperCase()}
                      </div>
                      <span>
                        <span style={{ opacity: 0.6 }}>Led by </span>
                        <span style={{ fontWeight: 600, color: "var(--text)" }}>{project.owner}</span>
                      </span>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setExpanded(isOpen ? null : project.id)}
                      style={{ borderRadius: "8px", fontSize: "0.78rem" }}>
                      {isOpen ? "▲ Hide" : "ℹ️ Details"}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="jt-expand-panel">
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                        Project Details
                      </div>
                      {[
                        { label: "Project ID",   val: `#${project.id}` },
                        { label: "Owner",         val: project.owner || "—" },
                        { label: "Total Members", val: `${project.members} / ${project.maxMembers}` },
                        { label: "Required Skills", val: project.skills || "—" },
                        { label: "Status",        val: status === "full" ? "🎉 Team Full" : "🟢 Active & Open" },
                      ].map(row => (
                        <div key={row.label} className="jt-detail-row">
                          <span style={{ color: "var(--text-muted)" }}>{row.label}</span>
                          <span style={{ fontWeight: 600 }}>{row.val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
