const sessionFeed = [
  {
    title: "Session output",
    detail: "Results will be listed here once generated. Keep the flow focused on the latest response.",
  },
  {
    title: "Recent note",
    detail: "Use this space for the next action without adding noise.",
  },
];

const modes = ["Create image", "Brainstorm", "Make a plan", "Summarize", "Refine"];

export default function ToronPage() {
  return (
    <section className="page">
      <div className="hero">
        <div className="orb" aria-hidden />
        <div className="hero-title">Toron</div>
        <p className="hero-subtitle">Calm input. Clear output. One decisive surface.</p>
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
          <input type="text" placeholder="Describe what you need" />
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
