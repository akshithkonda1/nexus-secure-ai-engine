import React from 'react';

const NotesPanel: React.FC = () => {
  return (
    <div className="space-y-4 text-white">
      <div>
        <h3 className="text-2xl font-semibold">Notes</h3>
        <p className="text-white/70">Lightweight scratchpad for quick capture.</p>
      </div>
      <textarea
        className="w-full min-h-[200px] rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
        placeholder="Type your notes here..."
      />
    </div>
  );
};

export default NotesPanel;
