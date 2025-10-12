import React from 'react';
import CollapsibleCard from '../primitives/CollapsibleCard';
import Placeholder from '../primitives/Placeholder';
import { formatRelative } from '../../lib/time';
const AuditTrailCard: React.FC<{ events: Array<{ts:number; action:string; meta: any}> }>=({events})=> (
  <CollapsibleCard id="audit" title="Audit trail" subtitle={<span>{events.length} events</span>}>
    {events.length===0? <Placeholder label="No events yet. Your actions will appear here."/> : (
      <ul className="chatgpt-audit-list">
        {events.map((a,i)=> (
          <li key={i} className="chatgpt-audit-item">
            <div className="chatgpt-audit-meta">
              <span>{formatRelative(a.ts)}</span>
              <code>{a.action}</code>
            </div>
            {a.meta && Object.keys(a.meta).length>0 && (
              <pre className="chatgpt-audit-json">{JSON.stringify(a.meta,null,2)}</pre>
            )}
          </li>
        ))}
      </ul>
    )}
  </CollapsibleCard>
);
export default AuditTrailCard;
