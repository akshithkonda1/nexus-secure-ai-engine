const modules = [
  { title: "Notes", detail: "Capture and organize your thoughts and ideas." },
  { title: "Tasks", detail: "Track your progress and stay organized." },
  { title: "Image Generator", detail: "Create stunning visuals from descriptions." },
  { title: "Presentation", detail: "Build professional slide decks effortlessly." },
  { title: "Research", detail: "Gather and synthesize information efficiently." },
  { title: "Dev Assistant", detail: "Generate and debug code with AI help." },
];

export default function WorkspacePage() {
  return (
    <section className="page">
      <div className="hero">
        <div className="orb" aria-hidden="true" />
        <div className="hero-title">Workspace</div>
        <p className="hero-subtitle">
          A modular environment designed for focused, productive work across multiple domains.
        </p>
      </div>

      <div className="grid">
        {modules.map((card) => (
          <div className="panel" key={card.title}>
            <div className="panel-title">{card.title}</div>
            <p className="muted">{card.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
