import React from 'react';
import CollapsibleCard from '../primitives/CollapsibleCard';
import Placeholder from '../primitives/Placeholder';
import { formatRelative } from '../../lib/time';
const AuditTrailCard: React.FC<{ events: Array<{ts:number; action:string; meta: any}> }>=({events})=> (
  <CollapsibleCard id="audit" title="Audit trail" subtitle={<span className="text-xs" style={{color:'rgba(0,0,0,.5)'}}>{events.length} events</span>}>
    {events.length===0? <Placeholder label="No events yet. Your actions will appear here."/> : (
      <ul className="divide-y max-h-56 overflow-auto" style={{ borderColor: 'rgb(var(--border))' }}>
        {events.map((a,i)=> (
          <li key={i} className="py-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs w-24" style={{ color: 'rgba(0,0,0,.5)' }}>{formatRelative(a.ts)}</span>
              <code className="text-xs rounded px-1.5 py-0.5 card-token">{a.action}</code>
            </div>
            {a.meta && Object.keys(a.meta).length>0 && (
              <pre className="mt-1 text-xs rounded p-2 overflow-auto max-h-28 card-token">{JSON.stringify(a.meta,null,2)}</pre>
            )}
          </li>
        ))}
      </ul>
    )}
  </CollapsibleCard>
);
export default AuditTrailCard;
