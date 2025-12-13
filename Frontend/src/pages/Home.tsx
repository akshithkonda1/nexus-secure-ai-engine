function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass-panel section-card">
      <h2 className="section-title">{title}</h2>
      <p className="section-body">{body}</p>
    </div>
  );
}

function Home() {
  return (
    <div className="page">
      <div className="glass-panel hero">
        <div>
          <p className="section-body">Calm cosmic intelligence</p>
          <h1>Ryuzen reintroduces trust to AI operations.</h1>
        </div>
        <p className="section-body">
          A deliberate frontend designed to orient teams, keep context clear, and let the system breathe.
          No hidden state, no distractions—just clarity.
        </p>
      </div>
      <Section
        title="What is Ryuzen"
        body="Ryuzen is a secure intelligence surface where deliberate workflows, accountable assistance, and transparent oversight converge."
      />
      <Section
        title="Why Ryuzen Exists"
        body="Teams deserve AI that is predictable, auditable, and calm. Ryuzen enforces those qualities at the interface level."
      />
      <Section
        title="ALOE Framework"
        body="Align, Link, Observe, and Elevate—four pillars that keep every interaction measured, explainable, and recoverable."
      />
      <Section
        title="Toron"
        body="Toron is the conversational core tuned for operational clarity. Sessions stay contained, controls stay visible, and responses respect the user."
      />
      <Section
        title="Workspace"
        body="A central canvas for assembling widgets and artifacts without chat. Structured, intentional, and ready for transparent collaboration."
      />
      <Section
        title="Design for Transparency"
        body="Every route is explicit. State resets on navigation. The cosmic identity is present but never interferes with focus."
      />
    </div>
  );
}

export default Home;
