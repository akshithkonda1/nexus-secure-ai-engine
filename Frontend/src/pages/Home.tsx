const quickActions = ["Create Image", "Brainstorm", "Make a plan"];

export default function HomePage() {
  return (
    <section className="page">
      <div className="hero">
        <div className="orb" aria-hidden="true" />
        <div className="hero-title">Ready to Create Something New?</div>
        <p className="hero-subtitle">
          Begin with a single prompt and watch your ideas come to life with powerful AI assistance.
        </p>
      </div>

      <div className="composer">
        <div className="composer-top">
          <span>Ask Anything...</span>
          <div className="icon-dot" aria-hidden="true" />
          <span>Attach</span>
          <div className="icon-dot" aria-hidden="true" />
          <span>Settings</span>
          <div className="icon-dot" aria-hidden="true" />
          <span>Options</span>
        </div>
        <div className="composer-input">
          <input type="text" placeholder="Describe the experience you want to create..." />
          <button type="button" className="primary">
            <span>Generate</span>
          </button>
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
          { 
            title: "Image Generator", 
            detail: "Create high-quality images instantly from text descriptions." 
          },
          { 
            title: "AI Presentation", 
            detail: "Turn ideas into engaging, professional presentations." 
          },
          { 
            title: "Dev Assistant", 
            detail: "Generate clean, production-ready code in seconds." 
          },
        ].map((card) => (
          <div className="panel" key={card.title}>
            <div className="panel-title">{card.title}</div>
            <p className="muted">{card.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
