import React from "react";
import DynamicWorkspace from "./center/DynamicWorkspace";
import Quadrants from "./Quadrants";
import OSBar from "./osbar/OSBar";

const WorkspaceSurface: React.FC = () => {
  return (
    <div className="workspace-surface">
      <Quadrants />
      <OSBar />
      <DynamicWorkspace />
    </div>
  );
};

export default WorkspaceSurface;
