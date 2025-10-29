const projects = [
  {
    id: "proj-1",
    name: "Fall Ethics Syllabus",
    summary: "Curating debate prompts with verified citations for the semester.",
  },
  {
    id: "proj-2",
    name: "Marketing intel board",
    summary: "Competitive battlecards synced from analyst briefings.",
  },
];

export function ProjectsPane() {
  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div key={project.id} className="rounded-lg border border-subtle bg-surface/70 p-4">
          <div className="text-sm font-semibold">{project.name}</div>
          <p className="mt-1 text-xs text-muted">{project.summary}</p>
        </div>
      ))}
    </div>
  );
}
