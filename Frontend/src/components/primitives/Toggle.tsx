import React from 'react';
const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean)=>void }>=({label,checked,onChange})=> (
  <button onClick={()=>onChange(!checked)} className={`px-3 py-1.5 rounded-xl text-sm ${checked?'muted-token':'card-token'}`}>{label}</button>
);
export default Toggle;
