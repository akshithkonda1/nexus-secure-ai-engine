import React from "react";

const ConnectionsWidget: React.FC = () => {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-semibold mb-3">Connections</h2>
      <p className="text-sm text-white/80">
        Link your services and keep your workspace in sync.
      </p>
    </div>
  );
};

export default ConnectionsWidget;
