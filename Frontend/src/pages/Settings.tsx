const sections = [
  { title: "Account", items: ["Profile", "Email", "Sessions"] },
  { title: "Security", items: ["MFA", "Keys", "Device approvals"] },
  { title: "Privacy", items: ["Data retention", "Visibility", "Exports"] },
  { title: "Telemetry", items: ["Usage analytics", "Error reports"] },
  { title: "Toron", items: ["Default model", "Session limits"] },
  { title: "Workspace", items: ["Members", "Permissions"] },
];

export default function SettingsPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div className="headline">Settings</div>
        <p className="muted">Plain controls without distraction.</p>
      </div>
      <div className="stack">
        {sections.map((section) => (
          <div className="panel subtle" key={section.title}>
            <div className="panel-title">{section.title}</div>
            <div className="list">
              {section.items.map((item) => (
                <label className="toggle" key={item}>
                  <span>{item}</span>
                  <input type="checkbox" />
                  <span className="switch" aria-hidden />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
