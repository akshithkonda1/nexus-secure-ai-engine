import React, { useEffect, useMemo, useState } from 'react';
import type { UserProfile } from '../../../state/profile';

type ProfileTabProps = {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile)=>void;
  onClose: ()=>void;
  onDeleteAccount: (feedback: string | null)=>void;
};

const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onProfileChange, onClose, onDeleteAccount }) => {
  const [form,setForm]=useState<UserProfile>(profile);
  const [status,setStatus]=useState<string|null>(null);
  const [deleteStage,setDeleteStage]=useState<'idle'|'confirm'|'feedback'>('idle');
  const [deleteFeedback,setDeleteFeedback]=useState('');
  useEffect(()=>{ setForm(profile); },[profile]);

  const isDirty=useMemo(()=> form.displayName!==profile.displayName || form.email!==profile.email || form.avatarDataUrl!==profile.avatarDataUrl,[form,profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file){ return; }
    setStatus(null);
    const reader=new FileReader();
    reader.onload=()=>{
      setForm((prev)=>({ ...prev, avatarDataUrl: typeof reader.result==='string'? reader.result : prev.avatarDataUrl }));
      setStatus('Preview updated. Remember to save your changes.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setForm((prev)=>({ ...prev, avatarDataUrl: null }));
    setStatus('Profile photo removed.');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if(!isDirty){
      setStatus('No changes to save.');
      return;
    }
    onProfileChange(form);
    setStatus('Changes saved!');
  };

  const handleCancel = () => {
    setForm(profile);
    setStatus('Changes discarded.');
    setDeleteStage('idle');
    setDeleteFeedback('');
    onClose();
  };

  const handleDeleteAccount = () => {
    setDeleteStage('confirm');
    setDeleteFeedback('');
  };

  const handleConfirmDelete = () => {
    setDeleteStage('feedback');
  };

  const handleAbortDelete = () => {
    setDeleteStage('idle');
    setDeleteFeedback('');
  };

  const handleSubmitDelete = () => {
    onDeleteAccount(deleteFeedback.trim() ? deleteFeedback.trim() : null);
    setDeleteStage('idle');
    setDeleteFeedback('');
    setStatus('Account scheduled for deletion.');
    onClose();
  };

  return (
    <div style={{ position:'relative' }}>
      <form className="chatgpt-form" onSubmit={handleSubmit}>
      <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
        {form.avatarDataUrl? (
          <img src={form.avatarDataUrl} alt="Profile preview" style={{ width:56, height:56, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--chatgpt-border-color)' }}/>
        ) : (
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--chatgpt-border-color)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem', fontWeight:600 }}>
            {form.displayName?.[0]?.toUpperCase()||'N'}
          </div>
        )}
        <div>
          <label style={{ display:'block', fontSize:'0.8rem', marginBottom:'0.35rem', opacity:0.7 }}>Profile photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {form.avatarDataUrl && (
            <button type="button" className="chatgpt-button" style={{ marginTop:'0.5rem' }} onClick={handleRemovePhoto}>Remove photo</button>
          )}
        </div>
      </div>
      <div>
        <label style={{ display:'block', fontSize:'0.8rem', marginBottom:'0.35rem', opacity:0.7 }}>Display name</label>
        <input className="chatgpt-input" value={form.displayName} onChange={e=>{ const value=e.target.value; setForm(prev=>({ ...prev, displayName:value })); setStatus(null); }} />
      </div>
      <div>
        <label style={{ display:'block', fontSize:'0.8rem', marginBottom:'0.35rem', opacity:0.7 }}>Email</label>
        <input className="chatgpt-input" value={form.email} onChange={e=>{ const value=e.target.value; setForm(prev=>({ ...prev, email:value })); setStatus(null); }} />
      </div>
      {status && <div style={{ fontSize:'0.75rem', opacity:0.7 }}>{status}</div>}
      <div className="chatgpt-form-actions" style={{ justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
        <button type="button" className="chatgpt-button" onClick={handleCancel}>Cancel</button>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          <button
            type="button"
            className="chatgpt-button"
            style={{ background:'var(--chatgpt-error-bg, #fee2e2)', color:'var(--chatgpt-error-text, #991b1b)' }}
            onClick={handleDeleteAccount}
          >
            Delete account
          </button>
          <button type="submit" className="chatgpt-button primary" disabled={!isDirty}>Save changes</button>
        </div>
      </div>
    </form>
    {deleteStage!=='idle' && (
      <div
        role="dialog"
        aria-modal={true}
        style={{ position:'absolute', inset:0, background:'rgba(15,23,42,0.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', zIndex:5 }}
      >
        {deleteStage==='confirm'? (
          <div style={{ background:'var(--chatgpt-surface, #fff)', color:'inherit', borderRadius:'0.75rem', padding:'1.5rem', maxWidth:'320px', boxShadow:'0 18px 45px -15px rgba(15,23,42,0.55)' }}>
            <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'0.5rem' }}>Delete account?</h3>
            <p style={{ fontSize:'0.85rem', lineHeight:1.5, marginBottom:'1rem' }}>This action will remove your Nexus workspace access and cannot be undone.</p>
            <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end', flexWrap:'wrap' }}>
              <button type="button" className="chatgpt-button" onClick={handleAbortDelete}>Keep account</button>
              <button
                type="button"
                className="chatgpt-button"
                style={{ background:'var(--chatgpt-error-bg, #fee2e2)', color:'var(--chatgpt-error-text, #991b1b)' }}
                onClick={handleConfirmDelete}
              >
                Yes, delete
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background:'var(--chatgpt-surface, #fff)', color:'inherit', borderRadius:'0.75rem', padding:'1.5rem', width:'100%', maxWidth:'360px', boxShadow:'0 18px 45px -15px rgba(15,23,42,0.55)' }}>
            <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'0.5rem' }}>Tell us why you're leaving</h3>
            <p style={{ fontSize:'0.85rem', lineHeight:1.5, marginBottom:'0.75rem' }}>Your feedback helps us improve Nexus. Please share anything we should know.</p>
            <textarea
              value={deleteFeedback}
              onChange={(e)=>setDeleteFeedback(e.target.value)}
              rows={4}
              style={{ width:'100%', padding:'0.75rem', borderRadius:'0.5rem', border:'1px solid var(--chatgpt-border-color)', resize:'vertical', fontFamily:'inherit', fontSize:'0.9rem', marginBottom:'1rem' }}
              placeholder="Optional feedback"
            />
            <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end', flexWrap:'wrap' }}>
              <button type="button" className="chatgpt-button" onClick={handleAbortDelete}>Cancel</button>
              <button
                type="button"
                className="chatgpt-button"
                style={{ background:'var(--chatgpt-error-text, #991b1b)', color:'#fff' }}
                onClick={handleSubmitDelete}
              >
                Submit & delete
              </button>
            </div>
          </div>
        )}
      </div>
    )}
    </div>
  );
};

export default ProfileTab;
