import React from "react";

const NotesWidget: React.FC = () => {
  return (
    <div className="bg-bgPrimary/5 border border-borderLight/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-semibold mb-3">Notes / Pages / Board / Flow</h2>
      <p className="text-sm text-textPrimary/80">Capture quick thoughts, plans, and diagrams in one place.</p>
    </div>
  );
};

export default NotesWidget;
