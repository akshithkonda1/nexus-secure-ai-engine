import React from 'react';
const BillingTab: React.FC<{ onUpgradePlan: ()=>void }> = ({ onUpgradePlan }) => (
  <div className="chatgpt-form" style={{ fontSize:'0.9rem' }}>
    <div>🛡 Current plan: Free (consumer)</div>
    <div>📈 Usage this month: 2,400 tokens</div>
    <div className="chatgpt-form-actions">
      <button className="chatgpt-button primary" type="button" onClick={onUpgradePlan}>Upgrade plan</button>
    </div>
  </div>
);
export default BillingTab;
