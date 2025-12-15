const recent = [
  { title: "Toron", detail: "Reviewed system prompts" },
  { title: "Workspace", detail: "Updated project outline" },
  { title: "Settings", detail: "Changed theme preference" },
];

export default function HomeRail() {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-semibold text-[var(--text-strong)]">Recent</div>
      <div className="flex flex-col gap-3">
        {recent.map((item) => (
          <div
            key={item.title + item.detail}
            className="rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-3 py-3"
          >
            <div className="text-sm font-medium text-[var(--text-primary)]">{item.title}</div>
            <p className="text-xs text-[var(--text-muted)]">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
