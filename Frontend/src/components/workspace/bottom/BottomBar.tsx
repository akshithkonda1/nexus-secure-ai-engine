import React from "react";

const BottomBar: React.FC = () => {
  return (
    <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col gap-2 text-white/90 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold">Workspace OS Bar</p>
          <p className="text-sm text-white/70">Always available controls and status live here.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-medium text-white/90 transition hover:border-white/30 hover:bg-white/10">Overview</button>
          <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-medium text-white/90 transition hover:border-white/30 hover:bg-white/10">Quick Action</button>
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
