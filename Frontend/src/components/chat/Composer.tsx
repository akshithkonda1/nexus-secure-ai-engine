import React from 'react';
const Composer: React.FC<{ onSend:(text:string)=>void; disabled?: boolean }>=({onSend,disabled})=> (
  <form onSubmit={e=>{e.preventDefault(); const input=(e.currentTarget.elements.namedItem('msg') as HTMLInputElement); const v=input?.value?.trim(); if(v){ onSend(v); input.value=''; } }} className="flex gap-2" aria-label="Message composer">
    <input name="msg" placeholder="Type message…" className="flex-1 px-3 py-2 rounded-xl card-token" />
    <button type="submit" disabled={disabled} className="p-3 rounded-xl bg-[rgb(var(--ring))] text-white">Send</button>
  </form>
);
export default Composer;
