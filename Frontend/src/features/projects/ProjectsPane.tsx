export function ProjectsPane({ standalone }: { standalone?: boolean }) {
  return (
    <div className={standalone ? "" : "hidden"}>
      <h2 className="text-2xl font-semibold mb-4">Projects</h2>
      <div className="text-sm text-muted-foreground">List and details will appear here.</div>
    </div>
  );
}
