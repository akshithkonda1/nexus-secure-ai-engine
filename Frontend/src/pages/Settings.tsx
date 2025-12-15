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
      <div className="hero">
        <div className="orb" aria-hidden />
        <div className="hero-title">Settings</div>
        <p className="hero-subtitle">Plain controls without distraction.</p>
      </div>
      <div className="stack">
        {sections.map((section) => (
          <div className="panel subtle" key={section.title}>
            <div className="panel-title">{section.title}</div>
            <div className="list">
              {section.items.map((item) => (
                <label className="toggle" key={item}>
                  <span>{item}</span>
                  <span className="text-muted">Enabled</span>
                  <input type="checkbox" defaultChecked />
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
