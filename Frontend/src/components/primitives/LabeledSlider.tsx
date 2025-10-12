import React from 'react';
const LabeledSlider: React.FC<{ label: string; value: number; onChange: (v:number)=>void; min:number; max:number; step:number }>=({label,value,onChange,min,max,step})=> (
  <div>
    <label className="chatgpt-slider-label">{label}</label>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat((e.target as HTMLInputElement).value))} style={{ width:'100%', marginTop:'0.35rem' }} />
    <div className="chatgpt-slider-value">{value.toFixed(2)}</div>
  </div>
);
export default LabeledSlider;
