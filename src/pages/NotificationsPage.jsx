import { useEffect, useState, useCallback } from "react";

function timeAgo(ms) {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_META = {
  join_request: { icon: "🔔", color: "#7c5cfc", label: "Join Request" },
  accepted:     { icon: "✅", color: "#06d6a0", label: "Accepted"     },
  rejected:     { icon: "❌", color: "#f97066", label: "Rejected"     },
  team_full:    { icon: "🎉", color: "#f7c948", label: "Team Full"    },
  system:       { icon: "⚡", color: "#3b82f6", label: "System"       },
};

/* localStorage key for persisted notifications */
const STORAGE_KEY = (email) => `collab_notifs_${email}`;

function loadSaved(email) {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY(email)) || "[]"); }
  catch { return []; }
}
function savePersisted(email, notifs) {
  try { localStorage.setItem(STORAGE_KEY(email), JSON.stringify(notifs.slice(0, 100))); }
  catch { /* ignore */ }
}

export default function NotificationsPage({ user }) {
  const [notifs, setNotifs]   = useState(() => loadSaved(user.email));
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");

  /* ── Merge new notifications without losing existing ones ── */
  const mergeNotifs = useCallback((fresh) => {
    setNotifs(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const newOnes     = fresh.filter(n => !existingIds.has(n.id));
      const merged      = [...newOnes, ...prev].sort((a, b) => b.time - a.time);
      savePersisted(user.email, merged);
      return merged;
    });
  }, [user.email]);

  /* ── Fetch live notifications from backend ── */
  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const projRes  = await fetch("http://localhost:8080/projects");
      const allProjs = await projRes.json();
      const mine     = allProjs.filter(p => p.owner === user.email);

      const fresh = [];

      await Promise.all(mine.map(async (p) => {
        try {
          /* Pending join requests → "join_request" notification */
          const reqRes = await fetch(`http://localhost:8080/projects/${p.id}/requests`);
          const reqs   = await reqRes.json();
          reqs.forEach(r => {
            fresh.push({
              id:      `req-${r.id}`,
              type:    "join_request",
              title:   "New Join Request",
              message: `${r.name} wants to join "${p.name}"`,
              detail:  r.skills ? `Skills: ${r.skills}` : r.experience ? `"${r.experience}"` : null,
              time:    Date.now() - 60000, // treat as recent
              read:    false,
            });
          });

          /* Team full → notification */
          if (p.members > 0 && p.members >= p.maxMembers) {
            fresh.push({
              id:      `full-${p.id}`,
              type:    "team_full",
              title:   "🎉 Team is Full!",
              message: `"${p.name}" has reached its max capacity of ${p.maxMembers} members.`,
              detail:  null,
              time:    Date.now() - 3600000,
              read:    false,
            });
          }

          /* Current accepted members → "accepted" notification */
          try {
            const memRes = await fetch(`http://localhost:8080/projects/${p.id}/members`);
            const members = await memRes.json();
            members.forEach(m => {
              fresh.push({
                id:      `acc-${p.id}-${m.id}`,
                type:    "accepted",
                title:   "Member Accepted ✅",
                message: `${m.name || m.email} joined your project "${p.name}"`,
                detail:  m.skill ? `Skill: ${m.skill}` : null,
                time:    Date.now() - 7200000,
                read:    false,
              });
            });
          } catch { /* members endpoint may not exist yet */ }

        } catch { /* ignore per-project errors */ }
      }));

      /* System welcome notification */
      fresh.push({
        id:      "sys-welcome",
        type:    "system",
        title:   "Welcome to CollabHub ⚡",
        message: "Your account is active. Start exploring projects or create your own!",
        detail:  null,
        time:    Date.now() - 86400000 * 3,
        read:    true,
      });

      mergeNotifs(fresh);
    } catch (e) {
      console.error("Notification fetch error:", e);
    }
    setLoading(false);
  }, [user.email, mergeNotifs]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  /* ── Actions ── */
  const markRead    = (id)  => setNotifs(n => { const u = n.map(x => x.id === id ? { ...x, read: true } : x); savePersisted(user.email, u); return u; });
  const markAllRead = ()    => setNotifs(n => { const u = n.map(x => ({ ...x, read: true }));                   savePersisted(user.email, u); return u; });
  const dismiss     = (id)  => setNotifs(n => { const u = n.filter(x => x.id !== id);                           savePersisted(user.email, u); return u; });
  const clearAll    = ()    => { setNotifs([]); savePersisted(user.email, []); };

  const unread  = notifs.filter(n => !n.read).length;
  const visible = filter === "all"
    ? notifs
    : filter === "unread"
    ? notifs.filter(n => !n.read)
    : notifs.filter(n => n.type === filter);

  const filterOptions = [
    { key: "all",          label: `All (${notifs.length})`                              },
    { key: "unread",       label: `Unread (${unread})`                                  },
    { key: "join_request", label: `Requests (${notifs.filter(n=>n.type==="join_request").length})` },
    { key: "accepted",     label: `Accepted (${notifs.filter(n=>n.type==="accepted").length})`     },
    { key: "team_full",    label: `Team Full (${notifs.filter(n=>n.type==="team_full").length})`   },
  ];

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div className="mesh-bg" />

      <style>{`
        .np-header {
          display: flex; justify-content: space-between;
          align-items: flex-start; flex-wrap: wrap; gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .np-filters {
          display: flex; gap: 0.45rem; flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .np-filter-btn {
          padding: 0.38rem 0.85rem; border-radius: 50px;
          border: 1px solid var(--border);
          background: var(--bg3); color: var(--text-muted);
          font-size: 0.78rem; font-weight: 600; cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .np-filter-btn.active, .np-filter-btn:hover {
          background: var(--accent, #7c5cfc);
          color: #fff; border-color: var(--accent, #7c5cfc);
        }

        .np-item {
          display: flex; align-items: flex-start; gap: 1rem;
          padding: 1.1rem 1.25rem;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: var(--bg2);
          transition: transform 0.15s, border-color 0.15s;
          position: relative; cursor: pointer;
          animation: fadeUp 0.3s ease both;
        }
        .np-item:hover { transform: translateX(4px); border-color: rgba(124,92,252,0.4); }
        .np-item.unread {
          background: var(--bg3);
          border-color: rgba(124,92,252,0.3);
        }
        .np-item.unread::before {
          content: '';
          position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          width: 3px; height: 55%; border-radius: 0 3px 3px 0;
          background: var(--accent, #7c5cfc);
        }

        .np-icon {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.15rem; flex-shrink: 0;
        }
        .np-body { flex: 1; min-width: 0; }
        .np-title { font-weight: 700; font-size: 0.92rem; color: var(--text); margin-bottom: 0.2rem; }
        .np-msg   { font-size: 0.83rem; color: var(--text-muted); line-height: 1.45; }
        .np-detail {
          display: inline-block; margin-top: 0.35rem;
          font-size: 0.77rem; color: var(--text-muted);
          background: var(--bg3); border-radius: 6px; padding: 0.2rem 0.6rem;
        }
        .np-time { font-size: 0.74rem; color: var(--text-muted); white-space: nowrap; flex-shrink: 0; }
        .np-actions { display: flex; gap: 0.4rem; margin-top: 0.5rem; }
        .np-btn {
          padding: 0.28rem 0.65rem; border-radius: 6px; font-size: 0.74rem;
          font-weight: 600; cursor: pointer;
          border: 1px solid var(--border); background: var(--bg3); color: var(--text-muted);
          transition: all 0.15s;
        }
        .np-btn:hover        { background: var(--bg2); color: var(--text); }
        .np-btn.dismiss:hover { background: rgba(249,112,102,0.15); border-color: #f97066; color: #f97066; }

        .np-unread-dot {
          width: 9px; height: 9px; border-radius: 50%;
          flex-shrink: 0; margin-top: 0.35rem;
        }

        .np-empty {
          text-align: center; padding: 4rem 2rem; color: var(--text-muted);
        }
        .np-empty-icon {
          font-size: 3.5rem; margin-bottom: 1rem;
          animation: floatIcon 3s ease-in-out infinite;
        }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div className="np-header">
          <div>
            <div className="section-title">🔔 Notifications</div>
            <div className="section-sub">
              {unread > 0
                ? `You have ${unread} unread notification${unread > 1 ? "s" : ""}`
                : "You're all caught up!"}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {unread > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={markAllRead} style={{ borderRadius: "10px" }}>
                ✓ Mark all read
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={fetchNotifs} style={{ borderRadius: "10px" }}>
              🔄 Refresh
            </button>
            {notifs.length > 0 && (
              <button className="btn btn-danger btn-sm" onClick={clearAll} style={{ borderRadius: "10px" }}>
                🗑 Clear all
              </button>
            )}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="np-filters">
          {filterOptions.map(f => (
            <button
              key={f.key}
              className={`np-filter-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ animation: "pulse 1.2s infinite" }}>⏳</div>
            <h3>Loading notifications…</h3>
          </div>
        ) : visible.length === 0 ? (
          <div className="np-empty">
            <div className="np-empty-icon">🎉</div>
            <h3 style={{ color: "var(--text)", marginBottom: "0.5rem" }}>All clear!</h3>
            <p>No notifications here yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {visible.map((n, i) => {
              const meta = TYPE_META[n.type] || TYPE_META.system;
              return (
                <div
                  key={n.id}
                  className={`np-item ${!n.read ? "unread" : ""}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => markRead(n.id)}>

                  {/* Icon */}
                  <div className="np-icon" style={{ background: meta.color + "20" }}>
                    {meta.icon}
                  </div>

                  {/* Body */}
                  <div className="np-body">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                      <div className="np-title">{n.title}</div>
                      <div className="np-time">{timeAgo(n.time)}</div>
                    </div>
                    <div className="np-msg">{n.message}</div>
                    {n.detail && <div className="np-detail">{n.detail}</div>}
                    <div className="np-actions" onClick={e => e.stopPropagation()}>
                      {!n.read && (
                        <button className="np-btn" onClick={() => markRead(n.id)}>
                          Mark read
                        </button>
                      )}
                      <button className="np-btn dismiss" onClick={() => dismiss(n.id)}>
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div className="np-unread-dot" style={{ background: meta.color }} />
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
