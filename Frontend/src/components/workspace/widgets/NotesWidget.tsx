import React from "react";

const NotesWidget: React.FC = () => {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-semibold mb-3">Notes / Pages / Board / Flow</h2>
      <p className="text-sm text-white/80">Capture quick thoughts, plans, and diagrams in one place.</p>
    </div>
  );
};

export default NotesWidget;
