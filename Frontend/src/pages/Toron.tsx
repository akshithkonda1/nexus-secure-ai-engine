const sessionFeed = [
  {
    title: "Session output",
    detail: "Results will appear here, flowing downward in order.",
  },
  {
    title: "Recent note",
    detail: "Capture the next action without adding noise.",
  },
];

const modes = ["Prompt", "Plan", "Refine", "Summarize", "Image"];

export default function ToronPage() {
  return (
    <section className="page">
      <div className="hero">
        <div className="orb" aria-hidden />
        <div className="hero-title">Toron</div>
        <p className="hero-subtitle">Calm input. Clear output. One decisive surface.</p>
        <div className="hero-actions">
          {modes.slice(0, 3).map((item, index) => (
            <button
              key={item}
              type="button"
              className={index === 0 ? "chip-button active" : "chip-button"}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="composer">
        <div className="composer-input">
          <input type="text" placeholder="Describe what you need" />
          <div className="composer-icons">
            <button type="button" className="ghost pill">Attach</button>
            <button type="button" className="ghost pill">System</button>
          </div>
          <button type="button" className="primary">Send</button>
        </div>
        <div className="composer-actions">
          {modes.map((item, index) => (
            <button
              key={item}
              type="button"
              className={index === 0 ? "chip-button active" : "chip-button"}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="feed">
        {sessionFeed.map((entry) => (
          <div className="feed-card" key={entry.title}>
            <div className="feed-title">{entry.title}</div>
            <p className="feed-body">{entry.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
