export default function HomePage() {
  return (
    <section className="page">
      <div className="page-header">
        <div className="headline">Ready when you are</div>
        <p className="muted">Begin with a calm prompt and continue your work.</p>
      </div>
      <div className="panel">
        <label className="field">
          <span>Prompt</span>
          <input type="text" placeholder="State your intent" />
        </label>
        <div className="actions">
          <button type="button" className="primary">Start</button>
          <button type="button" className="ghost">Clear</button>
        </div>
      </div>
    </section>
  );
}
