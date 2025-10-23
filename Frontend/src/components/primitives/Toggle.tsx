import React from 'react';
const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean)=>void }>=({label,checked,onChange})=> (
  <button onClick={()=>onChange(!checked)} className={`chatgpt-toggle ${checked?'is-active':''}`}>{label}</button>
);
export default Toggle;
