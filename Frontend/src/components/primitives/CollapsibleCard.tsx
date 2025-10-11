import React, { useState } from 'react';
import Card from './Card';
const CollapsibleCard: React.FC<{ id: string; title: string; subtitle?: React.ReactNode; icon?: React.ReactNode; children: React.ReactNode }>=({id,title,subtitle,icon,children})=>{
  const [collapsed,setCollapsed]=useState(false);
  return (
    <Card>
      <button className="w-full flex items-center justify-between text-left" onClick={()=>setCollapsed(c=>!c)} aria-expanded={!collapsed} aria-controls={`${id}-content`}>
        <span className="flex items-center gap-2">{icon}<span className="text-sm font-semibold">{title}</span></span>
        <span className="flex items-center gap-3 text-xs" style={{ color: 'rgba(0,0,0,.5)' }}>{subtitle}<span>{collapsed?'Show':'Hide'}</span></span>
      </button>
      <div id={`${id}-content`} className={`mt-3 ${collapsed?'hidden':'block'}`}>{children}</div>
    </Card>
  );
};
export default CollapsibleCard;
