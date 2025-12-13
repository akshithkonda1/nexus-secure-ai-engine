const documents = [
  { id: "d1", title: "Trust charter", summary: "Defines transparency principles for all interfaces." },
  { id: "d2", title: "Workspace handbook", summary: "How to keep artifacts aligned and visible." },
  { id: "d3", title: "ALOE reference", summary: "Quick guide to Align, Link, Observe, Elevate." },
];

function Documents() {
  return (
    <div className="page">
      <div className="glass-panel hero">
        <div>
          <p className="section-body">Documents</p>
          <h1>Reference the material without leaving Toron.</h1>
        </div>
        <p className="section-body">Lightweight access to the essentials. No persistence beyond what is needed.</p>
      </div>
      <div className="glass-panel section-card">
        <div className="simple-list">
          {documents.map((doc) => (
            <div key={doc.id} className="simple-item">
              <h3 className="section-title">{doc.title}</h3>
              <p className="section-body">{doc.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Documents;
