export default function WorkspacePage() {
  return (
    <section className="page">
      <div className="page-header">
        <div className="headline">Workspace</div>
        <p className="muted">Quiet modules arranged for focus.</p>
      </div>
      <div className="grid">
        <div className="panel subtle">
          <div className="panel-title">Notes</div>
          <p className="muted">Hold decisions and references.</p>
        </div>
        <div className="panel subtle">
          <div className="panel-title">Tasks</div>
          <p className="muted">Track the next action only.</p>
        </div>
        <div className="panel subtle">
          <div className="panel-title">References</div>
          <p className="muted">Attach the essentials.</p>
        </div>
      </div>
    </section>
  );
}
