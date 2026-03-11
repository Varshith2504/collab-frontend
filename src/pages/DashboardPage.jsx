import { useEffect, useState } from "react";
import {
  getAllProjects, getJoinRequests, acceptRequest,
  rejectRequest, deleteProject
} from "../services/apiService";

/* ── helper: fetch team members for a project ── */
async function fetchTeamMembers(projectId) {
  try {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/members`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function removeTeamMember(projectId, memberId) {
  try {
    await fetch(`${BASE_URL}/projects/${projectId}/members/${memberId}`, {
      method: "DELETE"
    });
    return true;
  } catch {
    return false;
  }
}

export default function DashboardPage({ user }) {
  const [myProjects, setMyProjects]     = useState([]);
  const [requestsMap, setRequestsMap]   = useState({});
  const [membersMap, setMembersMap]     = useState({});
  const [loading, setLoading]           = useState(true);
  const [expandedId, setExpandedId]     = useState(null);
  const [activeTab, setActiveTab]       = useState({}); // { [projectId]: "requests" | "members" }
  const [actionMsg, setActionMsg]       = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const all  = await getAllProjects();
    const mine = all.filter(p => p.owner === user.email);
    setMyProjects(mine);

    const reqMap = {};
    const memMap = {};
    await Promise.all(mine.map(async p => {
      reqMap[p.id] = await getJoinRequests(p.id);
      memMap[p.id] = await fetchTeamMembers(p.id);
    }));
    setRequestsMap(reqMap);
    setMembersMap(memMap);
    setLoading(false);
  };

  const flash = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 2500);
  };

  const handleAccept = async (project, req) => {
    await acceptRequest(project.id, req);
    flash(`✅ ${req.name} accepted!`);
    load();
  };

  const handleReject = async (project, req) => {
    await rejectRequest(project.id, req);
    flash(`❌ ${req.name} rejected.`);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project permanently?")) return;
    await deleteProject(id);
    load();
  };

  const handleRemoveMember = async (project, member) => {
    if (!confirm(`Remove ${member.name || member.email} from ${project.name}?`)) return;
    await removeTeamMember(project.id, member.id);
    flash(`🗑 Member removed.`);
    load();
  };

  const toggleProject = (id) => {
    setExpandedId(prev => prev === id ? null : id);
    setActiveTab(prev => ({ ...prev, [id]: prev[id] || "requests" }));
  };

  const totalRequests = Object.values(requestsMap).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div className="mesh-bg" />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div className="flex-between" style={{ marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="section-title">📋 My Dashboard</div>
            <div className="section-sub">Manage your projects, team members and applicants</div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <span className="badge badge-purple">🚀 {myProjects.length} Projects</span>
            {totalRequests > 0 && (
              <span className="badge badge-yellow">🔔 {totalRequests} Pending</span>
            )}
          </div>
        </div>

        {actionMsg && (
          <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{actionMsg}</div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ animation: "pulse 1.2s infinite" }}>⏳</div>
            <h3>Loading dashboard…</h3>
          </div>
        ) : myProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>No projects yet</h3>
            <p>Create your first project to start building a team!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {myProjects.map(project => {
              const reqs      = requestsMap[project.id] || [];
              const members   = membersMap[project.id]  || [];
              const isExpanded = expandedId === project.id;
              const tab        = activeTab[project.id] || "requests";
              const fillPct   = Math.round((project.members / project.maxMembers) * 100);

              return (
                <div key={project.id} className="card card-glow">

                  {/* ── Project summary row ── */}
                  <div
                    className="flex-between"
                    style={{ flexWrap: "wrap", gap: "0.75rem", cursor: "pointer" }}
                    onClick={() => toggleProject(project.id)}>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{project.name}</h3>
                        {reqs.length > 0 && (
                          <span className="badge badge-yellow">🔔 {reqs.length}</span>
                        )}
                        {members.length > 0 && (
                          <span className="badge badge-purple">👥 {members.length}</span>
                        )}
                      </div>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {project.description || "No description."}
                      </p>
                      <div style={{ marginTop: "0.6rem" }}>
                        {(project.skills || "").split(",").map(s => s.trim()).filter(Boolean).map(s =>
                          <span key={s} className="tag">{s}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 150 }}>
                      {/* Progress bar */}
                      <div>
                        <div className="flex-between" style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                          <span>Members</span>
                          <span>{project.members}/{project.maxMembers}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${fillPct}%` }} />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: "0.4rem" }} onClick={e => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleProject(project.id)}
                          style={{ flex: 1 }}>
                          {isExpanded ? "▲ Hide" : "▼ View"}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project.id)}>
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Expanded panel ── */}
                  {isExpanded && (
                    <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>

                      {/* Tab bar */}
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                        <button
                          onClick={() => setActiveTab(p => ({ ...p, [project.id]: "requests" }))}
                          style={{
                            padding: "0.45rem 1rem", borderRadius: "8px", border: "1px solid var(--border)",
                            background: tab === "requests" ? "var(--accent, #7c5cfc)" : "var(--bg3)",
                            color: tab === "requests" ? "#fff" : "var(--text-muted)",
                            fontWeight: 600, fontSize: "0.83rem", cursor: "pointer"
                          }}>
                          🔔 Requests {reqs.length > 0 && `(${reqs.length})`}
                        </button>
                        <button
                          onClick={() => setActiveTab(p => ({ ...p, [project.id]: "members" }))}
                          style={{
                            padding: "0.45rem 1rem", borderRadius: "8px", border: "1px solid var(--border)",
                            background: tab === "members" ? "var(--accent, #7c5cfc)" : "var(--bg3)",
                            color: tab === "members" ? "#fff" : "var(--text-muted)",
                            fontWeight: 600, fontSize: "0.83rem", cursor: "pointer"
                          }}>
                          👥 Team Members {members.length > 0 && `(${members.length})`}
                        </button>
                      </div>

                      {/* ── REQUESTS TAB ── */}
                      {tab === "requests" && (
                        reqs.length === 0 ? (
                          <div style={{ color: "var(--text-muted)", fontSize: "0.88rem", textAlign: "center", padding: "1.5rem 0" }}>
                            No pending join requests.
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {reqs.map(req => (
                              <div key={req.id} style={{
                                background: "var(--bg3)", borderRadius: "12px",
                                padding: "1rem", border: "1px solid var(--border)",
                                display: "flex", justifyContent: "space-between",
                                alignItems: "flex-start", gap: "1rem", flexWrap: "wrap"
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>{req.name}</div>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
                                    📧 {req.email}
                                  </div>
                                  {req.skills && (
                                    <div style={{ marginBottom: "0.3rem" }}>
                                      {req.skills.split(",").map(s => s.trim()).map(s =>
                                        <span key={s} className="tag">{s}</span>
                                      )}
                                    </div>
                                  )}
                                  {req.experience && (
                                    <div style={{
                                      fontSize: "0.83rem", color: "var(--text-muted)",
                                      background: "var(--bg2)", borderRadius: "8px",
                                      padding: "0.5rem 0.75rem", marginTop: "0.4rem"
                                    }}>
                                      "{req.experience}"
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                                  <button className="btn btn-success btn-sm"
                                    onClick={() => handleAccept(project, req)}>
                                    ✓ Accept
                                  </button>
                                  <button className="btn btn-danger btn-sm"
                                    onClick={() => handleReject(project, req)}>
                                    ✕ Reject
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}

                      {/* ── TEAM MEMBERS TAB ── */}
                      {tab === "members" && (
                        members.length === 0 ? (
                          <div style={{ color: "var(--text-muted)", fontSize: "0.88rem", textAlign: "center", padding: "1.5rem 0" }}>
                            No team members yet. Accept requests to add members!
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {members.map(member => (
                              <div key={member.id} style={{
                                background: "var(--bg3)", borderRadius: "12px",
                                padding: "1rem", border: "1px solid var(--border)",
                                display: "flex", justifyContent: "space-between",
                                alignItems: "center", gap: "1rem", flexWrap: "wrap"
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flex: 1 }}>
                                  {/* Avatar */}
                                  <div style={{
                                    width: 42, height: 42, borderRadius: "50%",
                                    background: "linear-gradient(135deg, #7c5cfc, #f97066)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 700, fontSize: "1rem", color: "#fff", flexShrink: 0
                                  }}>
                                    {(member.name || member.email || "?").charAt(0).toUpperCase()}
                                  </div>

                                  <div>
                                    <div style={{ fontWeight: 700, marginBottom: "0.15rem" }}>
                                      {member.name || "—"}
                                    </div>
                                    <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                                      📧 {member.email || "—"}
                                    </div>
                                    {member.skill && (
                                      <div style={{ marginTop: "0.3rem" }}>
                                        <span className="tag">{member.skill}</span>
                                      </div>
                                    )}
                                    {member.studentId && (
                                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                                        ID: #{member.studentId}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Remove button */}
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemoveMember(project, member)}
                                  style={{ flexShrink: 0 }}>
                                  🗑 Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )
                      )}
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
