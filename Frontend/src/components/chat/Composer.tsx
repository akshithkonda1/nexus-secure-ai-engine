import React from 'react';
const Composer: React.FC<{ onSend:(text:string)=>void; disabled?: boolean }>=({onSend,disabled})=> {
  const [value,setValue]=React.useState('');
  const submit=()=>{
    const trimmed=value.trim();
    if(!trimmed) return;
    onSend(trimmed);
    setValue('');
  };
  return (
    <form onSubmit={e=>{e.preventDefault(); submit();}} className="chatgpt-composer" aria-label="Message composer">
      <textarea
        value={value}
        name="msg"
        placeholder="Send a secure prompt..."
        onChange={e=>setValue(e.target.value)}
        onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); submit(); } }}
        aria-label="Message"
      />
      <button type="submit" disabled={disabled || value.trim().length===0} className="chatgpt-send">
        Send
      </button>
    </form>
  );
};
export default Composer;
