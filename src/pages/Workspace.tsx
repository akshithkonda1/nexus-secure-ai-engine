import React from "react";
import WorkspaceShell from "../components/workspace/WorkspaceShell";

const Workspace: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
      <WorkspaceShell />
    </div>
  );
};

export default Workspace;
