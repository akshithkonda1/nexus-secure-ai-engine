import React from "react";

const ToronWidget: React.FC = () => {
  return (
    <div className="bg-bgPrimary/5 border border-borderLight/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-semibold mb-3">Toron</h2>
      <p className="text-sm text-textPrimary/80">
        Review Toron activity and manage secure sessions.
      </p>
    </div>
  );
};

export default ToronWidget;
