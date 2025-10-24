import React from 'react';

type BillingTabProps = {
  onUpgradePlan: ()=>void;
  onOpenFeedback: ()=>void;
};

const BillingTab: React.FC<BillingTabProps> = ({ onUpgradePlan, onOpenFeedback }) => (
  <div className="chatgpt-form" style={{ fontSize:'0.9rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
    <div>
      <div>🛡 Current plan: Free (consumer)</div>
      <div style={{ opacity:0.7 }}>Includes 10 orchestrations per day and baseline guardrails.</div>
    </div>
    <div>📈 Usage this month: 2,400 tokens</div>
    <div className="chatgpt-form-actions" style={{ justifyContent:'flex-start', gap:'0.5rem' }}>
      <button className="chatgpt-button primary" type="button" onClick={onUpgradePlan}>Upgrade plan</button>
      <button className="chatgpt-button" type="button" onClick={onOpenFeedback}>Send feedback</button>
    </div>
  </div>
);
export default BillingTab;
