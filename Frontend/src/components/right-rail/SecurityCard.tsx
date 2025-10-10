import React from 'react';
import CollapsibleCard from '../primitives/CollapsibleCard';
const SecurityCard: React.FC<{ redactPII:boolean; uiSessionId:string }>=({redactPII,uiSessionId})=> (
  <CollapsibleCard id="security" title="Session Security">
    <ul className="text-sm space-y-1">
      <li>✅ AES-256 at rest & in transit</li>
      <li>🔒 Redaction: {redactPII? 'Enabled':'Disabled'}</li>
      <li>🆔 UI Session: {uiSessionId}</li>
    </ul>
  </CollapsibleCard>
);
export default SecurityCard;
