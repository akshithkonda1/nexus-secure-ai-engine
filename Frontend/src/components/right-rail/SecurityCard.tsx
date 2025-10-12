import React from 'react';
import CollapsibleCard from '../primitives/CollapsibleCard';
const SecurityCard: React.FC<{ redactPII:boolean; uiSessionId:string }>=({redactPII,uiSessionId})=> (
  <CollapsibleCard id="security" title="Session security">
    <ul className="chatgpt-security-list">
      <li>✅ AES-256 at rest &amp; in transit</li>
      <li>🔒 Redaction: {redactPII? 'Enabled':'Disabled'}</li>
      <li>🆔 UI Session: {uiSessionId}</li>
    </ul>
  </CollapsibleCard>
);
export default SecurityCard;
