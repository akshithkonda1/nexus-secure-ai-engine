const entries = [
  { title: "Session output", detail: "Results will be listed here once generated." },
  { title: "Recent note", detail: "Keep this space focused on the next action." },
];

export default function ToronPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div className="headline">Toron</div>
        <p className="muted">Calm input. Clear output.</p>
      </div>
      <div className="panel">
        <label className="field">
          <span>Input</span>
          <textarea placeholder="Describe what you need" rows={3} />
        </label>
        <div className="actions">
          <button type="button" className="primary">Submit</button>
          <button type="button" className="ghost">Secondary</button>
        </div>
      </div>
      <div className="stack">
        {entries.map((item) => (
          <div className="panel subtle" key={item.title}>
            <div className="panel-title">{item.title}</div>
            <p className="muted">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
