const sections = [
  { title: "Account", items: ["Profile", "Email", "Sessions"] },
  { title: "Security", items: ["MFA", "API Keys", "Device Approvals"] },
  { title: "Privacy", items: ["Data Retention", "Visibility", "Exports"] },
  { title: "Preferences", items: ["Theme", "Language", "Notifications"] },
  {title: "Toron", items: ["Default Mode", "Response Length", "Tone"] },
  { title: "Workspace", items: ["Default Modules", "Layout", "Shortcuts"] },
];

export default function SettingsPage() {
  return (
    <section className="page">
      <div className="hero">
        <div className="orb" aria-hidden="true" />
        <div className="hero-title">Settings</div>
        <p className="hero-subtitle">Customize your experience and manage your account preferences.</p>
      </div>
      
      <div className="stack">
        {sections.map((section) => (
          <div className="panel" key={section.title}>
            <div className="panel-title">{section.title}</div>
            <div className="list">
              {section.items.map((item) => (
                <div className="toggle" key={item}>
                  <span>{item}</span>
                  <span className="text-muted">Enabled</span>
                  <input type="checkbox" defaultChecked />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
