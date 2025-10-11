import React from 'react';
const LabeledSlider: React.FC<{ label: string; value: number; onChange: (v:number)=>void; min:number; max:number; step:number }>=({label,value,onChange,min,max,step})=> (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat((e.target as HTMLInputElement).value))} className="w-full mt-2" />
    <div className="text-xs" style={{ color: 'rgba(0,0,0,.5)' }}>{value.toFixed(2)}</div>
  </div>
);
export default LabeledSlider;
