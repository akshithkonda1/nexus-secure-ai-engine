import React, { Suspense, useMemo, useState } from 'react';
import Card from '../primitives/Card';
const ProfileTab = React.lazy(()=> import('./tabs/ProfileTab'));
const BillingTab = React.lazy(()=> import('./tabs/BillingTab'));
const ProfileModal: React.FC<{ open:boolean; onClose: ()=>void }>=({open,onClose})=>{
  const [tab,setTab]=useState<'profile'|'billing'>('profile');
  const Title = useMemo(() => ({ profile: 'Profile & Settings', billing: 'Plan & Billing' }[tab]), [tab]);
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative w-[600px] max-w-[95vw]">
        <Card>
          <div className="flex items-center gap-2 mb-3"><div className="font-semibold">{Title}</div><button className="ml-auto p-2 rounded-xl card-token" onClick={onClose} aria-label="Close">✕</button></div>
          <div className="flex gap-2 mb-3">
            <button onClick={()=>setTab('profile')} onMouseEnter={()=>import('./tabs/ProfileTab')} onFocus={()=>import('./tabs/ProfileTab')} className={`px-3 py-2 rounded-xl text-sm ${tab==='profile'?'muted-token':'card-token'}`}>Profile</button>
            <button onClick={()=>setTab('billing')} onMouseEnter={()=>import('./tabs/BillingTab')} onFocus={()=>import('./tabs/BillingTab')} className={`px-3 py-2 rounded-xl text-sm ${tab==='billing'?'muted-token':'card-token'}`}>Plan & Billing</button>
          </div>
          <Suspense fallback={<div className="text-sm opacity-70">Loading…</div>}>
            {tab==='profile'? <ProfileTab/> : <BillingTab/>}
          </Suspense>
        </Card>
      </div>
    </div>
  );
};
export default ProfileModal;
