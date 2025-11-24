import { ToronPanel } from "@/components/common/ToronPanel";

const tiles = [
  { title: "Research", subtitle: "Autonomous data pulls" },
  { title: "Workspace", subtitle: "Pinned mission briefs" },
  { title: "Documents", subtitle: "Shared intelligence" },
  { title: "History", subtitle: "Trace every decision" },
  { title: "Security", subtitle: "Guardrails & audits" },
  { title: "Launch", subtitle: "Run orchestration" },
];

export function ToronGrid() {
  return (
    <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tiles.map((tile) => (
        <ToronPanel key={tile.title} title={tile.title} subtitle={tile.subtitle} />
      ))}
    </div>
  );
}
