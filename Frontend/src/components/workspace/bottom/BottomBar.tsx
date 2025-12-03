import React from "react";

const BottomBar: React.FC = () => {
  return (
    <div className="w-full bg-bgPrimary/5 border border-borderLight/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col gap-2 text-textPrimary/90 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold">Workspace OS Bar</p>
          <p className="text-sm text-textPrimary/70">Always available controls and status live here.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button className="rounded-xl border border-borderLight/15 bg-bgPrimary/5 px-4 py-2 font-medium text-textPrimary/90 transition hover:border-borderLight/30 hover:bg-bgPrimary/10">Overview</button>
          <button className="rounded-xl border border-borderLight/15 bg-bgPrimary/5 px-4 py-2 font-medium text-textPrimary/90 transition hover:border-borderLight/30 hover:bg-bgPrimary/10">Quick Action</button>
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
