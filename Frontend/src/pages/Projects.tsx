const projects = [
  { id: "p1", name: "Security Launch", status: "Tracking" },
  { id: "p2", name: "Data Platform", status: "Planning" },
  { id: "p3", name: "Compliance Refresh", status: "In review" },
];

function Projects() {
  return (
    <div className="page">
      <div className="glass-panel hero">
        <div>
          <p className="section-body">Projects</p>
          <h1>Route projects directly into Toron context.</h1>
        </div>
        <p className="section-body">Minimal, accountable tracking that pairs with conversations without leaking state.</p>
      </div>
      <div className="glass-panel section-card">
        <div className="simple-list">
          {projects.map((project) => (
            <div key={project.id} className="simple-item">
              <h3 className="section-title">{project.name}</h3>
              <p className="section-body">Status: {project.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Projects;
