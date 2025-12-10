import React from "react";

import SimDashboardCard from "@/features/sim/SimDashboardCard";
import { sampleMetrics } from "@/features/sim/sampleData";

const SimDashboard: React.FC = () => {
  const { metrics, warRoom } = sampleMetrics;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Toron v2.5H+ Simulation</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">SIM Control Dashboard</h1>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/50 dark:text-green-200">
          Offline
        </span>
      </div>
      <SimDashboardCard title="Simulation Metrics" metrics={metrics} recommendation={warRoom.recommendation} />
      <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-200">
        All values are synthetic and deterministic to ensure CI stability. The dashboard mirrors the JSON output of the SIM
        reporter (`sim/metrics.json`) and the war-room summary (`sim/war_room_summary.json`).
      </div>
    </div>
  );
};

export default SimDashboard;
