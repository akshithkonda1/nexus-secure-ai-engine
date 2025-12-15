const modules = [
  { title: "Notes", detail: "Capture and align research" },
  { title: "Tasks", detail: "Track execution calmly" },
  { title: "Library", detail: "Store references and outputs" },
];

export default function WorkspacePage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.08em] text-[var(--text-muted)]">Workspace</p>
        <h1 className="text-2xl font-semibold text-[var(--text-strong)]">Organized areas for ongoing work</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          Keep tasks, notes, and resources aligned. This view stays minimal for focused updates.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {modules.map((module) => (
          <div
            key={module.title}
            className="rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-4 py-5 text-sm"
          >
            <div className="text-base font-semibold text-[var(--text-primary)]">{module.title}</div>
            <p className="mt-2 text-[var(--text-muted)]">{module.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] p-5 text-sm text-[var(--text-muted)]">
        <div className="text-[var(--text-primary)]">Structure</div>
        <p className="mt-2 leading-relaxed">
          Arrange modules as needed. Add project outlines or connect Toron threads to a workspace when ready.
        </p>
      </div>
    </section>
  );
}
