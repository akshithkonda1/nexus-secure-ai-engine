import React from "react";

const NotesPanel: React.FC = () => {
  return (
    <div className="space-y-4 text-white">
      <div className="text-2xl font-semibold tracking-tight">Notes</div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
        <p className="text-white/70">Quick capture and pinned snippets.</p>
        <textarea
          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          placeholder="Type a quick note for the workspace..."
          rows={4}
        ></textarea>
      </div>
    </div>
  );
};

export default NotesPanel;
