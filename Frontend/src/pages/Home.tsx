const quickActions = ["Create image", "Brainstorm", "Make a plan", "Summarize", "Outline"];

export default function HomePage() {
  return (
    <section className="page">
      <div className="hero">
        <div className="orb" aria-hidden />
        <div className="hero-title">Ready to Create Something New?</div>
        <p className="hero-subtitle">
          Begin calmly with one prompt. Configure softly, act decisively, and let the output flow without
          distractions.
        </p>
      </div>

      <div className="composer">
        <div className="composer-top">
          <span>Ask Anything…</span>
          <div className="icon-dot" aria-hidden />
          <span>Attach</span>
          <div className="icon-dot" aria-hidden />
          <span>Settings</span>
          <div className="icon-dot" aria-hidden />
          <span>Options</span>
        </div>
        <div className="composer-input">
          <input type="text" placeholder="Describe the experience you want" />
          <button type="button" className="primary">Generate</button>
        </div>
        <div className="composer-actions">
          {quickActions.map((item) => (
            <button key={item} type="button" className="chip-button">
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid">
        {[
          { title: "Image Generator", detail: "Create high-quality imagery in seconds." },
          { title: "AI Presentation", detail: "Turn ideas into engaging, polished narratives." },
          { title: "Dev Assistant", detail: "Ship features with calm, guided steps." },
          { title: "Research", detail: "Collect insights without the clutter." },
        ].map((card) => (
          <div className="panel subtle" key={card.title}>
            <div className="panel-title">{card.title}</div>
            <p className="muted">{card.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
