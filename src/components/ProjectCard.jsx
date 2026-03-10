export default function ProjectCard({ project, user, onJoin, onDelete }) {
  const isOwner = project.owner === user.email;
  const isFull = project.members >= project.maxMembers;
  const fillPct = Math.round((project.members / project.maxMembers) * 100);

  const skills = project.skills ? project.skills.split(",").map(s => s.trim()) : [];

  return (
    <div className="card card-glow slide-up" style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      {/* Header */}
      <div className="flex-between">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.3px" }}>
          {project.name}
        </h3>
        {isOwner && <span className="badge badge-yellow">👑 Owner</span>}
        {isFull && !isOwner && <span className="badge badge-red">Full</span>}
      </div>

      {/* Description */}
      <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
        {project.description || "No description provided."}
      </p>

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          {skills.map(s => <span key={s} className="tag">{s}</span>)}
        </div>
      )}

      {/* Member bar */}
      <div>
        <div className="flex-between mb-1" style={{ marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Team size</span>
          <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
            {project.members} / {project.maxMembers}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${fillPct}%` }} />
        </div>
      </div>

      {/* Owner chip */}
      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
        📧 {project.owner}
      </div>

      {/* Actions */}
      <div className="flex gap-1" style={{ marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
        {isOwner ? (
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(project.id)}>
            🗑 Delete
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            disabled={isFull}
            onClick={() => onJoin(project)}
            style={{ flex: 1 }}>
            {isFull ? "Team Full" : "Apply to Join →"}
          </button>
        )}
      </div>
    </div>
  );
}
