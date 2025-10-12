import React, { Suspense, useMemo, useState } from 'react';
import Card from '../primitives/Card';
const ProfileTab = React.lazy(()=> import('./tabs/ProfileTab'));
const BillingTab = React.lazy(()=> import('./tabs/BillingTab'));
const ProfileModal: React.FC<{ open:boolean; onClose: ()=>void }>=({open,onClose})=>{
  const [tab,setTab]=useState<'profile'|'billing'>('profile');
  const Title = useMemo(() => ({ profile: 'Profile & Settings', billing: 'Plan & Billing' }[tab]), [tab]);
  if(!open) return null;
  return (
    <div className="chatgpt-modal-overlay" role="dialog" aria-modal onClick={onClose}>
      <div className="chatgpt-modal-panel" onClick={e=>e.stopPropagation()}>
        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
            <div style={{ fontWeight:600 }}>{Title}</div>
            <button className="chatgpt-modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
          <div className="chatgpt-modal-tabs">
            <button onClick={()=>setTab('profile')} onMouseEnter={()=>import('./tabs/ProfileTab')} onFocus={()=>import('./tabs/ProfileTab')} className={`chatgpt-modal-tab ${tab==='profile'?'is-active':''}`}>Profile</button>
            <button onClick={()=>setTab('billing')} onMouseEnter={()=>import('./tabs/BillingTab')} onFocus={()=>import('./tabs/BillingTab')} className={`chatgpt-modal-tab ${tab==='billing'?'is-active':''}`}>Plan & Billing</button>
          </div>
          <Suspense fallback={<div style={{ fontSize:'0.85rem', opacity:0.6 }}>Loading…</div>}>
            {tab==='profile'? <ProfileTab/> : <BillingTab/>}
          </Suspense>
        </Card>
      </div>
    </div>
  );
};
export default ProfileModal;
