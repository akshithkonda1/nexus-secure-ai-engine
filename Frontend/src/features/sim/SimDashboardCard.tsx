import React from "react";

interface MetricRowProps {
  label: string;
  value: string | number;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1 text-sm text-gray-900 dark:text-gray-100">
    <span className="font-medium text-gray-600 dark:text-gray-300">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

interface SimDashboardCardProps {
  title: string;
  metrics: Record<string, string | number>;
  recommendation: string;
}

export const SimDashboardCard: React.FC<SimDashboardCardProps> = ({ title, metrics, recommendation }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">{title}</h3>
    <div className="mt-2 divide-y divide-gray-200 dark:divide-gray-800">
      {Object.entries(metrics).map(([label, value]) => (
        <MetricRow key={label} label={label.replace(/_/g, " ").toUpperCase()} value={value} />
      ))}
    </div>
    <div className="mt-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
      <p className="font-semibold">War-Room Recommendation</p>
      <p>{recommendation}</p>
    </div>
  </div>
);

export default SimDashboardCard;
