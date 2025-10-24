import React, { Suspense, useMemo, useState } from 'react';
import Card from '../primitives/Card';
import type { UserProfile } from '../../state/profile';
const ProfileTab = React.lazy(()=> import('./tabs/ProfileTab'));
const BillingTab = React.lazy(()=> import('./tabs/BillingTab'));
const SystemFeedbackTab = React.lazy(()=> import('./tabs/SystemFeedbackTab'));
type ProfileModalProps = {
  open: boolean;
  onClose: ()=>void;
  profile: UserProfile;
  onProfileChange: (profile: UserProfile)=>void;
  onDeleteAccount: (feedback: string | null)=>void;
  onUpgradePlan: ()=>void;
};
const ProfileModal: React.FC<ProfileModalProps>=({open,onClose,profile,onProfileChange,onDeleteAccount,onUpgradePlan})=>{
  const [tab,setTab]=useState<'profile'|'billing'|'feedback'>('profile');
  const Title = useMemo(() => ({ profile: 'Profile & Settings', billing: 'Plan & Billing', feedback: 'System Feedback' }[tab]), [tab]);
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
            <button onClick={()=>setTab('feedback')} onMouseEnter={()=>import('./tabs/SystemFeedbackTab')} onFocus={()=>import('./tabs/SystemFeedbackTab')} className={`chatgpt-modal-tab ${tab==='feedback'?'is-active':''}`}>System Feedback</button>
          </div>
          <Suspense fallback={<div style={{ fontSize:'0.85rem', opacity:0.6 }}>Loading…</div>}>
            {tab==='profile'? (
              <ProfileTab
                profile={profile}
                onProfileChange={onProfileChange}
                onClose={onClose}
                onDeleteAccount={onDeleteAccount}
              />
            ) : tab==='billing'? (
              <BillingTab
                onUpgradePlan={onUpgradePlan}
                onOpenFeedback={()=>setTab('feedback')}
              />
            ) : (
              <SystemFeedbackTab/>
            )}
          </Suspense>
        </Card>
      </div>
    </div>
  );
};
export default ProfileModal;
