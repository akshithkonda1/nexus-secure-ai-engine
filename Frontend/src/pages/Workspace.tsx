const widgets = [
  { id: "w1", title: "Data canvas", detail: "Pin insights, charts, and reviews." },
  { id: "w2", title: "Risk lens", detail: "Live risk posture indicators for current work." },
  { id: "w3", title: "Timeline", detail: "Sequenced milestones with ownership." },
];

function Workspace() {
  return (
    <div className="page">
      <div className="glass-panel hero">
        <div>
          <p className="section-body">Central operations canvas</p>
          <h1>Workspace keeps context visible without chat.</h1>
        </div>
        <p className="section-body">
          Arrange widgets, monitor progress, and keep the control bar ready for whatever the team needs next.
        </p>
      </div>
      <div className="glass-panel workspace-canvas">
        <div className="workspace-grid">
          {widgets.map((widget) => (
            <div key={widget.id} className="widget">
              <h3 className="section-title">{widget.title}</h3>
              <p className="section-body">{widget.detail}</p>
            </div>
          ))}
        </div>
        <div className="control-bar">
          <div className="control-bar-inner">
            <span className="section-body">Control bar</span>
            <button className="pill-button" type="button">
              Add widget
            </button>
            <button className="pill-button" type="button">
              Arrange
            </button>
            <button className="pill-button" type="button">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workspace;
