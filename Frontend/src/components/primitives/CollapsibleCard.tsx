import React, { useState } from 'react';
import Card from './Card';
const CollapsibleCard: React.FC<{ id: string; title: string; subtitle?: React.ReactNode; icon?: React.ReactNode; children: React.ReactNode }>=({id,title,subtitle,icon,children})=>{
  const [collapsed,setCollapsed]=useState(false);
  return (
    <Card>
      <button className="chatgpt-collapsible-header" onClick={()=>setCollapsed(c=>!c)} aria-expanded={!collapsed} aria-controls={`${id}-content`}>
        <span className="flex items-center gap-2">{icon}<span className="chatgpt-collapsible-title">{title}</span></span>
        <span className="chatgpt-collapsible-meta">{subtitle}<span>{collapsed?'Show':'Hide'}</span></span>
      </button>
      <div id={`${id}-content`} className={`mt-3 ${collapsed?'hidden':'block'}`}>{children}</div>
    </Card>
  );
};
export default CollapsibleCard;
