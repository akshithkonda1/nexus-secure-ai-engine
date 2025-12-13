import React from "react";
import { Outlet, useLocation } from "react-router-dom";

const DynamicWorkspace: React.FC = () => {
  const location = useLocation();

  return (
    <div className="dynamic-workspace" data-route={location.pathname}>
      <div className="workspace-grid" />
      <div className="workspace-panel">
        <Outlet />
      </div>
    </div>
  );
};

export default DynamicWorkspace;
