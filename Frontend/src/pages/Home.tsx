const quickActions = ["Prompt", "Chat", "Image"];
const composerChips = ["Attach", "Tone", "System" ];
const panels = [
  { title: "Image Generator", detail: "Quietly craft polished visuals." },
  { title: "Presentation", detail: "Shape clear, concise narratives." },
  { title: "Dev Assistant", detail: "Ship with confident guidance." },
  { title: "Research", detail: "Hold only curated, relevant sources." },
];

export default function HomePage() {
  return (
    <section className="page">
      <div className="hero">
        <div className="orb" aria-hidden />
        <div className="hero-title">Ryuzen</div>
        <p className="hero-subtitle">Start centered. One prompt. Clear output.</p>
        <div className="hero-actions">
          {quickActions.map((item) => (
            <button key={item} type="button" className="chip-button">
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="composer">
        <div className="composer-input">
          <input type="text" placeholder="Describe the experience you want" />
          <div className="composer-icons">
            {composerChips.map((chip) => (
              <button key={chip} type="button" className="ghost pill">
                {chip}
              </button>
            ))}
          </div>
          <button type="button" className="primary">Generate</button>
        </div>
      </div>

      <div className="grid">
        {panels.map((card) => (
          <div className="panel subtle" key={card.title}>
            <div className="panel-title">{card.title}</div>
            <p className="muted">{card.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
