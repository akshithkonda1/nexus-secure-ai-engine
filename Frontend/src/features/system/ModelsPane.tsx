const models = [
  { name: "Athena.v3", detail: "Deliberative reasoning agent" },
  { name: "Mercury.r2", detail: "Rapid summarization engine" },
  { name: "Helios.audit", detail: "Verification specialist" },
];

export function ModelsPane() {
  return (
    <div className="space-y-3">
      {models.map((model) => (
        <div key={model.name} className="rounded-lg border border-subtle bg-surface/70 p-4">
          <div className="text-sm font-semibold">{model.name}</div>
          <p className="mt-1 text-xs text-muted">{model.detail}</p>
        </div>
      ))}
    </div>
  );
}
