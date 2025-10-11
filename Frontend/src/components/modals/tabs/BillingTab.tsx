import React from 'react';
const BillingTab: React.FC = () => (
  <div className="space-y-3 text-sm">
    <div>🛡 Current plan: Free (consumer)</div>
    <div>📈 Usage this month: 2,400 tokens</div>
    <div className="flex justify-end"><button className="px-3 py-2 rounded-xl card-token">Upgrade plan</button></div>
  </div>
);
export default BillingTab;
