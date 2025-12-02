import React from "react";

const NotesPanel = () => {
  const notes = [
    { title: "Quick thought", body: "Stream ideas into synced notes." },
    { title: "Design feedback", body: "Capture revisions without leaving canvas." },
    { title: "Meeting notes", body: "Organized notes ready for sharing." },
  ];
  return (
    <div className="space-y-4 text-[var(--text-primary)]">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Workspace Canvas</p>
        <h2 className="text-2xl font-semibold">Notes</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {notes.map((note) => (
          <div
            key={note.title}
            className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 backdrop-blur-[var(--glass-blur)] hover:bg-white/5"
          >
            <div className="font-medium">{note.title}</div>
            <div className="text-sm text-[var(--text-secondary)]">{note.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesPanel;
