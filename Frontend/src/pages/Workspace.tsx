const modules = [
  { title: "Notes", detail: "Capture and align research" },
  { title: "Tasks", detail: "Track execution calmly" },
  { title: "Library", detail: "Store references and outputs" },
];

export default function WorkspacePage() {
  return (
    <section className="flex flex-col gap-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">Workspace</p>
        <h1 className="text-[28px] font-semibold text-[var(--text-strong)]">Organized areas for ongoing work</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          Keep tasks, notes, and resources aligned. This view stays minimal for focused updates.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map((module) => (
          <div
            key={module.title}
            className="rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-5 py-6 text-sm shadow-[0_10px_26px_-24px_var(--ryuzen-cod-gray)]"
          >
            <div className="text-base font-semibold text-[var(--text-primary)]">{module.title}</div>
            <p className="mt-2 text-[var(--text-muted)]">{module.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] p-6 text-sm text-[var(--text-muted)] shadow-[0_10px_26px_-24px_var(--ryuzen-cod-gray)]">
        <div className="text-[var(--text-primary)]">Structure</div>
        <p className="mt-2 leading-relaxed">
          Arrange modules as needed. Add project outlines or connect Toron threads to a workspace when ready.
        </p>
      </div>
    </section>
  );
}
