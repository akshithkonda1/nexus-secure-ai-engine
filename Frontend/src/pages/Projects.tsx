import React from "react";

const Projects: React.FC = () => {
  const projects = [
    { name: "Nebula", status: "In motion", owner: "Nova" },
    { name: "Aurora", status: "Design lock", owner: "Aster" },
  ];

  return (
    <div className="glass-panel" style={{ padding: 20, display: "grid", gap: 14 }}>
      <div className="section-header">
        <h2 style={{ margin: 0 }}>Projects</h2>
        <span style={{ color: "var(--text-secondary)" }}>Contextually rooted to Toron</span>
      </div>
      <table>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Status</th>
            <th align="left">Owner</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.name}>
              <td>{project.name}</td>
              <td>{project.status}</td>
              <td>{project.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Projects;
