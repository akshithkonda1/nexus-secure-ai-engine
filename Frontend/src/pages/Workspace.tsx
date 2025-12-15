const modules = [
  { title: "Notes", detail: "Capture decisions and references." },
  { title: "Tasks", detail: "Track the next committed step." },
  { title: "Image", detail: "Compose visuals for narratives." },
  { title: "Presentation", detail: "Lay out structured stories." },
  { title: "Research", detail: "Hold curated sources only." },
  { title: "Dev Assistant", detail: "Ship quietly with guidance." },
];

export default function WorkspacePage() {
  return (
    <section className="page">
      <div className="hero">
        <div className="orb" aria-hidden />
        <div className="hero-title">Workspace</div>
        <p className="hero-subtitle">Modular surfaces for focused work. Arrange what matters, ignore the rest.</p>
      </div>

      <div className="grid">
        {modules.map((card) => (
          <div className="panel subtle" key={card.title}>
            <div className="panel-title">{card.title}</div>
            <p className="muted">{card.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
