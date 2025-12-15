const sessionFeed = [
  {
    title: "Ready to start",
    detail: "Your AI assistant is ready to help with any task. Start by typing your prompt below.",
  },
];

const modes = ["Create image", "Brainstorm", "Make a plan", "Generate Code"];

export default function ToronPage() {
  return (
    <section className="page">
      <div className="hero">
        <div className="orb" aria-hidden="true" />
        <div className="hero-title">Toron</div>
        <p className="hero-subtitle">Your intelligent conversation partner for creative and analytical tasks.</p>
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
          <input type="text" placeholder="Describe what you need..." />
          <button type="button" className="primary">
            <span>Send</span>
          </button>
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
