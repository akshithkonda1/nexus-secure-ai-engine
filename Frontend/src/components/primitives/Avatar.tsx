import React from 'react';
const Avatar: React.FC<{ image?: string; name?: string; size?: number }>=({image,name,size=28})=>{
  const initials=(name||'?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();
  return image? (<img src={image} alt={name} style={{width:size,height:size,borderRadius:9999,objectFit:'cover',border:'1px solid rgb(var(--border))'}}/>):(
    <div style={{width:size,height:size,borderRadius:9999, backgroundColor:'rgb(var(--card))', color:'rgb(var(--fg))', border:'1px solid rgb(var(--border))', display:'grid', placeItems:'center', fontSize:Math.max(10,Math.floor(size*0.4)), fontWeight:700}} title={name}>{initials}</div>
  );
};
export default Avatar;
