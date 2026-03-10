import { useEffect, useState } from "react";
import { getAllProjects, deleteProject } from "../services/apiService";
import ProjectCard from "../components/ProjectCard";
import JoinModal from "../components/JoinModal";

export default function ProjectListPage({ user }) {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      projects.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.skills || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      )
    );
  }, [search, projects]);

  const load = async () => {
    setLoading(true);
    const data = await getAllProjects();
    setProjects(data);
    setFiltered(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    await deleteProject(id);
    load();
  };

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div className="mesh-bg" />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div className="flex-between" style={{ marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="section-title">🚀 Projects</div>
            <div className="section-sub">Find a project that matches your skills</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <input
              className="form-input"
              style={{ width: 260 }}
              placeholder="🔍 Search projects or skills…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="badge badge-purple">{filtered.length} projects</span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ animation: "pulse 1.2s infinite" }}>⏳</div>
            <h3>Loading projects…</h3>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔭</div>
            <h3>No projects found</h3>
            <p>Try a different search, or be the first to create one!</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                user={user}
                onJoin={setSelectedProject}
                onDelete={handleDelete}
              />
            ))}
          </div>
          
        )}
      </div>

      {selectedProject && (
        <JoinModal
          project={selectedProject}
          user={user}
          onClose={() => { setSelectedProject(null); load(); }}
        />
      )}
    </div>
  );
}
