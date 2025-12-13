const historyItems = [
  { id: "h1", title: "Toron branch created", detail: "New branch for compliance Q1." },
  { id: "h2", title: "Workspace published", detail: "Shared with governance squad." },
  { id: "h3", title: "Theme updated", detail: "Dark mode set for evening review." },
];

function History() {
  return (
    <div className="page">
      <div className="glass-panel hero">
        <div>
          <p className="section-body">History</p>
          <h1>Review actions without trapping routes.</h1>
        </div>
        <p className="section-body">Each entry is contextual and minimal. Navigate freely without state leakage.</p>
      </div>
      <div className="glass-panel section-card">
        <div className="simple-list">
          {historyItems.map((item) => (
            <div key={item.id} className="simple-item">
              <h3 className="section-title">{item.title}</h3>
              <p className="section-body">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default History;
